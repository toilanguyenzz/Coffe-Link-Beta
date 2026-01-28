/**
 * SmartWeatherCard.tsx
 * 
 * "Thẻ Thời Tiết Nông Vụ" - AI-powered weather advisory card
 * Shows RED/GREEN/YELLOW status with personalized farming advice
 * 
 * Features:
 * - Red Alert: Mưa to/nắng gắt → Cảnh báo mất tiền
 * - Green Day: Điều kiện tốt → Khuyên bón phân
 * - AI-generated messages in Vietnamese farmer voice
 * - Action button: [Tôi đã rõ] +1 điểm / [Ghi Nhật Ký Ngay]
 */

import React, { useState, useEffect } from 'react';
import {
    CloudRain,
    Sun,
    CloudSun,
    AlertTriangle,
    CheckCircle,
    Zap,
    Droplets,
    Wind,
    ThermometerSun,
    Leaf,
    BookOpen
} from 'lucide-react';
import { useGreenPoints } from '../../contexts/GreenPointsContext';
import GreenCreditService, { WeatherAnalysisResult } from '../../services/GreenCreditService';

interface SmartWeatherCardProps {
    onLogDiary?: () => void;
    farmerName?: string;
    location?: string;
}

const SmartWeatherCard: React.FC<SmartWeatherCardProps> = ({
    onLogDiary,
    farmerName = 'Bác',
    location = 'Chư Păh, Gia Lai'
}) => {
    const { addPoints, balance } = useGreenPoints();
    const [analysis, setAnalysis] = useState<WeatherAnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [acknowledged, setAcknowledged] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    // Mock weather data - In production, fetch from WeatherService
    const mockWeatherInput = {
        weatherForecast: 'Cloudy, light rain expected in evening, 15mm',
        soilMoisture: 'High (75%)',
        cropStatus: 'Coffee Robusta - Fruit development stage',
        estimatedFertilizerCost: 500000
    };

    useEffect(() => {
        const analyzeWeather = async () => {
            setLoading(true);
            try {
                const result = await GreenCreditService.analyzeWeatherForFarming(mockWeatherInput);
                setAnalysis(result);
            } catch (error) {
                console.error('Weather analysis failed:', error);
                // Default to cautious
                setAnalysis({
                    status: 'YELLOW',
                    message: 'Không thể phân tích thời tiết. Bác nên theo dõi thêm.',
                    recommendation: 'CAUTION',
                    reason: 'Lỗi kết nối'
                });
            } finally {
                setLoading(false);
            }
        };

        analyzeWeather();
    }, []);

    const handleAcknowledge = () => {
        if (!acknowledged) {
            addPoints(1, 'Đã xem tin thời tiết nông vụ');
            setAcknowledged(true);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
        }
    };

    const getStatusConfig = () => {
        if (!analysis) return null;

        switch (analysis.status) {
            case 'RED':
                return {
                    bgGradient: 'from-red-500 via-red-600 to-red-700',
                    iconBg: 'bg-red-400/30',
                    icon: <CloudRain className="w-8 h-8 text-white" />,
                    alertIcon: <AlertTriangle className="w-5 h-5 text-yellow-300 animate-pulse" />,
                    accentColor: 'text-yellow-200',
                    buttonBg: 'bg-white/20 hover:bg-white/30',
                    buttonText: 'text-white'
                };
            case 'GREEN':
                return {
                    bgGradient: 'from-green-500 via-emerald-500 to-green-600',
                    iconBg: 'bg-green-400/30',
                    icon: <Sun className="w-8 h-8 text-yellow-300" />,
                    alertIcon: <CheckCircle className="w-5 h-5 text-green-200" />,
                    accentColor: 'text-green-100',
                    buttonBg: 'bg-white/20 hover:bg-white/30',
                    buttonText: 'text-white'
                };
            default:
                return {
                    bgGradient: 'from-amber-500 via-orange-500 to-amber-600',
                    iconBg: 'bg-orange-400/30',
                    icon: <CloudSun className="w-8 h-8 text-white" />,
                    alertIcon: <AlertTriangle className="w-5 h-5 text-yellow-200" />,
                    accentColor: 'text-amber-100',
                    buttonBg: 'bg-white/20 hover:bg-white/30',
                    buttonText: 'text-white'
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-400/30 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-400/50 rounded w-3/4" />
                        <div className="h-3 bg-gray-400/30 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    const config = getStatusConfig();
    if (!config || !analysis) return null;

    return (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${config.bgGradient} p-5 shadow-xl`}>
            {/* Celebration effect */}
            {showCelebration && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                    <div className="text-center animate-bounce">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="text-white font-bold">+1 điểm!</div>
                    </div>
                </div>
            )}

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Sun className="w-full h-full text-white" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center`}>
                        {config.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/80 text-sm font-medium">Thời tiết nông vụ</span>
                            {config.alertIcon}
                        </div>
                        <p className="text-white/60 text-xs">{location}</p>
                    </div>
                </div>

                {/* Current condition badge */}
                <div className={`px-3 py-1 rounded-full ${config.iconBg}`}>
                    <span className="text-white text-xs font-bold">
                        {analysis.status === 'RED' ? '⛔ DỪNG' :
                            analysis.status === 'GREEN' ? '✅ TỐT' : '⚠️ CHÚ Ý'}
                    </span>
                </div>
            </div>

            {/* AI Message */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                <p className="text-white text-base font-medium leading-relaxed">
                    {analysis.message.replace('Bác', farmerName)}
                </p>

                {/* Potential savings warning */}
                {analysis.status === 'RED' && analysis.potentialSavings && (
                    <div className="mt-3 flex items-center gap-2 text-yellow-200">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-bold">
                            Tiết kiệm: {analysis.potentialSavings.toLocaleString()}đ
                        </span>
                    </div>
                )}
            </div>

            {/* Weather stats mini */}
            <div className="flex items-center gap-4 mb-4 text-white/80 text-xs">
                <div className="flex items-center gap-1">
                    <ThermometerSun className="w-4 h-4" />
                    <span>26°C</span>
                </div>
                <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4" />
                    <span>75%</span>
                </div>
                <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4" />
                    <span>8km/h</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                {analysis.status === 'GREEN' && onLogDiary ? (
                    <button
                        onClick={onLogDiary}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-green-700 font-bold py-3 px-4 rounded-xl shadow-lg active:scale-95 transition-transform"
                    >
                        <BookOpen className="w-5 h-5" />
                        Ghi Nhật Ký Bón Phân Ngay
                    </button>
                ) : (
                    <button
                        onClick={handleAcknowledge}
                        disabled={acknowledged}
                        className={`flex-1 flex items-center justify-center gap-2 ${config.buttonBg} ${config.buttonText} font-bold py-3 px-4 rounded-xl backdrop-blur-sm active:scale-95 transition-all ${acknowledged ? 'opacity-50' : ''}`}
                    >
                        {acknowledged ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Đã xem (+1 điểm)
                            </>
                        ) : (
                            <>
                                <Leaf className="w-5 h-5" />
                                Tôi đã rõ (+1 điểm)
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Points indicator */}
            <div className="mt-3 flex items-center justify-center text-white/60 text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                <span>Điểm xanh hiện tại: {balance.points.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default SmartWeatherCard;
