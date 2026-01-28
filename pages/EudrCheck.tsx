/**
 * EudrCheck.tsx
 * 
 * EUDR Verification Page
 * Full-screen wrapper for EudrCheckFeature with header and navigation
 */

import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

// Lazy load the heavy map component
const EudrCheckFeature = lazy(() => import('../components/features/EudrCheckFeature'));

// Loading placeholder
const MapPlaceholder: React.FC = () => (
    <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
        <p className="text-white/60 text-sm">Đang tải bản đồ...</p>
    </div>
);

const EudrCheck: React.FC = () => {
    const navigate = useNavigate();

    const handleComplete = (status: 'safe' | 'warning' | 'legal_risk' | 'violation' | 'drawing' | 'scanning', geojson: any) => {
        // Save verification result to localStorage
        localStorage.setItem('eudr_status', status);
        localStorage.setItem('eudr_timestamp', new Date().toISOString());
        localStorage.setItem('eudr_geojson', JSON.stringify(geojson));

        // Navigate back to dashboard on safe or exported states
        if (status === 'safe' || status === 'warning' || status === 'legal_risk') {
            navigate('/');
        }
    };


    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[1001] bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3 px-4 pt-12 pb-6">
                    <button
                        onClick={handleCancel}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">Kiểm Tra EUDR</h1>
                            <p className="text-white/60 text-xs">Xác thực tuân thủ châu Âu</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="absolute inset-0 pt-24 pb-20">
                <Suspense fallback={<MapPlaceholder />}>
                    <EudrCheckFeature
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        farmerName={localStorage.getItem('farmer_name') || 'Nông dân'}
                        farmId={localStorage.getItem('farm_id') || 'FARM_001'}
                    />
                </Suspense>
            </div>

            {/* Bottom Nav */}
            <BottomNav />
        </div>
    );
};

export default EudrCheck;
