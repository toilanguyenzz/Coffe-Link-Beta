import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import * as turf from '@turf/turf';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, TrendingUp, MapPin, AlertTriangle, Loader2, Pencil, Eye } from 'lucide-react';

// Lazy load the map components to prevent initialization issues
const FarmMap = lazy(() => import('../components/map/FarmMap'));
const FarmMapEditor = lazy(() => import('../components/map/FarmMapEditor'));

// Map loading placeholder
const MapPlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#064E3B]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#00FF94] mx-auto mb-2" />
      <p className="text-sm text-white/70">Loading Map...</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// MOCK ASSET DATA - "Digital Red Book" (Sổ Đỏ Số) - ENHANCED
// ═══════════════════════════════════════════════════════════════════════
const MOCK_ASSET = {
  farmerName: 'NGUYỄN VĂN A',
  pucCode: 'VN-DL-CUMGAR-0882',
  farmCoordinates: [
    [12.2345, 108.6789],
    [12.2355, 108.6799],
    [12.2365, 108.6795],
    [12.2360, 108.6780],
    [12.2345, 108.6789]
  ],
  area: 1.8, // Hectares
  treeCount: 1200,
  valuation: 720500000, // VND
  trend: 2.5, // Percentage
  eudrVerified: true,

  // NEW: GPS & Compliance
  gpsCoordinates: { lat: 12.2355, lng: 108.6790 },
  complianceCheck: {
    status: 'PASSED',
    cutoffDate: '2020-12-31',
    verifiedAt: '2025-01-10',
    certification: 'EUDR EU 2023/1115'
  },

  // NEW: Price History (Last 7 days in millions VND)
  priceHistory: [680, 690, 695, 705, 710, 715, 720.5],
  lastUpdated: '2026-01-13T11:00:00+07:00'
};



