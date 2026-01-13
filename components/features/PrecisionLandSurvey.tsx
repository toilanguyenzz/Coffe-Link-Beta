
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { 
  Undo2, 
  Trash2, 
  Save, 
  ArrowLeft,
  Ruler,
  Sprout,
  FlaskConical,
  Layers,
  Map as MapIcon,
  Info,
  Footprints,
  Hand,
  Play,
  Square,
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { GardenData } from '../../types';
import { getDistanceFromLatLonInMeters } from '../../utils/geoUtils';

// Fix Leaflet Default Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon for Vertices (White dot with Green border)
const vertexIcon = new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="h-4 w-4 bg-white border-2 border-green-600 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// --- COMPONENT: TAP HANDLER ---
const MapTapHandler = ({ onMapClick, enabled }: { onMapClick: (e: L.LeafletMouseEvent) => void, enabled: boolean }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) onMapClick(e);
    },
  });
  return null;
};

// --- COMPONENT: AUTO CENTER ON GPS ---
const MapRecenter = ({ position }: { position: L.LatLngExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
};

const SmartGardenMapper: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();

  // --- STATE ---
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');
  
  // Tracking Mode State
  const [inputMode, setInputMode] = useState<'manual' | 'gps'>('manual');
  const [isRecording, setIsRecording] = useState(false);
  const [userPos, setUserPos] = useState<L.LatLngExpression | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  // Optimization Metrics
  const [metrics, setMetrics] = useState({ 
    areaSqM: 0, 
    areaHa: 0, 
    perimeter: 0,
    estimatedTrees: 0,
    fertilizerNeeds: 0 
  });
  
  // Initial position (User's garden or default to Dak Lak)
  const initialPos = userProfile?.gardenLocation 
    ? [userProfile.gardenLocation.lat, userProfile.gardenLocation.lng] as [number, number]
    : [12.679, 108.044] as [number, number];

  // --- GPS TRACKING LOGIC ---
  const toggleRecording = () => {
    if (isRecording) {
      // STOP RECORDING
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsRecording(false);
    } else {
      // START RECORDING
      if (!navigator.geolocation) return alert("Thiết bị không hỗ trợ GPS");
      
      // Clear previous points if starting new or keep? Let's verify with user if points exist
      if (points.length > 0) {
        if (!window.confirm("Bắt đầu đo mới? Dữ liệu điểm cũ sẽ bị xóa.")) return;
      }
      
      setPoints([]);
      setIsRecording(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPoint = new L.LatLng(latitude, longitude);
          
          setUserPos([latitude, longitude]);

          setPoints(prev => {
            // If first point, add it
            if (prev.length === 0) return [newPoint];

            // Filter noise: Only add if distance > 3 meters from last point
            const last = prev[prev.length - 1];
            const dist = getDistanceFromLatLonInMeters(last.lat, last.lng, latitude, longitude);
            
            if (dist > 3) {
              return [...prev, newPoint];
            }
            return prev;
          });
        },
        (err) => {
          console.error(err);
          alert("Lỗi lấy tín hiệu GPS.");
          setIsRecording(false);
        },
        { enableHighAccuracy: true, distanceFilter: 2 }
      );
    }
  };

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // --- GEOSPATIAL MATH ENGINE ---
  useEffect(() => {
    if (points.length < 3) {
      setMetrics({ areaSqM: 0, areaHa: 0, perimeter: 0, estimatedTrees: 0, fertilizerNeeds: 0 });
      return;
    }

    // Prepare coordinates for Turf [lng, lat]
    // Close the polygon by repeating the first point
    const coords = points.map(p => [p.lng, p.lat]);
    coords.push([points[0].lng, points[0].lat]);

    const polygon = turf.polygon([coords]);
    const area = turf.area(polygon); // Square meters
    const line = turf.lineString(coords);
    const length = turf.length(line, { units: 'kilometers' }) * 1000; // Meters

    // Derived Optimization Metrics
    const areaHa = Number((area / 10000).toFixed(4)); // Hectares
    const estimatedTrees = Math.round(area / 9); // Assume 3x3 density = 9m2 per tree
    const fertilizerNeeds = Math.round(areaHa * 400); // Rule: 400kg Nitrogen / Ha

    setMetrics({
      areaSqM: Math.round(area),
      areaHa,
      perimeter: Math.round(length),
      estimatedTrees,
      fertilizerNeeds
    });
  }, [points]);

  // --- ACTIONS ---
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (inputMode === 'manual') {
      setPoints(prev => [...prev, e.latlng]);
    }
  };

  const handleUndo = () => {
    setPoints(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (window.confirm("Bác có chắc muốn xóa toàn bộ điểm đo không?")) {
      setPoints([]);
      if (isRecording) toggleRecording();
    }
  };

  const handleSave = async () => {
    if (points.length < 3) {
      alert("Cần ít nhất 3 điểm để tạo thành một vùng đất.");
      return;
    }
    if (!currentUser) return;

    if (window.confirm(`Lưu vườn diện tích ${metrics.areaHa} Ha?`)) {
        try {
            const center = points[0]; 
            const gardenData: GardenData = {
                id: `G-${Date.now()}`,
                name: `Vườn Cà phê ${new Date().toLocaleDateString('vi-VN')}`,
                boundary: points.map(p => ({ lat: p.lat, lng: p.lng })),
                center: { lat: center.lat, lng: center.lng },
                metrics: {
                    areaSqM: metrics.areaSqM,
                    areaHa: metrics.areaHa,
                    estimatedTrees: metrics.estimatedTrees
                }
            };

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                surveyData: gardenData,
                updatedAt: serverTimestamp()
            });
            await refreshProfile();
            navigate('/profile');
        } catch (e) {
            console.error(e);
            alert("Lỗi khi lưu dữ liệu.");
        }
    }
  };

  return (
    <div className="relative h-screen w-full bg-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* 1. MAP LAYER (FULLSCREEN) */}
      <div className="absolute inset-0 z-0">
          <MapContainer 
            center={initialPos} 
            zoom={18} 
            className="h-full w-full" 
            zoomControl={false}
            attributionControl={false}
            doubleClickZoom={false}
          >
            {/* Layers */}
            {mapMode === 'satellite' ? (
                 <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Esri"
                    maxZoom={19}
                 />
            ) : (
                 <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="OSM"
                 />
            )}

            {/* Tracking Logic */}
            <MapTapHandler onMapClick={handleMapClick} enabled={inputMode === 'manual'} />
            {isRecording && userPos && <MapRecenter position={userPos} />}

            {/* Rendering */}
            {points.length > 0 && (
                <>
                    <Polygon 
                        positions={points} 
                        pathOptions={{ 
                            color: '#4ade80', // green-400
                            weight: 3, 
                            fillOpacity: 0.2, 
                            fillColor: '#4ade80', 
                            dashArray: isRecording ? '10, 10' : undefined 
                        }} 
                    />
                    {points.map((p, idx) => (
                        <Marker key={idx} position={p} icon={vertexIcon} />
                    ))}
                </>
            )}

            {/* User GPS Marker */}
            {userPos && isRecording && (
                <Marker position={userPos} icon={new L.DivIcon({
                    className: 'bg-transparent',
                    html: '<div class="h-4 w-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })} />
            )}
          </MapContainer>
          
          {/* Gradients */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[400]" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-[400]" />
      </div>

      {/* 2. TOP NAVIGATION */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 safe-top">
        <div className="flex items-center justify-between">
            <button 
                onClick={() => navigate(-1)} 
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 active:scale-95 transition-all"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Input Mode Switcher */}
            <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button 
                    onClick={() => { setInputMode('manual'); if(isRecording) toggleRecording(); }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${inputMode === 'manual' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    <Hand className="h-3 w-3" /> Thủ công
                </button>
                <button 
                    onClick={() => setInputMode('gps')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${inputMode === 'gps' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                    <Footprints className="h-3 w-3" /> Đi bộ
                </button>
            </div>

            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 active:scale-95 transition-all">
                 <Info className="h-5 w-5" /> 
            </button>
        </div>
      </div>

      {/* 3. RIGHT SIDE TOOLBAR */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[500] flex flex-col gap-3">
          <button 
             onClick={() => setMapMode(prev => prev === 'satellite' ? 'street' : 'satellite')}
             className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-black/80 shadow-lg active:scale-95 transition-all"
             title="Đổi lớp bản đồ"
          >
             <Layers className="h-5 w-5" />
          </button>
          <div className="h-px w-8 bg-white/10 mx-auto" />
          <button 
             onClick={handleUndo}
             disabled={points.length === 0 || isRecording}
             className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-black/80 shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
             <Undo2 className="h-5 w-5" />
          </button>
          <button 
             onClick={handleClear}
             disabled={points.length === 0}
             className="p-3 bg-red-500/80 backdrop-blur-md rounded-2xl text-white border border-red-400/30 hover:bg-red-600 shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
             <Trash2 className="h-5 w-5" />
          </button>
      </div>

      {/* 4. GPS RECORD CONTROLS (Floating) */}
      {inputMode === 'gps' && (
         <div className="absolute bottom-40 left-0 right-0 z-[500] flex justify-center pointer-events-none">
             <button 
                onClick={toggleRecording}
                className={`pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
             >
                {isRecording ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                {isRecording ? 'Dừng & Đóng Vùng' : 'Bắt Đầu Ghi'}
             </button>
         </div>
      )}

      {/* 5. CENTER INSTRUCTION */}
      {points.length === 0 && !isRecording && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[450] pointer-events-none text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-bounce mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                 <MapIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-white font-black text-lg drop-shadow-xl tracking-wide uppercase">Bắt đầu đo đạc</h2>
            <p className="text-white/70 text-xs mt-2 max-w-[200px] leading-relaxed font-medium">
                {inputMode === 'manual' 
                    ? 'Chạm vào các điểm góc của vườn để vẽ ranh giới' 
                    : 'Bấm "Bắt đầu ghi" và đi bộ quanh ranh giới vườn'}
            </p>
         </div>
      )}

      {/* 6. BOTTOM DASHBOARD */}
      <div className="absolute bottom-0 left-0 right-0 z-[500] px-4 pb-8 pt-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-1.5 shadow-2xl overflow-hidden ring-1 ring-white/5">
               
               {/* Main Stats */}
               <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-5 text-center relative overflow-hidden border border-white/5">
                   {/* Background Glow */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-500/10 blur-[60px] rounded-full" />
                   
                   <div className="relative z-10">
                       <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Diện tích thực tế</p>
                       <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                                {metrics.areaSqM > 10000 ? metrics.areaHa : metrics.areaSqM.toLocaleString()}
                            </span>
                            <span className="text-lg font-bold text-green-400">
                                 {metrics.areaSqM > 10000 ? 'Ha' : 'm²'}
                            </span>
                       </div>
                   </div>
               </div>

               {/* Metrics Grid */}
               <div className="grid grid-cols-3 gap-1 mt-1.5">
                   <div className="bg-black/40 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 h-20">
                        <Ruler className="h-4 w-4 text-blue-400 mb-1.5" />
                        <span className="text-white font-bold text-sm tracking-tight">{metrics.perimeter}m</span>
                        <span className="text-[8px] text-white/40 uppercase font-black tracking-wider">Chu vi</span>
                   </div>
                   <div className="bg-black/40 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 h-20">
                        <Sprout className="h-4 w-4 text-green-400 mb-1.5" />
                        <span className="text-white font-bold text-sm tracking-tight">~{metrics.estimatedTrees}</span>
                        <span className="text-[8px] text-white/40 uppercase font-black tracking-wider">Cây</span>
                   </div>
                   <div className="bg-black/40 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 h-20">
                        <FlaskConical className="h-4 w-4 text-yellow-400 mb-1.5" />
                        <span className="text-white font-bold text-sm tracking-tight">{metrics.fertilizerNeeds}kg</span>
                        <span className="text-[8px] text-white/40 uppercase font-black tracking-wider">Phân bón</span>
                   </div>
               </div>

               {/* Action Button */}
               <button
                  onClick={handleSave}
                  disabled={points.length < 3 || isRecording}
                  className={`mt-1.5 w-full py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-[0.98] flex items-center justify-center gap-2 border ${
                      points.length < 3 || isRecording
                      ? 'bg-gray-800/50 text-gray-600 border-transparent cursor-not-allowed'
                      : 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/50 hover:bg-green-500'
                  }`}
               >
                  <Save className="h-4 w-4" />
                  Lưu & Phân Tích
               </button>
          </div>
      </div>
    </div>
  );
};

export default SmartGardenMapper;
