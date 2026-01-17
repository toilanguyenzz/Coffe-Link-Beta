/**
 * DiseaseAlertCard.tsx
 * Khối "Cảnh báo dịch bệnh lân cận" - FOMO Fear of Missing Out
 * Hiển thị bản đồ nhiệt dịch bệnh gần đó + tạo urgency
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    MapPin,
    Bug,
    Scan,
    ChevronRight,
    ShieldAlert,
    Activity
} from 'lucide-react';

interface DiseaseReport {
    id: string;
    disease: string;
    distance: number;
    affectedHouseholds: number;
    severity: 'low' | 'medium' | 'high';
    reportedAt: string;
}

// Mock disease data
const mockDiseases: DiseaseReport[] = [
    {
        id: '1',
        disease: 'Rệp sáp',
        distance: 500,
        affectedHouseholds: 3,
        severity: 'medium',
        reportedAt: 'Hôm nay'
    },
    {
        id: '2',
        disease: 'Rụng quả non',
        distance: 2000,
        affectedHouseholds: 5,
        severity: 'high',
        reportedAt: 'Hôm qua'
    }
];

const getSeverityStyle = (severity: string) => {
    switch (severity) {
        case 'high':
            return 'bg-red-500/20 border-red-500/30 text-red-400';
        case 'medium':
            return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
        default:
            return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    }
};

const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
};

const DiseaseAlertCard: React.FC = () => {
    const navigate = useNavigate();
    const [diseases] = useState<DiseaseReport[]>(mockDiseases);

    const hasAlerts = diseases.length > 0;
    const highSeverityCount = diseases.filter(d => d.severity === 'high').length;

    return (
        <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-3xl overflow-hidden shadow-2xl border border-red-500/20">
            {/* Animated Alert Header */}
            <div className={`px-5 py-4 border-b border-white/10 ${highSeverityCount > 0
                    ? 'bg-gradient-to-r from-red-600/30 to-orange-600/30'
                    : 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highSeverityCount > 0
                                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                                : 'bg-amber-500'
                            }`}>
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold flex items-center gap-2">
                                🦠 Cảnh Báo Dịch Bệnh
                                {highSeverityCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                                        {highSeverityCount} nguy hiểm
                                    </span>
                                )}
                            </h3>
                            <p className="text-gray-400 text-xs">Khu vực lân cận vườn của bác</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Heat Map Visualization */}
            <div className="p-4">
                <div className="relative bg-slate-800/50 rounded-2xl p-4 mb-4 overflow-hidden">
                    {/* Simulated Heat Map */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-red-500 rounded-full blur-xl animate-pulse" />
                        <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-amber-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    {/* Your Garden Marker */}
                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-medium">Vườn của bác</span>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-sm">
                            {diseases.slice(0, 2).map((d, idx) => (
                                <div key={d.id} className="flex items-center gap-2">
                                    <Activity className={`w-4 h-4 ${d.severity === 'high' ? 'text-red-400' : 'text-amber-400'
                                        }`} />
                                    <span className="text-gray-300">{formatDistance(d.distance)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Disease List */}
                <div className="space-y-3">
                    {diseases.map((disease) => (
                        <div
                            key={disease.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border ${getSeverityStyle(disease.severity)}`}
                        >
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                <Bug className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-medium">{disease.disease}</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${disease.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                                            disease.severity === 'medium' ? 'bg-amber-500/30 text-amber-300' :
                                                'bg-yellow-500/30 text-yellow-300'
                                        }`}>
                                        {disease.severity === 'high' ? 'Nguy hiểm' :
                                            disease.severity === 'medium' ? 'Cảnh báo' : 'Theo dõi'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    Cách {formatDistance(disease.distance)} • {disease.affectedHouseholds} hộ báo cáo
                                </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={() => navigate('/consult')}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30 animate-pulse"
                >
                    <Scan className="w-5 h-5" />
                    Kiểm Tra Vườn Ngay
                </button>
            </div>

            {/* FOMO Footer */}
            <div className="bg-red-500/10 px-5 py-3 border-t border-red-500/20">
                <p className="text-center text-sm text-red-300">
                    ⚠️ Phát hiện sớm = Cứu được vườn. Đừng để quá muộn!
                </p>
            </div>
        </div>
    );
};

export default DiseaseAlertCard;
