/**
 * EudrCheckFeature.tsx - Enhanced Triple Check System
 * 
 * EUDR Verification Flow Component with Dual-Layer Verification:
 * - Layer 1: JRC EU Standard (European Satellite Data)
 * - Layer 2: VN Forest Law (Vietnam Forest Protection)
 * 
 * 4-State Risk Matrix:
 * - SAFE (Green): No overlap with either zone
 * - VIOLATION (Red): Overlaps BOTH zones
 * - WARNING (Yellow): Overlaps JRC only
 * - LEGAL_RISK (Orange): Overlaps VN Forest only
 */

import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import type { Feature, Polygon as GeoPolygon, FeatureCollection } from 'geojson';
import {
    Shield, ShieldCheck, ShieldX, ShieldAlert,
    AlertTriangle, Check, X, RotateCcw, Download, Share2,
    MapPin, Loader2, Pencil, Undo2, TreePine, AlertOctagon,
    CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import {
    generateMockJRCZone,
    generateMockVNForestZone,
    getMockZones,
    getZoneCenter,
    zoneToLeafletCoords,
    calculateOverlapArea,
    JRC_ZONE_STYLE,
    VN_FOREST_STYLE,
    DEFAULT_CENTER,
    MAX_FARM_AREA_HA
} from '../../data/mockForestData';

// ═══════════════════════════════════════════════════════════════════════
// TYPES - 4-State Risk Matrix
// ═══════════════════════════════════════════════════════════════════════

type RiskStatus =
    | 'drawing'      // User is drawing polygon
    | 'scanning'     // Animation state during verification
    | 'safe'         // GREEN - No overlap
    | 'violation'    // RED - Overlaps BOTH zones
    | 'warning'      // YELLOW - Overlaps JRC only
    | 'legal_risk';  // ORANGE - Overlaps VN Forest only

interface EudrState {
    status: RiskStatus;
    userPolygon: [number, number][] | null;
    // JRC Zone overlap
    jrcOverlap: boolean;
    jrcOverlapAreaM2: number;
    jrcOverlapPolygon: [number, number][] | null;
    // VN Forest overlap
    vnOverlap: boolean;
    vnOverlapAreaM2: number;
    vnOverlapPolygon: [number, number][] | null;
    // User polygon stats
    userAreaM2: number;
    userAreaHa: number;
    // Validation
    hasKinks: boolean;
    kinksMessage: string;
}

interface EudrCheckFeatureProps {
    onComplete?: (status: RiskStatus, geojson: FeatureCollection) => void;
    onCancel?: () => void;
    farmerName?: string;
    farmId?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// LEAFLET FIXES & ICONS
// ═══════════════════════════════════════════════════════════════════════

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// GPS marker icon
const gpsIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF94" stroke-width="3">
      <circle cx="12" cy="12" r="10" fill="#000000" opacity="0.8"/>
      <circle cx="12" cy="12" r="3" fill="#00FF94"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Zone label icon creator
const createZoneLabelIcon = (text: string, bgColor: string, borderColor: string) => new L.DivIcon({
    className: 'zone-label-icon',
    html: `
    <div style="
      background: ${bgColor};
      color: white;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: bold;
      white-space: nowrap;
      border: 2px solid ${borderColor};
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      ${text}
    </div>
  `,
    iconSize: [160, 30],
    iconAnchor: [80, 15],
});

// Numbered point marker
const createPointIcon = (number: number, isFirst: boolean) => new L.DivIcon({
    className: 'point-marker',
    html: `
    <div style="
      width: ${isFirst ? 32 : 24}px;
      height: ${isFirst ? 32 : 24}px;
      background: ${isFirst ? '#FFD700' : '#00FF94'};
      border: 3px solid #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${isFirst ? 12 : 10}px;
      color: #000;
      box-shadow: 0 0 10px ${isFirst ? '#FFD700' : '#00FF94'};
      ${isFirst ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
    ">${number}</div>
  `,
    iconSize: [isFirst ? 32 : 24, isFirst ? 32 : 24],
    iconAnchor: [isFirst ? 16 : 12, isFirst ? 16 : 12],
});

// ═══════════════════════════════════════════════════════════════════════
// MAP HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const DrawingHandler: React.FC<{
    isDrawing: boolean;
    onAddPoint: (latlng: [number, number]) => void;
}> = ({ isDrawing, onAddPoint }) => {
    useMapEvents({
        click(e) {
            if (isDrawing) {
                onAddPoint([e.latlng.lat, e.latlng.lng]);
            }
        },
    });
    return null;
};

const MapCenterTracker: React.FC<{
    onCenterChange: (center: [number, number]) => void;
}> = ({ onCenterChange }) => {
    const map = useMap();

    useEffect(() => {
        const updateCenter = () => {
            const center = map.getCenter();
            onCenterChange([center.lat, center.lng]);
        };

        updateCenter();
        map.on('moveend', updateCenter);
        return () => { map.off('moveend', updateCenter); };
    }, [map, onCenterChange]);

    return null;
};

// ═══════════════════════════════════════════════════════════════════════
// RADAR SCANNER COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const RadarScanner: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-[1000] pointer-events-none overflow-hidden">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Radar sweep */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="w-[150%] h-[150%] rounded-full"
                    style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 255, 148, 0.4) 60deg, transparent 120deg)',
                        animation: 'radarSweep 2s linear infinite',
                    }}
                />
            </div>

            {/* Concentric circles */}
            {[1, 2, 3].map(i => (
                <div
                    key={i}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500/30"
                    style={{
                        width: `${i * 33}%`,
                        height: `${i * 33}%`,
                        animation: `pulse ${1 + i * 0.3}s ease-in-out infinite`,
                    }}
                />
            ))}

            {/* Center crosshair */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 border-2 border-green-400 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
            </div>

            {/* Scanning text */}
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center">
                <p className="text-green-400 text-lg font-bold animate-pulse">
                    Đang quét dữ liệu EUDR...
                </p>
                <p className="text-white/60 text-sm mt-1">
                    Đối chiếu JRC + Rừng VN
                </p>
            </div>

            <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// CONFETTI COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const Confetti: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    if (!isActive) return null;

    const colors = ['#00FF94', '#FFD700', '#00CC77', '#FF6B6B', '#4ECDC4'];

    return (
        <div className="fixed inset-0 z-[1001] pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-10px',
                        background: colors[i % colors.length],
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${Math.random() * 360}deg)`,
                        animation: `confettiFall ${2 + Math.random() * 2}s ease-out forwards`,
                        animationDelay: `${Math.random() * 0.5}s`,
                    }}
                />
            ))}
            <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// CHECKLIST ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const ChecklistItem: React.FC<{
    label: string;
    passed: boolean;
    overlapM2?: number;
}> = ({ label, passed, overlapM2 }) => (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${passed ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
        <div className="flex items-center gap-2">
            {passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
                <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white text-sm font-medium">{label}</span>
        </div>
        <span className={`text-xs font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? 'Hợp lệ' : overlapM2 ? `Lấn ${overlapM2.toFixed(0)}m²` : 'Vi phạm'}
        </span>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const EudrCheckFeature: React.FC<EudrCheckFeatureProps> = ({
    onComplete,
    onCancel,
    farmerName = 'Nông dân',
    farmId = 'FARM_001'
}) => {
    const uniqueId = useId();
    const [isMounted, setIsMounted] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);

    // Drawing state
    const [points, setPoints] = useState<[number, number][]>([]);
    const [isDrawingMode, setIsDrawingMode] = useState(true);
    const [isPolygonClosed, setIsPolygonClosed] = useState(false);

    // Verification state
    const [state, setState] = useState<EudrState>({
        status: 'drawing',
        userPolygon: null,
        jrcOverlap: false,
        jrcOverlapAreaM2: 0,
        jrcOverlapPolygon: null,
        vnOverlap: false,
        vnOverlapAreaM2: 0,
        vnOverlapPolygon: null,
        userAreaM2: 0,
        userAreaHa: 0,
        hasKinks: false,
        kinksMessage: '',
    });

    // Mock zones - generated based on map center
    const [mockJRCZone, setMockJRCZone] = useState<Feature<GeoPolygon>>(() =>
        generateMockJRCZone(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
    );
    const [mockVNZone, setMockVNZone] = useState<Feature<GeoPolygon>>(() =>
        generateMockVNForestZone(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
    );
    const [zonesInitialized, setZonesInitialized] = useState(false);

    // Mount effect
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => { clearTimeout(timer); setIsMounted(false); };
    }, []);

    // Update zones when map center changes (only once on initial load)
    const handleCenterChange = useCallback((center: [number, number]) => {
        setMapCenter(center);
        if (!zonesInitialized) {
            const zones = getMockZones(center[0], center[1]);
            setMockJRCZone(zones.jrcZone);
            setMockVNZone(zones.vnZone);
            setZonesInitialized(true);
        }
    }, [zonesInitialized]);

    // ═══════════════════════════════════════════════════════════════════
    // KINKS VALIDATION (Real-time)
    // ═══════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (points.length >= 4) {
            try {
                // Create closed polygon for kinks check
                const coords = [...points, points[0]].map(p => [p[1], p[0]]);
                const polygon = turf.polygon([coords]);
                const kinks = turf.kinks(polygon);

                if (kinks.features.length > 0) {
                    setState(prev => ({
                        ...prev,
                        hasKinks: true,
                        kinksMessage: 'Hình vẽ bị lỗi cắt chéo! Vẽ lại đi bác ơi 🙏',
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        hasKinks: false,
                        kinksMessage: '',
                    }));
                }
            } catch (e) {
                // Polygon not valid yet
            }
        } else {
            setState(prev => ({ ...prev, hasKinks: false, kinksMessage: '' }));
        }
    }, [points]);

    // ═══════════════════════════════════════════════════════════════════
    // DRAWING HANDLERS
    // ═══════════════════════════════════════════════════════════════════

    const handleAddPoint = useCallback((latlng: [number, number]) => {
        if (isPolygonClosed) return;

        setPoints(prev => {
            // Check if clicking near first point to close
            if (prev.length >= 3) {
                const first = prev[0];
                const dist = Math.sqrt(
                    Math.pow(latlng[0] - first[0], 2) + Math.pow(latlng[1] - first[1], 2)
                );
                if (dist < 0.0005) {
                    setIsPolygonClosed(true);
                    return prev;
                }
            }
            return [...prev, latlng];
        });
    }, [isPolygonClosed]);

    const handleUndo = useCallback(() => {
        setPoints(prev => prev.slice(0, -1));
        setIsPolygonClosed(false);
    }, []);

    const handleReset = useCallback(() => {
        setPoints([]);
        setIsPolygonClosed(false);
        setState({
            status: 'drawing',
            userPolygon: null,
            jrcOverlap: false,
            jrcOverlapAreaM2: 0,
            jrcOverlapPolygon: null,
            vnOverlap: false,
            vnOverlapAreaM2: 0,
            vnOverlapPolygon: null,
            userAreaM2: 0,
            userAreaHa: 0,
            hasKinks: false,
            kinksMessage: '',
        });
    }, []);

    const handleComplete = useCallback(() => {
        if (points.length >= 3) {
            setIsPolygonClosed(true);
        }
    }, [points.length]);

    // ═══════════════════════════════════════════════════════════════════
    // TRIPLE CHECK ALGORITHM (CORE LOGIC)
    // ═══════════════════════════════════════════════════════════════════

    const runEUDRCheck = useCallback(async () => {
        if (points.length < 3 || state.hasKinks) return;

        // Start scanning animation
        setState(prev => ({ ...prev, status: 'scanning' }));

        // Simulate scanning delay (3 seconds for demo effect)
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            // Create user polygon (GeoJSON format: [lng, lat])
            const userCoords = [...points, points[0]].map(p => [p[1], p[0]] as [number, number]);
            const userPolygon = turf.polygon([userCoords]);
            const userAreaM2 = turf.area(userPolygon);
            const userAreaHa = userAreaM2 / 10000;

            // ═══════════════════════════════════════════════════════════════
            // STEP 0: Area Limit Check (4ha max for smallholder farms)
            // ═══════════════════════════════════════════════════════════════
            if (userAreaHa > MAX_FARM_AREA_HA) {
                setState(prev => ({
                    ...prev,
                    status: 'drawing',
                    hasKinks: true,
                    kinksMessage: `Diện tích quá lớn (${userAreaHa.toFixed(2)} ha > 4ha). Vui lòng tách nhỏ lô đất.`,
                    userAreaM2,
                    userAreaHa,
                }));
                return;
            }

            // ════════════════════════════════════════════════════════════
            // STEP A: Check JRC Zone (EU Standard)
            // ════════════════════════════════════════════════════════════
            let jrcOverlap = false;
            let jrcOverlapAreaM2 = 0;
            let jrcOverlapPolygon: [number, number][] | null = null;

            try {
                const jrcIntersection = turf.intersect(
                    turf.featureCollection([userPolygon, mockJRCZone])
                );
                if (jrcIntersection) {
                    jrcOverlap = true;
                    jrcOverlapAreaM2 = turf.area(jrcIntersection);
                    if (jrcIntersection.geometry.type === 'Polygon') {
                        jrcOverlapPolygon = jrcIntersection.geometry.coordinates[0].map(
                            (c: any) => [c[1], c[0]] as [number, number]
                        );
                    }
                }
            } catch (e) {
                console.warn('JRC intersection error:', e);
            }

            // ════════════════════════════════════════════════════════════
            // STEP B: Check VN Forest Zone (Vietnam Law)
            // ════════════════════════════════════════════════════════════
            let vnOverlap = false;
            let vnOverlapAreaM2 = 0;
            let vnOverlapPolygon: [number, number][] | null = null;

            try {
                const vnIntersection = turf.intersect(
                    turf.featureCollection([userPolygon, mockVNZone])
                );
                if (vnIntersection) {
                    vnOverlap = true;
                    vnOverlapAreaM2 = turf.area(vnIntersection);
                    if (vnIntersection.geometry.type === 'Polygon') {
                        vnOverlapPolygon = vnIntersection.geometry.coordinates[0].map(
                            (c: any) => [c[1], c[0]] as [number, number]
                        );
                    }
                }
            } catch (e) {
                console.warn('VN Forest intersection error:', e);
            }

            // ════════════════════════════════════════════════════════════
            // STEP C: Determine Risk Status (4-State Matrix)
            // ════════════════════════════════════════════════════════════
            let status: RiskStatus;

            if (jrcOverlap && vnOverlap) {
                // Overlaps BOTH zones -> VIOLATION (RED)
                status = 'violation';
                if ('vibrate' in navigator) {
                    navigator.vibrate([100, 50, 100, 50, 100]); // Error pattern
                }
            } else if (jrcOverlap && !vnOverlap) {
                // Overlaps JRC only -> WARNING (YELLOW)
                status = 'warning';
                if ('vibrate' in navigator) {
                    navigator.vibrate([100, 100, 100]); // Warning pattern
                }
            } else if (!jrcOverlap && vnOverlap) {
                // Overlaps VN Forest only -> LEGAL_RISK (ORANGE)
                status = 'legal_risk';
                if ('vibrate' in navigator) {
                    navigator.vibrate([100, 100, 100]); // Warning pattern
                }
            } else {
                // No overlap -> SAFE (GREEN)
                status = 'safe';
                if ('vibrate' in navigator) {
                    navigator.vibrate(200); // Success pattern
                }
            }

            setState({
                status,
                userPolygon: points,
                jrcOverlap,
                jrcOverlapAreaM2,
                jrcOverlapPolygon,
                vnOverlap,
                vnOverlapAreaM2,
                vnOverlapPolygon,
                userAreaM2,
                userAreaHa,
                hasKinks: false,
                kinksMessage: '',
            });

        } catch (error) {
            console.error('EUDR verification error:', error);
            setState(prev => ({ ...prev, status: 'drawing' }));
        }
    }, [points, mockJRCZone, mockVNZone, state.hasKinks]);

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT GEOJSON (Enhanced with Triple Check data)
    // ═══════════════════════════════════════════════════════════════════

    const handleExport = useCallback(() => {
        if (!state.userPolygon) return;

        const userCoords = [...state.userPolygon, state.userPolygon[0]].map(p => [p[1], p[0]]);

        // Map status to export result
        const resultMap: Record<RiskStatus, string> = {
            'safe': 'PASS',
            'warning': 'WARN_JRC',
            'legal_risk': 'WARN_VN',
            'violation': 'FAIL_BOTH',
            'drawing': 'PENDING',
            'scanning': 'PENDING',
        };

        const featureCollection: FeatureCollection = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {
                    // App metadata
                    app: 'CoffeeLink',
                    app_ver: 'CoffeeLink_v2.0',
                    device_id: 'WEB_BROWSER',
                    location: 'Chu Pah, Gia Lai',

                    // Farmer info
                    farmer_name: farmerName,
                    farmer_id: farmId,

                    // Verification results
                    eudr_result: resultMap[state.status],
                    check_date: new Date().toISOString(),

                    // JRC check
                    jrc_check: !state.jrcOverlap,
                    jrc_overlap_m2: state.jrcOverlapAreaM2,

                    // VN Forest check
                    vn_check: !state.vnOverlap,
                    vn_overlap_m2: state.vnOverlapAreaM2,

                    // Area stats
                    area_ha: state.userAreaHa.toFixed(4),
                    area_m2: state.userAreaM2.toFixed(2),

                    // Source info
                    verification_source: 'JRC_GFC2020 + VN_Forest_2020',
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [userCoords]
                }
            }]
        };

        // Download file
        const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HoSo_EUDR_${farmId}_${farmerName.replace(/\s/g, '_')}_${Date.now()}.geojson`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Callback
        onComplete?.(state.status, featureCollection);
    }, [state, farmerName, farmId, onComplete]);

    // Share to Zalo (or system share)
    const handleShare = useCallback(async () => {
        if (!state.userPolygon) return;

        const statusMessages: Record<RiskStatus, string> = {
            'safe': `✅ Vườn ${farmerName} ĐẠT CHUẨN EUDR!`,
            'warning': `⚠️ Vườn ${farmerName} CẦN XÁC MINH (Cảnh báo vệ tinh)`,
            'legal_risk': `🟠 Vườn ${farmerName} có RỦI RO PHÁP LÝ VN`,
            'violation': `🛑 Vườn ${farmerName} VI PHẠM NGHIÊM TRỌNG`,
            'drawing': '',
            'scanning': '',
        };

        const shareText = `${statusMessages[state.status]}
