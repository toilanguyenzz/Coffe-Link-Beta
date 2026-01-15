/**
 * ConsultationResultCard.tsx
 * 
 * Beautiful card component displaying AI consultation results.
 * Shows watering, fertilizer, and cost recommendations.
 * Includes voice reading feature for accessibility.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ConsultationResult, formatVND } from '../../services/ConsultationService';
import {
    speak, stopSpeech, isSpeechSupported, generateConsultationScript
} from '../../services/VoiceService';
import {
    Droplets, Leaf, Coins, Lightbulb, Cloud, AlertTriangle,
    CheckCircle, AlertCircle, Volume2, VolumeX, Loader2
} from 'lucide-react';

interface ConsultationResultCardProps {
    result: ConsultationResult;
    treeCount: number;
}

const ConsultationResultCard: React.FC<ConsultationResultCardProps> = ({ result, treeCount }) => {
    const { status, watering, fertilizer, totalCostVND, tips, weatherSummary } = result;

    // Voice state
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(true);

    // Check voice support on mount
    useEffect(() => {
        setVoiceSupported(isSpeechSupported());
    }, []);

    // Stop speech when component unmounts or result changes
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, [result]);

    // Handle voice toggle
    const handleVoiceToggle = useCallback(() => {
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
        } else {
            const script = generateConsultationScript(result, treeCount);
            speak(
                script,
                { rate: 0.9, pitch: 1 },
                () => setIsSpeaking(false),  // onEnd
                () => setIsSpeaking(true),   // onStart
                () => setIsSpeaking(false)   // onError
            );
        }
    }, [isSpeaking, result, treeCount]);

    // Status colors based on urgency
    const statusColors = {
        good: {
            bg: 'from-emerald-500 to-green-600',
            border: 'border-emerald-400',
            icon: CheckCircle,
        },
        attention: {
            bg: 'from-amber-500 to-orange-600',
            border: 'border-amber-400',
            icon: AlertCircle,
        },
        critical: {
            bg: 'from-red-500 to-rose-600',
            border: 'border-red-400',
            icon: AlertTriangle,
        },
    };

    const statusStyle = statusColors[status.urgencyLevel];
    const StatusIcon = statusStyle.icon;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Voice Read Button - Prominent placement */}
            {voiceSupported && (
                <button
                    onClick={handleVoiceToggle}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${isSpeaking
                            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse'
                            : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]'
                        }`}
                >
                    {isSpeaking ? (
                        <>
                            <VolumeX className="h-6 w-6" />
                            Dừng đọc
                        </>
                    ) : (
                        <>
                            <Volume2 className="h-6 w-6" />
                            🔊 Đọc kết quả cho tôi nghe
                        </>
                    )}
                </button>
            )}

            {/* Main Status Card */}
            <div
                className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl bg-gradient-to-br ${statusStyle.bg}`}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <span className="text-4xl">{status.emoji}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight mb-1">{status.title}</h2>
                        <p className="text-white/80 text-sm leading-relaxed">{status.description}</p>
                    </div>
                </div>

                {/* Weather summary */}
                <div className="relative z-10 mt-4 flex items-center gap-2 text-white/70 text-xs">
                    <Cloud className="h-4 w-4" />
                    <span>{weatherSummary}</span>
                </div>
            </div>

            {/* Watering Recommendation */}
            <div className={`bg-white rounded-2xl p-5 shadow-lg border-l-4 ${watering.urgency === 'high' ? 'border-l-red-500' :
                    watering.urgency === 'medium' ? 'border-l-amber-500' : 'border-l-green-500'
                }`}>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-xl">
                        <Droplets className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">💧 Tưới nước</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${watering.urgency === 'high' ? 'bg-red-100 text-red-700' :
                                    watering.urgency === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {watering.urgency === 'high' ? 'Cấp bách' :
                                    watering.urgency === 'medium' ? 'Cần thiết' : 'Bình thường'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-blue-600">{watering.litersPerTree}</span>
                                <span className="text-gray-500">lít/gốc</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-gray-400 text-xs">Tổng lượng</p>
                                    <p className="font-bold text-gray-700">{(watering.totalLiters / 1000).toFixed(1)} m³</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-gray-400 text-xs">Tần suất</p>
                                    <p className="font-bold text-gray-700">{watering.frequency}</p>
                                </div>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                                📍 {watering.reason}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fertilizer Recommendation */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-l-emerald-500">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-emerald-50 rounded-xl">
                        <Leaf className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">🧪 Bón phân</h3>

                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-600">{fertilizer.gramsPerTree}</span>
                                <span className="text-gray-500">g/gốc</span>
                                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                    {fertilizer.type}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-gray-400 text-xs">Tổng lượng</p>
                                    <p className="font-bold text-gray-700">{fertilizer.totalKg} kg</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-gray-400 text-xs">Thời điểm</p>
                                    <p className="font-bold text-gray-700">{fertilizer.timing}</p>
                                </div>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                                🌱 {fertilizer.reason}
                            </p>
                            <p className="text-gray-400 text-xs">
                                📋 {fertilizer.method}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 shadow-lg text-white">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-md">
                        <Coins className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white/80 text-sm">💰 Chi phí dự tính</p>
                        <p className="text-3xl font-black tracking-tight">{formatVND(totalCostVND)}</p>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-sm">
                    <span className="text-white/70">Nước: {formatVND(watering.costVND)}</span>
                    <span className="text-white/70">Phân: {formatVND(fertilizer.costVND)}</span>
                </div>
            </div>

            {/* Tips Section */}
            {tips.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-purple-500" />
                        <h3 className="font-bold text-purple-900">Mẹo chăm sóc</h3>
                    </div>
                    <ul className="space-y-2">
                        {tips.map((tip, index) => (
                            <li key={index} className="text-sm text-purple-800 leading-relaxed">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Footer info */}
            <p className="text-center text-xs text-gray-400">
                Dựa trên {treeCount.toLocaleString()} cây • Cập nhật {result.generatedAt.toLocaleTimeString('vi-VN')}
            </p>
        </div>
    );
};

export default ConsultationResultCard;