// Mini Sparkline Chart Component
const SparklineChart: React.FC<{ data: number[] }> = ({ data }) => {
  const width = 120;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="#00FF94"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gradient fill under line */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#gradient)"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00FF94" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00FF94" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};


const Profile: React.FC = () => {
  const { userProfile } = useAuth();

  // State for GPS tracking
  const [userGPS, setUserGPS] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isInsideFarm, setIsInsideFarm] = useState<boolean>(true); // Default true

  // State for map edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [farmPolygon, setFarmPolygon] = useState<number[][]>(MOCK_ASSET.farmCoordinates);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Use mock data or fallback to userProfile
  const displayName = userProfile?.displayName?.toUpperCase() || MOCK_ASSET.farmerName;
  const pucCode = userProfile?.farmerId || MOCK_ASSET.pucCode;
  const center: [number, number] = userGPS
    ? [userGPS.lat, userGPS.lng]
    : [MOCK_ASSET.gpsCoordinates.lat, MOCK_ASSET.gpsCoordinates.lng];

  // QR Code URL
  const qrCodeData = `COFFEELINK:${pucCode}:${displayName}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}&bgcolor=000000&color=FFFFFF`;

  // Handle save from FarmMapEditor
  const handleSaveFarmBoundary = useCallback((newPolygon: number[][]) => {
    setFarmPolygon(newPolygon);
    setIsEditMode(false);
    setSavedMessage('Ranh giới vườn đã được lưu thành công!');

    // Clear the saved message after 3 seconds
    setTimeout(() => {
      setSavedMessage(null);
    }, 3000);

    // TODO: Save to Firebase here
    console.log('Saved farm boundary:', newPolygon);
  }, []);

  // Handle cancel from FarmMapEditor
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  // Get User's Live GPS Location (mobile-friendly, single-shot with fallback)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('GPS not supported');
      setUserGPS(MOCK_ASSET.gpsCoordinates);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserGPS({ lat: latitude, lng: longitude });
        setGpsError(null);

        // Check if user is inside farm polygon using Turf.js
        const point = turf.point([longitude, latitude]);
        const polygon = turf.polygon([farmPolygon.map(coord => [coord[1], coord[0]])]);
        const inside = turf.booleanPointInPolygon(point, polygon);
        setIsInsideFarm(inside);
      },
      (error) => {
        console.error('GPS Error:', error);
        setGpsError('GPS unavailable');
        // Fallback to mock coordinates
        setUserGPS(MOCK_ASSET.gpsCoordinates);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 0
      }
    );
  }, [farmPolygon]); // Re-run when farmPolygon changes


  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-28 font-sans overflow-y-auto">

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 1: "SATELLITE SENTINEL" (Map + Live GPS + EUDR Badges) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 pt-6 pb-4">
        <div className="max-w-xl mx-auto">
          {/* Map Title Overlay */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white/90">
                🛰️ Vùng Canh Tác
              </h2>
              <p className="text-[10px] font-medium text-white/50 tracking-wide">
                Satellite View • Real-time Boundary
              </p>
            </div>
            {gpsError && (
              <span className="text-[10px] font-semibold text-amber-400">
                GPS tạm thời không khả dụng
              </span>
            )}
          </div>

          {/* Success Message Toast */}
          {savedMessage && (
            <div
              className="mb-3 p-3 rounded-xl flex items-center gap-2 animate-pulse"
              style={{
                background: 'rgba(0, 255, 148, 0.15)',
                border: '1px solid rgba(0, 255, 148, 0.5)',
              }}
            >
              <span className="text-sm font-bold text-[#00FF94]">✓ {savedMessage}</span>
            </div>
          )}

          {/* The Map Container - Switches between View and Edit modes */}
          <div
            className="relative overflow-hidden shadow-2xl"
            style={{
              borderRadius: '20px',
              border: isEditMode ? '2px solid #FFD700' : '2px solid #064E3B',
              boxShadow: isEditMode
                ? '0 0 40px rgba(255, 215, 0, 0.4), 0 20px 60px rgba(0, 0, 0, 0.8)'
                : '0 0 40px rgba(0, 255, 148, 0.3), 0 20px 60px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="relative h-96 w-full bg-[#064E3B]">
              <Suspense fallback={<MapPlaceholder />}>
                {isEditMode ? (
                  <FarmMapEditor
                    center={center}
                    initialPolygon={farmPolygon}
                    markerPosition={
                      userGPS
                        ? [userGPS.lat, userGPS.lng]
                        : [MOCK_ASSET.gpsCoordinates.lat, MOCK_ASSET.gpsCoordinates.lng]
                    }
                    onSave={handleSaveFarmBoundary}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <FarmMap
                    center={center}
                    farmPolygon={farmPolygon}
                    markerPosition={
                      userGPS
                        ? [userGPS.lat, userGPS.lng]
                        : [MOCK_ASSET.gpsCoordinates.lat, MOCK_ASSET.gpsCoordinates.lng]
                    }
                  />
                )}
              </Suspense>

              {/* Only show these overlays in view mode - FarmMapEditor has its own controls */}
              {!isEditMode && (
                <>
                  {/* 📡 LIVE GPS Badge - Top Left (Animated Pulse) */}
                  <div
                    className="absolute top-3 left-3 px-3 py-2 rounded-xl flex items-center gap-2 z-10 animate-pulse"
                    style={{
                      background: 'rgba(6, 78, 59, 0.90)',
                      backdropFilter: 'blur(12px)',
                      border: '1.5px solid rgba(0, 255, 148, 0.6)',
                      boxShadow: '0 0 20px rgba(0, 255, 148, 0.4)'
                    }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: '#00FF94' }} />
                    <span className="text-[11px] font-black uppercase tracking-wide text-white">
                      📡 LIVE GPS
                    </span>
                  </div>

                  {/* 🛡️ EUDR VERIFIED Badge - Top Right (Dynamic based on location) */}
                  <div
                    className="absolute top-3 right-3 px-3 py-2 rounded-xl flex items-center gap-2 z-10"
                    style={{
                      background: isInsideFarm
                        ? 'rgba(6, 78, 59, 0.85)'
                        : 'rgba(120, 0, 0, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: isInsideFarm
                        ? '1.5px solid rgba(0, 255, 148, 0.6)'
                        : '1.5px solid rgba(255, 0, 0, 0.6)',
                      boxShadow: isInsideFarm
                        ? '0 0 20px rgba(0, 255, 148, 0.4)'
                        : '0 0 20px rgba(255, 0, 0, 0.4)'
                    }}
                  >
                    {isInsideFarm ? (
                      <>
                        <ShieldCheck className="h-4 w-4" style={{ color: '#00FF94' }} />
                        <span className="text-[11px] font-black uppercase tracking-wide text-white">
                          🛡️ EUDR VERIFIED
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" style={{ color: '#FF4444' }} />
                        <span className="text-[11px] font-black uppercase tracking-wide text-white">
                          ⚠️ OUTSIDE ZONE
                        </span>
                      </>
                    )}
                  </div>

                  {/* Bottom Info Overlay - Area, Trees & GPS Coordinates */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4 z-10"
                    style={{
                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#00FF94' }}>
                          Diện tích & Số cây
                        </p>
                        <p className="text-xl font-black text-white tracking-tight">
                          {MOCK_ASSET.area} Ha • {MOCK_ASSET.treeCount.toLocaleString()} Gốc
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#00FF94' }}>
                          GPS Coordinates
                        </p>
                        <p className="text-xs font-mono font-black text-white">
                          {userGPS ? `${userGPS.lat.toFixed(4)}°N` : '—'}
                        </p>
                        <p className="text-xs font-mono font-black text-white">
                          {userGPS ? `${userGPS.lng.toFixed(4)}°E` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Boundary Button */}
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all duration-300 hover:scale-105"
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 2: "COMPLIANCE PASSPORT" (Black Card + Deforestation Check) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-4">
        <div className="max-w-xl mx-auto">
          <div
            className="relative overflow-hidden p-8 text-white transform transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #000000 0%, #064E3B 50%, #0a0a0a 100%)',
              borderRadius: '20px',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 255, 148, 0.15)'
            }}
          >
            {/* Noise Texture Overlay */}
            <div
              className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==)'
              }}
            ></div>

            {/* Glowing Orbs */}
            <div
              className="absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: '#00FF94' }}
            ></div>
            <div
              className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: '#FFD700' }}
            ></div>

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p
                    className="text-[9px] font-black uppercase mb-1 tracking-[0.25em]"
                    style={{ color: '#FFD700' }}
                  >
                    Digital Asset Card
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/80">
                    CoffeeLink Agri-OS
                  </p>
                </div>
                <div
                  className="px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(0, 255, 148, 0.15)',
                    border: '1px solid rgba(0, 255, 148, 0.4)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span className="text-[9px] font-black uppercase" style={{ color: '#00FF94' }}>
                    ✓ VERIFIED
                  </span>
                </div>
              </div>

              {/* Farmer Name - EMBOSSED STYLE */}
              <div className="mb-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  Chủ Vườn / Farmer
                </p>
                <h1
                  className="text-3xl font-black tracking-tight leading-none"
                  style={{
                    color: '#FFFFFF',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
                    letterSpacing: '0.05em'
                  }}
                >
                  {displayName}
                </h1>
              </div>

              {/* PUC Code - EMBOSSED GOLD */}
              <div className="mb-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  PUC Code (Mã Vùng Trồng)
                </p>
                <p
                  className="text-xl font-mono font-black tracking-[0.15em]"
                  style={{
                    color: '#FFD700',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 215, 0, 0.5)',
                    fontVariant: 'small-caps'
                  }}
                >
                  {pucCode}
                </p>
              </div>

              {/* NEW: Deforestation Compliance Check */}
              <div
                className="mb-8 p-4 rounded-xl"
                style={{
                  background: 'rgba(0, 255, 148, 0.1)',
                  border: '1px solid rgba(0, 255, 148, 0.3)'
                }}
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                  EUDR Compliance Status
                </p>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6" style={{ color: '#00FF94' }} />
                  <div>
                    <p
                      className="text-base font-black tracking-wide"
                      style={{ color: '#00FF94' }}
                    >
                      Deforestation Check (2020): ✅ PASSED
                    </p>
                    <p className="text-[10px] text-white/50 mt-1">
                      Verified: {MOCK_ASSET.complianceCheck.verifiedAt} • {MOCK_ASSET.complianceCheck.certification}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Footer */}
              <div
                className="flex items-end justify-between pt-5"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-white/50 mb-1">
                    Quét để xác thực
                  </p>
                  <p className="text-[8px] font-medium text-white/30">
                    Scan to verify authenticity
                  </p>
                </div>
                <div
                  className="p-2.5 rounded-xl"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="h-20 w-20"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* LAYER 3: "ASSET VALUATION" (Harvest Value + Trend Graph) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-4">
        <div className="max-w-xl mx-auto">
          <div
            className="p-7"
            style={{
              background: 'linear-gradient(to bottom right, #FFFFFF 0%, #F5F5F5 100%)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header with Trend */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                Định giá vườn
              </p>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(0, 255, 148, 0.1)',
                  border: '1px solid rgba(0, 255, 148, 0.3)'
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" style={{ color: '#00FF94' }} />
                <span className="text-xs font-black" style={{ color: '#00FF94' }}>
                  📈 +{MOCK_ASSET.trend}% (7d)
                </span>
              </div>
            </div>

            {/* Main Valuation with Sparkline */}
            <div className="flex items-end justify-between mb-3">
              <p
                className="text-4xl font-black tracking-tight"
                style={{
                  color: '#00FF94',
                  textShadow: '0 2px 8px rgba(0, 255, 148, 0.2)'
                }}
              >
                {MOCK_ASSET.valuation.toLocaleString('vi-VN')} VND
              </p>
              <SparklineChart data={MOCK_ASSET.priceHistory} />
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
              Định giá dựa trên dữ liệu sàn London & Sản lượng dự kiến.
            </p>
            <p className="text-[10px] font-medium text-gray-300 mt-1.5 italic">
              *Giá trị thay đổi theo thị trường quốc tế
            </p>
          </div>
        </div>
      </section>

      {/* Version Info */}
      <div className="text-center pb-6 pt-4 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
          CoffeeLink Agri-OS
        </p>
        <p className="text-[9px] text-white/40">
          Phiên bản 2.1.0 (Premium Edition)
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
