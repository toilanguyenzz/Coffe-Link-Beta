/**
 * LiveTrackerCard.tsx - Phase 2: Trong ngày (WORKING)
 * 
 * Features:
 * - Digital clock counting up
 * - Estimated cost auto-calculating
 * - Breathing green animation
 */

import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Users, Pause, CheckCircle } from 'lucide-react';
import { useWorkCycle } from '../../contexts/WorkCycleContext';

const LiveTrackerCard: React.FC = () => {
    const { jobOffer, workSession, getElapsedTime, endWork } = useWorkCycle();
    const [elapsed, setElapsed] = useState(0);
    const [isPulsing, setIsPulsing] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(getElapsedTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [getElapsedTime]);

    useEffect(() => {
        // Breathing animation toggle
        const pulseInterval = setInterval(() => {
            setIsPulsing(p => !p);
        }, 2000);
        return () => clearInterval(pulseInterval);
    }, []);

    if (!jobOffer || !workSession) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
    const estimatedCost = jobOffer.workerCount * jobOffer.promisedPrice;

    const handleEndWork = () => {
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 100]);
        endWork();
    };

    return (
        <div
            className="w-full max-w-md mx-auto rounded-3xl overflow-hidden transition-all duration-1000"
            style={{
                background: 'linear-gradient(145deg, #FFFFFF, #F0FDF4)',
                boxShadow: isPulsing
                    ? '0 25px 60px -12px rgba(34, 197, 94, 0.3), 0 0 0 3px rgba(34, 197, 94, 0.2)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            }}
        >
            {/* Header - Live Status */}
            <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="w-4 h-4 rounded-full bg-red-500 animate-pulse"
                            style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)' }}
                        />
                    </div>
                    <p className="text-white font-bold text-lg">ĐANG LÀM VIỆC</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">{jobOffer.workerCount} thợ</span>
                </div>
            </div>

            {/* Main Clock */}
            <div className="p-8 text-center">
                <div className="mb-4">
                    <p className="text-gray-500 text-sm mb-2">Thời gian làm việc</p>
                    <div
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl"
                        style={{ background: '#F0FDF4', border: '2px solid #86EFAC' }}
                    >
                        <Clock className="w-8 h-8 text-green-600" />
                        <span
                            className="text-5xl font-mono font-black text-gray-900 tracking-wider"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {formatTime(elapsed)}
                        </span>
                    </div>
                </div>

                {/* Animated Progress Ring */}
                <div className="relative w-40 h-40 mx-auto my-8">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="#22C55E"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="440"
                            strokeDashoffset={440 - (elapsed % 3600) / 3600 * 440}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <DollarSign className="w-8 h-8 text-green-600 mb-1" />
                        <p className="text-2xl font-black text-gray-900">
                            {formatCurrency(estimatedCost)}
                        </p>
                        <p className="text-xs text-gray-500">Dự kiến</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-around mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Giá công</p>
                        <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(jobOffer.promisedPrice)}đ
                        </p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Số thợ</p>
                        <p className="text-lg font-bold text-gray-900">{jobOffer.workerCount}</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Tổng</p>
                        <p className="text-lg font-bold text-green-600">
                            {formatCurrency(estimatedCost)}đ
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 space-y-3" style={{ background: '#F9FAFB' }}>
                <button
                    onClick={handleEndWork}
                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                    style={{
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                    }}
                >
                    <CheckCircle className="w-6 h-6" />
                    KẾT THÚC & THANH TOÁN
                </button>

                <p className="text-center text-gray-400 text-sm">
                    Giữ nút để ghi âm xác nhận
                </p>
            </div>
        </div>
    );
};

export default LiveTrackerCard;
