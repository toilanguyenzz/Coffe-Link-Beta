/**
 * FarmSetup.tsx
 * 
 * Smart Farm Setup page - 5-screen intelligent flow:
 * 1. Smart Input - Enter estimated area
 * 2. Drawing - Draw farm boundary with real-time progress
 * 3. Analysis - AI analysis & Red Book capture
 * 4. Enrichment - Tree count & coffee type
 * 5. Complete - Redirect to Dashboard
 */

import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarmData, calculatePolygonCenter } from '../contexts/FarmDataContext';
import FarmSetupFlow, { FarmSetupData } from '../components/flow/FarmSetupFlow';
import BottomNav from '../components/layout/BottomNav';
import { MapPin, Loader2, ArrowLeft } from 'lucide-react';

// Lazy load map editor
const FarmMapEditor = lazy(() => import('../components/map/FarmMapEditor'));

// Map loading placeholder
const MapPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-[#064E3B]">
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FF94] mx-auto mb-2" />
            <p className="text-sm text-white/70">Đang tải bản đồ...</p>
        </div>
    </div>
);

const FarmSetup: React.FC = () => {
    const navigate = useNavigate();
    const { setFarmBoundary, setTreeCount, setFarmDetails } = useFarmData();

    // User GPS state
    const [userGPS, setUserGPS] = useState<{ lat: number; lng: number }>({ lat: 12.6667, lng: 108.0500 });
    const [gpsLoaded, setGpsLoaded] = useState(false);

    // Get user GPS on mount
    React.useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserGPS({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setGpsLoaded(true);
                },
                () => {
                    // Use default coordinates (Tây Nguyên)
                    setGpsLoaded(true);
                },
                { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
            );
        } else {
            setGpsLoaded(true);
        }
    }, []);

    // Handle flow completion
    const handleComplete = useCallback((data: FarmSetupData) => {
        // Save to context
        const centerPoint = calculatePolygonCenter(data.drawnPolygon as [number, number][]);

        setFarmBoundary({
            coordinates: data.drawnPolygon as [number, number][],
            areaHectares: data.drawnAreaHa,
            areaSquareMeters: data.drawnAreaHa * 10000,
            centerPoint,
        });

        setTreeCount(data.treeCount);

        setFarmDetails({
            coffeeType: data.coffeeType,
            hasRedBook: data.hasRedBook,
            redBookImage: data.redBookImage,
        });

        // Navigate to profile/dashboard
        navigate('/profile');
    }, [navigate, setFarmBoundary, setTreeCount, setFarmDetails]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const center: [number, number] = [userGPS.lat, userGPS.lng];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 pt-14 pb-6 px-5">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white">Khởi Tạo Vườn Mới</h1>
                        <p className="text-sm text-white/70">Theo dõi 5 bước đơn giản</p>
                    </div>
                </div>
            </div>

            <FarmSetupFlow
                center={center}
                markerPosition={center}
                onComplete={handleComplete}
                onCancel={handleCancel}
            >
                {({ startFlow, isInFlow, currentStep, targetAreaHa, onDrawingComplete }) => (
                    <>
                        {/* Start Screen */}
                        {!isInFlow && currentStep === 'idle' && (
                            <div className="px-5 pt-8 max-w-md mx-auto">
                                <div
                                    className="p-6 rounded-2xl text-center"
                                    style={{
                                        background: 'linear-gradient(180deg, #0A1F1C 0%, #000000 100%)',
                                        border: '2px solid rgba(0, 255, 148, 0.3)',
                                    }}
                                >
                                    <div className="mb-6">
                                        <div className="inline-flex p-4 rounded-2xl bg-[#00FF94]/10 mb-4">
                                            <MapPin className="h-10 w-10 text-[#00FF94]" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-2">
                                            Vẽ Ranh Giới Vườn
                                        </h2>
                                        <p className="text-sm text-white/60">
                                            Chỉ cần 5 bước đơn giản để khởi tạo vườn cà phê của bác trên hệ thống.
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6 text-left">
                                        {[
                                            'Nhập diện tích ước lượng',
                                            'Vẽ ranh giới trên bản đồ vệ tinh',
                                            'AI xác thực & chụp Sổ Đỏ (tùy chọn)',
                                            'Nhập số cây & loại cà phê',
                                            'Hoàn thành! Nhận tư vấn AI',
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <span
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{
                                                        background: 'rgba(0, 255, 148, 0.2)',
                                                        color: '#00FF94',
                                                    }}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm text-white/80">{step}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={startFlow}
                                        className="w-full py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all hover:scale-[1.02]"
                                        style={{
                                            background: 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)',
                                            color: '#000',
                                            boxShadow: '0 0 30px rgba(0, 255, 148, 0.5)',
                                        }}
                                    >
                                        Bắt Đầu Ngay
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Drawing Screen */}
                        {currentStep === 'drawing' && (
                            <div className="px-5 pt-4 max-w-md mx-auto">
                                <div
                                    className="rounded-2xl overflow-hidden"
                                    style={{
                                        height: '70vh',
                                        border: '2px solid rgba(0, 255, 148, 0.5)',
                                        boxShadow: '0 0 30px rgba(0, 255, 148, 0.2)',
                                    }}
                                >
                                    {gpsLoaded ? (
                                        <Suspense fallback={<MapPlaceholder />}>
                                            <FarmMapEditor
                                                center={center}
                                                markerPosition={center}
                                                targetAreaHa={targetAreaHa || undefined}
                                                onSave={(polygon) => {
                                                    // Calculate area from polygon
                                                    if (polygon.length >= 3) {
                                                        const turf = require('@turf/turf');
                                                        const polygonCoords = [...polygon, polygon[0]].map(p => [p[1], p[0]]);
                                                        const turfPolygon = turf.polygon([polygonCoords]);
                                                        const areaM2 = turf.area(turfPolygon);
                                                        const areaHa = areaM2 / 10000;

                                                        onDrawingComplete(polygon, areaHa);
                                                    }
                                                }}
                                                onCancel={handleCancel}
                                            />
                                        </Suspense>
                                    ) : (
                                        <MapPlaceholder />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Complete Screen */}
                        {currentStep === 'complete' && (
                            <div className="px-5 pt-8 max-w-md mx-auto text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-white mb-2">Hoàn Thành!</h2>
                                <p className="text-white/60 mb-6">
                                    Vườn của bác đã được khởi tạo thành công.
                                </p>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)',
                                        color: '#000',
                                        boxShadow: '0 0 30px rgba(0, 255, 148, 0.5)',
                                    }}
                                >
                                    Xem Hồ Sơ Vườn
                                </button>
                            </div>
                        )}
                    </>
                )}
            </FarmSetupFlow>

            <BottomNav />
        </div>
    );
};

export default FarmSetup;