📐 Diện tích: ${state.userAreaHa.toFixed(2)} Ha
🇪🇺 JRC: ${state.jrcOverlap ? `Lấn ${state.jrcOverlapAreaM2.toFixed(0)}m²` : 'Hợp lệ'}
🇻🇳 Rừng VN: ${state.vnOverlap ? `Lấn ${state.vnOverlapAreaM2.toFixed(0)}m²` : 'Hợp lệ'}
📅 ${new Date().toLocaleDateString('vi-VN')}
🔗 CoffeeLink Agri-OS`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Kết quả EUDR - CoffeeLink',
                    text: shareText,
                });
            } catch (e) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Đã copy nội dung vào clipboard!');
        }
    }, [state, farmerName]);

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    if (!isMounted) {
        return (
            <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
        );
    }

    // Convert zones to Leaflet coords
    const jrcLeafletCoords = zoneToLeafletCoords(mockJRCZone);
    const vnLeafletCoords = zoneToLeafletCoords(mockVNZone);
    const jrcCenter = getZoneCenter(mockJRCZone);
    const vnCenter = getZoneCenter(mockVNZone);

    // Get current polygon color based on status
    const getPolygonColor = () => {
        switch (state.status) {
            case 'safe': return '#00FF94';
            case 'warning': return '#FBBF24';
            case 'legal_risk': return '#F97316';
            case 'violation': return '#EF4444';
            default: return '#00FF94';
        }
    };

    return (
        <div className="relative h-full w-full">
            {/* Keyframe animations */}
            <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
      `}</style>

            {/* MAP */}
            <MapContainer
                key={`eudr-map-${uniqueId}`}
                center={mapCenter}
                zoom={17}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                dragging={true}
                touchZoom={true}
            >
                <MapCenterTracker onCenterChange={handleCenterChange} />
                <DrawingHandler isDrawing={isDrawingMode && !isPolygonClosed} onAddPoint={handleAddPoint} />

                {/* Base: Satellite Layer */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri"
                    maxZoom={19}
                />

                {/* Layer 1: WMS JRC (Visual only - may have CORS issues) */}
                {/* Commenting out due to potential CORS - using mock zones instead */}
                {/* <TileLayer
                    url="https://ies-ows.jrc.ec.europa.eu/iforce/gfc2020/wms.py?..."
                    opacity={0.5}
                /> */}

                {/* Layer 2: JRC ZONE (Red - East) */}
                <Polygon
                    positions={jrcLeafletCoords}
                    pathOptions={{
                        color: JRC_ZONE_STYLE.strokeColor,
                        weight: JRC_ZONE_STYLE.weight,
                        fillOpacity: 0.25,
                        fillColor: JRC_ZONE_STYLE.fillColor,
                        dashArray: JRC_ZONE_STYLE.dashArray,
                    }}
                />
                <Marker
                    position={jrcCenter}
                    icon={createZoneLabelIcon('🇪🇺 JRC EU ZONE', 'rgba(220, 38, 38, 0.9)', '#FCA5A5')}
                />

                {/* Layer 3: VN FOREST ZONE (Green - North) */}
                <Polygon
                    positions={vnLeafletCoords}
                    pathOptions={{
                        color: VN_FOREST_STYLE.strokeColor,
                        weight: VN_FOREST_STYLE.weight,
                        fillOpacity: 0.25,
                        fillColor: VN_FOREST_STYLE.fillColor,
                        dashArray: VN_FOREST_STYLE.dashArray,
                    }}
                />
                <Marker
                    position={vnCenter}
                    icon={createZoneLabelIcon('🇻🇳 RỪNG VN', 'rgba(22, 163, 74, 0.9)', '#86EFAC')}
                />

                {/* USER DRAWING - Polyline while drawing */}
                {points.length >= 2 && !isPolygonClosed && (
                    <Polyline
                        positions={points}
                        pathOptions={{
                            color: '#00FF94',
                            weight: 3,
                            dashArray: '10, 10',
                            opacity: 0.8,
                        }}
                    />
                )}

                {/* USER POLYGON - When closed */}
                {isPolygonClosed && points.length >= 3 && (
                    <Polygon
                        positions={[...points, points[0]]}
                        pathOptions={{
                            color: getPolygonColor(),
                            weight: 4,
                            fillOpacity: 0.25,
                            fillColor: getPolygonColor(),
                        }}
                    />
                )}

                {/* JRC OVERLAP AREA - Red highlight */}
                {state.jrcOverlapPolygon && state.jrcOverlapPolygon.length > 0 && (
                    <Polygon
                        positions={state.jrcOverlapPolygon}
                        pathOptions={{
                            color: '#DC2626',
                            weight: 4,
                            fillOpacity: 0.5,
                            fillColor: '#DC2626',
                        }}
                    />
                )}

                {/* VN OVERLAP AREA - Orange highlight */}
                {state.vnOverlapPolygon && state.vnOverlapPolygon.length > 0 && (
                    <Polygon
                        positions={state.vnOverlapPolygon}
                        pathOptions={{
                            color: '#F97316',
                            weight: 4,
                            fillOpacity: 0.5,
                            fillColor: '#F97316',
                        }}
                    />
                )}

                {/* Point Markers */}
                {points.map((point, idx) => (
                    <Marker
                        key={`point-${idx}`}
                        position={point}
                        icon={createPointIcon(idx + 1, idx === 0)}
                    />
                ))}

                {/* GPS Marker */}
                <Marker position={mapCenter} icon={gpsIcon} />
            </MapContainer>

            {/* RADAR SCANNER OVERLAY */}
            <RadarScanner isActive={state.status === 'scanning'} />

            {/* CONFETTI on SAFE */}
            <Confetti isActive={state.status === 'safe'} />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* GLASSMORPHIC HEADER */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div
                className="absolute top-4 left-1/2 -translate-x-1/2 px-8 py-3 rounded-3xl flex items-center gap-2 z-[999]"
                style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <h1 className="text-white text-lg font-bold">Kiểm tra EUDR</h1>
            </div>

            {/* COORDINATES DISPLAY - Center of map */}
            {isPolygonClosed && points.length > 0 && (
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[998] pointer-events-none"
                >
                    <div className="text-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mb-2 mx-auto animate-pulse shadow-lg shadow-green-400/50"></div>
                        <div
                            className="px-4 py-2 rounded-2xl"
                            style={{
                                background: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <span className="text-white text-sm font-mono font-bold">
                                {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Area & GPS Info Overlay - Only in drawing mode */}
            {state.status === 'drawing' && points.length === 0 && (
                <div
                    className="absolute bottom-24 left-3 right-3 z-[999] p-4 rounded-xl"
                    style={{
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 100%)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#00FF94' }}>
                                Diện tích & Số cây
                            </p>
                            <p className="text-xl font-black text-white tracking-tight">
                                -- Ha • -- Gốc
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#00FF94' }}>
                                GPS Coordinates
                            </p>
                            <p className="text-xs font-mono font-black text-white">
                                {mapCenter[0].toFixed(4)}°N
                            </p>
                            <p className="text-xs font-mono font-black text-white">
                                {mapCenter[1].toFixed(4)}°E
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={handleReset}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)',
                                border: 'none',
                                color: '#000',
                                boxShadow: '0 0 20px rgba(0, 255, 148, 0.4), 0 4px 12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Khởi Tạo Mới
                        </button>
                        <button
                            onClick={() => setIsDrawingMode(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #064E3B 0%, #000 100%)',
                                border: '2px solid #FFD700',
                                color: '#FFD700',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), 0 4px 12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Vẽ Ranh Giới
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* UI OVERLAYS */}
            {/* ═══════════════════════════════════════════════════════════════════ */}

            {/* KINKS ERROR BANNER */}
            {state.hasKinks && (
                <div className="absolute top-3 left-3 right-3 z-[1000] p-3 rounded-xl bg-red-600/95 border-2 border-red-400 animate-bounce">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
                        <p className="text-white text-sm font-bold">{state.kinksMessage}</p>
                    </div>
                </div>
            )}

            {/* DRAWING MODE CONTROLS */}
            {state.status === 'drawing' && (
                <div
                    className="absolute bottom-3 left-3 right-3 z-[1000] p-4 rounded-xl"
                    style={{
                        background: 'rgba(0, 0, 0, 0.95)',
                        border: '2px solid rgba(0, 255, 148, 0.5)',
                    }}
                >
                    {/* Stats */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-[10px] text-white/50 uppercase font-bold">Điểm</p>
                                <p className="text-lg font-black text-green-400">{points.length}</p>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="text-center">
                                <p className="text-[10px] text-white/50 uppercase font-bold">Trạng thái</p>
                                <p className={`text-sm font-bold ${isPolygonClosed ? 'text-green-400' : 'text-amber-400'}`}>
                                    {isPolygonClosed ? '✓ Đóng' : 'Đang vẽ...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <p className="text-xs text-white/60 mb-3 text-center">
                        {!isPolygonClosed
                            ? points.length < 3
                                ? 'Chạm vào bản đồ để thêm điểm (cần ít nhất 3 điểm)'
                                : 'Chạm vào điểm đầu hoặc nhấn "Hoàn Thành"'
                            : 'Nhấn "QUÉT RỦI RO" để xác thực Triple Check'
                        }
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleUndo}
                            disabled={points.length === 0}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold uppercase disabled:opacity-30"
                        >
                            <Undo2 className="w-4 h-4" /> Hoàn Tác
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={points.length === 0}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase disabled:opacity-30"
                        >
                            <RotateCcw className="w-4 h-4" /> Xóa Hết
                        </button>
                        {!isPolygonClosed ? (
                            <button
                                onClick={handleComplete}
                                disabled={points.length < 3}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold uppercase disabled:opacity-30"
                            >
                                <Check className="w-4 h-4" /> Hoàn Thành
                            </button>
                        ) : (
                            <button
                                onClick={runEUDRCheck}
                                disabled={state.hasKinks}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-xs font-bold uppercase disabled:opacity-30"
                                style={{
                                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                    color: '#000',
                                    boxShadow: '0 0 15px rgba(255, 152, 0, 0.5)',
                                }}
                            >
                                🔍 QUÉT RỦI RO
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* RESULT CARDS - 4 States */}
            {/* ════════════════════════════════════════════════════════════════ */}

            /* SAFE (GREEN) - Modern Glassmorphic Design */
            {state.status === 'safe' && (
                <div
                    className="absolute bottom-20 left-4 right-4 z-[1000] p-6 rounded-3xl animate-in slide-in-from-bottom-10 duration-500"
                    style={{
                        background: 'rgba(0, 40, 20, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(34, 197, 94, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '2px solid rgba(34, 197, 94, 0.5)'
                            }}
                        >
                            <ShieldCheck className="w-8 h-8 text-green-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-xl font-bold mb-1">Trạng thái: HỢP LỆ</h3>
                            <p className="text-white/60 text-sm">Diện tích: {state.userAreaHa.toFixed(1)} ha</p>
                            <p className="text-white/60 text-xs font-mono">Tọa độ: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                        style={{
                            background: 'rgba(34, 197, 94, 0.8)',
                            border: '2px solid rgba(34, 197, 94, 1)'
                        }}
                    >
                        <Download className="w-5 h-5" />
                        Tải Chứng Chỉ
                    </button>
                </div>
            )}

            /* WARNING (YELLOW) - Glassmorphic */
            {state.status === 'warning' && (
                <div
                    className="absolute bottom-20 left-4 right-4 z-[1000] p-6 rounded-3xl animate-in slide-in-from-bottom-10 duration-500"
                    style={{
                        background: 'rgba(60, 40, 0, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(251, 191, 36, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '2px solid rgba(251, 191, 36, 0.5)'
                            }}
                        >
                            <AlertCircle className="w-8 h-8 text-yellow-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-xl font-bold mb-1">Trạng thái: CẢNH BÁO</h3>
                            <p className="text-white/60 text-sm">Diện tích: {state.userAreaHa.toFixed(1)} ha</p>
                            <p className="text-white/60 text-xs font-mono">Tọa độ: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-white/70 text-xs">Phát hiện lấn vùng JRC: {state.jrcOverlapAreaM2.toFixed(0)}m²</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                            style={{
                                background: 'rgba(251, 191, 36, 0.8)',
                                border: '2px solid rgba(251, 191, 36, 1)'
                            }}
                        >
                            <Download className="w-5 h-5" />
                            Tải Chứng Chỉ
                        </button>
                        <button
                            onClick={handleReset}
                            className="py-4 px-4 rounded-2xl bg-white/10 text-white"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            /* LEGAL_RISK (ORANGE) - Glassmorphic */
            {state.status === 'legal_risk' && (
                <div
                    className="absolute bottom-20 left-4 right-4 z-[1000] p-6 rounded-3xl animate-in slide-in-from-bottom-10 duration-500"
                    style={{
                        background: 'rgba(60, 20, 0, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(249, 115, 22, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'rgba(249, 115, 22, 0.2)',
                                border: '2px solid rgba(249, 115, 22, 0.5)'
                            }}
                        >
                            <AlertOctagon className="w-8 h-8 text-orange-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-xl font-bold mb-1">Trạng thái: RỦI RO</h3>
                            <p className="text-white/60 text-sm">Diện tích: {state.userAreaHa.toFixed(1)} ha</p>
                            <p className="text-white/60 text-xs font-mono">Tọa độ: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-white/70 text-xs">Lấn vùng rừng VN: {state.vnOverlapAreaM2.toFixed(0)}m²</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                            style={{
                                background: 'rgba(249, 115, 22, 0.8)',
                                border: '2px solid rgba(249, 115, 22, 1)'
                            }}
                        >
                            <Download className="w-5 h-5" />
                            Tải Chứng Chỉ
                        </button>
                        <button
                            onClick={handleReset}
                            className="py-4 px-4 rounded-2xl bg-white/10 text-white"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            /* VIOLATION (RED) - Glassmorphic */
            {state.status === 'violation' && (
                <div
                    className="absolute bottom-20 left-4 right-4 z-[1000] p-6 rounded-3xl animate-in slide-in-from-bottom-10 duration-500"
                    style={{
                        background: 'rgba(60, 0, 0, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(239, 68, 68, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '2px solid rgba(239, 68, 68, 0.5)'
                            }}
                        >
                            <ShieldX className="w-8 h-8 text-red-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-xl font-bold mb-1">Trạng thái: VI PHẠM</h3>
                            <p className="text-white/60 text-sm">Diện tích: {state.userAreaHa.toFixed(1)} ha</p>
                            <p className="text-white/60 text-xs font-mono">Tọa độ: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</p>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-3 mb-4">
                        <p className="text-white text-xs text-center">⛔ Không thể xuất khẩu - Cần vẽ lại</p>
                    </div>

                    <button
                        onClick={handleReset}
                        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                        style={{
                            background: 'rgba(239, 68, 68, 0.8)',
                            border: '2px solid rgba(239, 68, 68, 1)'
                        }}
                    >
                        <RotateCcw className="w-5 h-5" />
                        Vẽ Lại Vườn
                    </button>
                </div>
            )}
        </div>
    );
};

export default EudrCheckFeature;
