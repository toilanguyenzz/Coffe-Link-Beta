import React, { useId, useRef, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Polyline, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Pencil, Undo2, RotateCcw, Check, X, MapPin, Trash2 } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom GPS Marker Icon
const gpsIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF94" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#000000" opacity="0.8"/>
      <circle cx="12" cy="12" r="3" fill="#00FF94"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Create numbered marker icons with drag indicator
const createNumberedIcon = (number: number, isFirst: boolean, isDraggable: boolean) => {
    const color = isFirst ? '#FFD700' : '#00FF94';
    const size = isFirst ? 36 : 28;
    return new L.DivIcon({
        className: 'custom-numbered-marker',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border: 3px solid #000;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${isFirst ? 14 : 12}px;
                color: #000;
                box-shadow: 0 0 10px ${color}, 0 4px 8px rgba(0,0,0,0.4);
                cursor: ${isDraggable ? 'grab' : 'default'};
                ${isFirst ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
                ${isDraggable ? 'transition: transform 0.15s ease;' : ''}
            ">
                ${number}
            </div>
            ${isDraggable ? `<div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 8px;
                color: white;
                text-shadow: 0 1px 2px black;
            ">⇄</div>` : ''}
        `,
        iconSize: [size, size + (isDraggable ? 8 : 0)],
        iconAnchor: [size / 2, size / 2],
    });
};

// Component to recenter map
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// Drawing event handler component
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

// Draggable marker component
const DraggableMarker: React.FC<{
    position: [number, number];
    index: number;
    isFirst: boolean;
    onDragEnd: (index: number, latlng: [number, number]) => void;
    onRemove: (index: number) => void;
    isEditing: boolean;
}> = ({ position, index, isFirst, onDragEnd, onRemove, isEditing }) => {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker) {
                const latlng = marker.getLatLng();
                onDragEnd(index, [latlng.lat, latlng.lng]);
            }
        },
        contextmenu(e: L.LeafletMouseEvent) {
            e.originalEvent.preventDefault();
            if (isEditing && !isFirst) {
                onRemove(index);
            }
        }
    };

    return (
        <Marker
            ref={markerRef}
            position={position}
            icon={createNumberedIcon(index + 1, isFirst, isEditing)}
            draggable={isEditing}
            eventHandlers={eventHandlers}
        />
    );
};

interface FarmMapEditorProps {
    center: [number, number];
    initialPolygon?: number[][];
    markerPosition: [number, number];
    onSave?: (polygon: number[][]) => void;
    onCancel?: () => void;
}

const FarmMapEditor: React.FC<FarmMapEditorProps> = ({
    center,
    initialPolygon,
    markerPosition,
    onSave,
    onCancel
}) => {
    const uniqueId = useId();
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Drawing state
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [points, setPoints] = useState<[number, number][]>([]);
    const [isPolygonClosed, setIsPolygonClosed] = useState(false);
    const [areaData, setAreaData] = useState<{ hectares: number; squareMeters: number } | null>(null);

    // Initialize with existing polygon if provided
    useEffect(() => {
        if (initialPolygon && initialPolygon.length > 0) {
            // Remove the closing point if it's the same as the first point
            const polygonPoints = initialPolygon.slice(0, -1) as [number, number][];
            setPoints(polygonPoints);
            setIsPolygonClosed(true);
        }
    }, [initialPolygon]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => {
            clearTimeout(timer);
            setIsMounted(false);
        };
    }, []);

    // Calculate area when points change using Turf.js geodesic area calculation
    // This uses the WGS84 ellipsoid for accurate GPS coordinate calculations
    useEffect(() => {
        if (points.length >= 3) {
            try {
                // Create a closed polygon for calculation
                // Turf.js expects [longitude, latitude] format (GeoJSON standard)
                const polygonCoords = [...points, points[0]].map(p => [p[1], p[0]] as [number, number]);
                const polygon = turf.polygon([polygonCoords]);

                // turf.area() returns area in square meters using geodesic calculation
                // This accounts for Earth's curvature for accurate measurements
                const squareMeters = turf.area(polygon);
                const hectares = squareMeters / 10000;

                setAreaData({ hectares, squareMeters });
            } catch (error) {
                console.error('Area calculation error:', error);
                setAreaData(null);
            }
        } else {
            setAreaData(null);
        }
    }, [points]);

    const handleAddPoint = useCallback((latlng: [number, number]) => {
        if (isPolygonClosed) return;

        setPoints(prev => {
            // Check if clicking near the first point to close the polygon
            if (prev.length >= 3) {
                const firstPoint = prev[0];
                const distance = Math.sqrt(
                    Math.pow(latlng[0] - firstPoint[0], 2) +
                    Math.pow(latlng[1] - firstPoint[1], 2)
                );
                // If within ~50 meters (roughly 0.0005 degrees)
                if (distance < 0.0005) {
                    setIsPolygonClosed(true);
                    return prev;
                }
            }
            return [...prev, latlng];
        });
    }, [isPolygonClosed]);

    const handleDragEnd = useCallback((index: number, latlng: [number, number]) => {
        setPoints(prev => {
            const newPoints = [...prev];
            newPoints[index] = latlng;
            return newPoints;
        });
    }, []);

    const handleRemovePoint = useCallback((index: number) => {
        setPoints(prev => prev.filter((_, i) => i !== index));
        if (points.length <= 3) {
            setIsPolygonClosed(false);
        }
    }, [points.length]);

    const handleUndo = useCallback(() => {
        setPoints(prev => prev.slice(0, -1));
        setIsPolygonClosed(false);
    }, []);

    const handleReset = useCallback(() => {
        setPoints([]);
        setIsPolygonClosed(false);
        setAreaData(null);
    }, []);

    const handleComplete = useCallback(() => {
        if (points.length >= 3) {
            setIsPolygonClosed(true);
        }
    }, [points.length]);

    const handleSave = useCallback(() => {
        if (points.length >= 3 && onSave) {
            // Add closing point to create a proper polygon
            const closedPolygon = [...points, points[0]];
            onSave(closedPolygon);
            setIsDrawingMode(false);
        }
    }, [points, onSave]);

    const handleCancel = useCallback(() => {
        if (initialPolygon && initialPolygon.length > 0) {
            const polygonPoints = initialPolygon.slice(0, -1) as [number, number][];
            setPoints(polygonPoints);
            setIsPolygonClosed(true);
        } else {
            setPoints([]);
            setIsPolygonClosed(false);
        }
        setIsDrawingMode(false);
        onCancel?.();
    }, [initialPolygon, onCancel]);

    const startDrawing = useCallback(() => {
        setIsDrawingMode(true);
        setIsPolygonClosed(false);
    }, []);

    if (!isMounted) {
        return (
            <div
                ref={containerRef}
                style={{ height: '100%', width: '100%', backgroundColor: '#064E3B' }}
            />
        );
    }

    // Prepare polygon positions for display
    const polygonPositions = isPolygonClosed && points.length >= 3
        ? [...points, points[0]] as [number, number][]
        : points;

    return (
        <div className="relative h-full w-full">
            {/* Add keyframe animation for pulse effect */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>

            <MapContainer
                key={`farm-map-editor-${uniqueId}`}
                center={center}
                zoom={17}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                dragging={true}
                touchZoom={true}
            >
                <RecenterMap center={center} />
                <DrawingHandler isDrawing={isDrawingMode && !isPolygonClosed} onAddPoint={handleAddPoint} />

                {/* Satellite Tile Layer */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri"
                    maxZoom={19}
                />

                {/* Drawing line (while not closed) */}
                {points.length >= 2 && !isPolygonClosed && (
                    <Polyline
                        positions={points}
                        pathOptions={{
                            color: '#00FF94',
                            weight: 3,
                            dashArray: '10, 10',
                            opacity: 0.8
                        }}
                    />
                )}

                {/* Completed polygon */}
                {isPolygonClosed && points.length >= 3 && (
                    <Polygon
                        positions={polygonPositions}
                        pathOptions={{
                            color: '#00FF94',
                            weight: 4,
                            fillOpacity: 0.25,
                            fillColor: '#00FF94',
                        }}
                    />
                )}

                {/* Point markers */}
                {points.map((point, idx) => (
                    <DraggableMarker
                        key={`point-${idx}`}
                        position={point}
                        index={idx}
                        isFirst={idx === 0}
                        onDragEnd={handleDragEnd}
                        onRemove={handleRemovePoint}
                        isEditing={isDrawingMode}
                    />
                ))}

                {/* User GPS Marker */}
                <Marker position={markerPosition} icon={gpsIcon} />
            </MapContainer>

            {/* Overlay Controls */}
            {!isDrawingMode ? (
                /* View Mode - Edit Button */
                <button
                    onClick={startDrawing}
                    className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105"
                    style={{
                        background: 'linear-gradient(135deg, #064E3B 0%, #000 100%)',
                        border: '2px solid #00FF94',
                        color: '#00FF94',
                        boxShadow: '0 0 20px rgba(0, 255, 148, 0.4), 0 4px 12px rgba(0,0,0,0.5)'
                    }}
                >
                    <Pencil className="h-4 w-4" />
                    Vẽ Ranh Giới
                </button>
            ) : (
                /* Drawing Mode Controls */
                <>
                    {/* Top Status Bar */}
                    <div
                        className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{
                            background: 'rgba(0, 0, 0, 0.9)',
                            border: '2px solid #00FF94',
                            boxShadow: '0 0 20px rgba(0, 255, 148, 0.3)'
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="animate-pulse">
                                <MapPin className="h-5 w-5 text-[#00FF94]" />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-wide">
                                Chế Độ Vẽ
                            </span>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold uppercase"
                        >
                            <X className="h-3.5 w-3.5" />
                            Hủy
                        </button>
                    </div>

                    {/* Bottom Action Panel */}
                    <div
                        className="absolute bottom-3 left-3 right-3 z-[1000] p-4 rounded-xl"
                        style={{
                            background: 'rgba(0, 0, 0, 0.95)',
                            border: '2px solid rgba(0, 255, 148, 0.5)',
                            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/50 uppercase">Điểm</p>
                                    <p className="text-lg font-black text-[#00FF94]">{points.length}</p>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/50 uppercase">Diện Tích</p>
                                    {areaData ? (
                                        <>
                                            <p className="text-lg font-black text-[#FFD700]">
                                                {areaData.hectares >= 0.01
                                                    ? `${areaData.hectares.toFixed(4)} Ha`
                                                    : `${areaData.squareMeters.toFixed(2)} m²`
                                                }
                                            </p>
                                            <p className="text-[9px] text-white/40">
                                                {areaData.hectares >= 0.01
                                                    ? `≈ ${areaData.squareMeters.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} m²`
                                                    : `≈ ${areaData.hectares.toFixed(6)} Ha`
                                                }
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-lg font-black text-[#FFD700]">—</p>
                                    )}
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${isPolygonClosed
                                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                : 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                                }`}>
                                {isPolygonClosed ? '✓ Hoàn Thành' : 'Đang Vẽ...'}
                            </div>
                        </div>

                        {/* Instructions */}
                        <p className="text-xs text-white/60 mb-4 text-center">
                            {!isPolygonClosed
                                ? points.length < 3
                                    ? `Chạm vào bản đồ để thêm điểm (cần ít nhất 3 điểm)`
                                    : `Chạm vào điểm đầu tiên hoặc nhấn "Hoàn Thành" để đóng vùng`
                                : `Kéo các điểm để điều chỉnh. Nhấn "Lưu" khi hoàn tất.`
                            }
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleUndo}
                                disabled={points.length === 0}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-xs uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff'
                                }}
                            >
                                <Undo2 className="h-4 w-4" />
                                Hoàn Tác
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={points.length === 0}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-xs uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{
                                    background: 'rgba(255, 0, 0, 0.1)',
                                    border: '1px solid rgba(255, 0, 0, 0.3)',
                                    color: '#ff6b6b'
                                }}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Xóa Hết
                            </button>
                            {!isPolygonClosed ? (
                                <button
                                    onClick={handleComplete}
                                    disabled={points.length < 3}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-xs uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{
                                        background: points.length >= 3 ? 'rgba(0, 255, 148, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${points.length >= 3 ? 'rgba(0, 255, 148, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                                        color: points.length >= 3 ? '#00FF94' : '#666'
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                    Hoàn Thành
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-xs uppercase transition-all hover:scale-105"
                                    style={{
                                        background: 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)',
                                        border: 'none',
                                        color: '#000',
                                        boxShadow: '0 0 15px rgba(0, 255, 148, 0.5)'
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                    Lưu
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FarmMapEditor;
