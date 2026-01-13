import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, TrendingUp } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// MOCK ASSET DATA - "Digital Red Book" (Sổ Đỏ Số)
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
  eudrVerified: true
};

const Profile: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Use mock data or fallback to userProfile
  const displayName = userProfile?.displayName?.toUpperCase() || MOCK_ASSET.farmerName;
  const pucCode = userProfile?.farmerId || MOCK_ASSET.pucCode;
  const farmPolygon = MOCK_ASSET.farmCoordinates;
  const center: [number, number] = [12.2355, 108.6790]; // Center of polygon
  
  // QR Code URL - Generate QR code with farmer data
  const qrCodeData = `COFFEELINK:${pucCode}:${displayName}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}&bgcolor=000000&color=FFFFFF`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-28 font-sans overflow-y-auto">
      
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: THE "GOD'S EYE" (Satellite Map with EUDR Badge) */}
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
          </div>
          
          {/* The Map Container */}
          <div 
            className="relative overflow-hidden shadow-2xl" 
            style={{ 
              borderRadius: '20px',
              border: '2px solid #064E3B',
              boxShadow: '0 0 40px rgba(0, 255, 148, 0.3), 0 20px 60px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="relative h-72 w-full bg-[#064E3B]">
              <MapContainer
                center={center}
                zoom={17}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                touchZoom={false}
              >
                {/* Satellite Tile Layer */}
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri"
                  maxZoom={19}
                />
                
                {/* Farm Polygon - NEON GREEN GLOWING */}
                <Polygon
                  positions={farmPolygon}
                  pathOptions={{
                    color: '#00FF94', // Neon Cyber Green
                    weight: 5,
                    fillOpacity: 0.25,
                    fillColor: '#00FF94',
                  }}
                />
              </MapContainer>
              
              {/* EUDR VERIFIED Badge - Floating Glass */}
              <div 
                className="absolute top-3 right-3 px-3 py-2 rounded-xl flex items-center gap-2 z-10"
                style={{
                  background: 'rgba(6, 78, 59, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(0, 255, 148, 0.6)',
                  boxShadow: '0 0 20px rgba(0, 255, 148, 0.4)'
                }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: '#00FF94' }} />
                <span className="text-[11px] font-black uppercase tracking-wide text-white">
                  🛡️ EUDR VERIFIED
                </span>
              </div>
              
              {/* Bottom Info Overlay - Area & Trees */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: THE "BLACK CARD" (American Express Centurion Style) */}
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
      {/* SECTION 3: THE "MARKET VALUE" (Minimalist Light Card) */}
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
                  📈 +{MOCK_ASSET.trend}%
                </span>
              </div>
            </div>
            
            {/* Main Valuation */}
            <p 
              className="text-4xl font-black tracking-tight mb-3"
              style={{
                color: '#00FF94',
                textShadow: '0 2px 8px rgba(0, 255, 148, 0.2)'
              }}
            >
              {MOCK_ASSET.valuation.toLocaleString('vi-VN')} VND
            </p>
            
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
