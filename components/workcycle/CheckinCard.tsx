/**
 * CheckinCard.tsx - Phase 1: Điểm danh sáng (7:00 AM)
 * 
 * Features:
 * - Pre-filled data from JobOffer
 * - Warning if price lowered
 * - Big "BẮT ĐẦU LÀM VIỆC" button
 */

import React, { useState } from 'react';
import { Sun, Users, Tag, Play, AlertTriangle, Check } from 'lucide-react';
import { useWorkCycle } from '../../contexts/WorkCycleContext';

const CheckinCard: React.FC = () => {
    const { jobOffer, startWork, reputation } = useWorkCycle();
    const [adjustedPrice, setAdjustedPrice] = useState(jobOffer?.promisedPrice || 250000);
    const [showWarning, setShowWarning] = useState(false);

    if (!jobOffer) return null;

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
    const isLowerPrice = adjustedPrice < jobOffer.promisedPrice;

    const handleStart = () => {
        if (isLowerPrice) {
            setShowWarning(true);
            // Vibrate warning
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
            return;
        }
        if ('vibrate' in navigator) navigator.vibrate(100);
        startWork();
    };

    const confirmStart = () => {
        if ('vibrate' in navigator) navigator.vibrate(100);
        startWork();
    };

    return (
        <div
            className="w-full max-w-md mx-auto rounded-3xl overflow-hidden"
            style={{
                background: 'linear-gradient(145deg, #FFFFFF, #FFFBEB)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
            }}
        >
            {/* Header - Morning Theme */}
            <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                        <Sun className="w-7 h-7 text-yellow-100" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Chào buổi sáng!</h2>
                        <p className="text-yellow-100 text-sm">Thợ tới chưa bác?</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-yellow-100 text-sm">Hôm nay</p>
                    <p className="text-white font-bold">
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long' })}
                    </p>
                </div>
            </div>

            {/* Reminder Banner */}
            <div
                className="px-6 py-3 flex items-center gap-3"
                style={{ background: '#FEF3C7' }}
            >
                <span className="text-2xl">📢</span>
                <p className="text-amber-800 font-medium">
                    Hôm qua bác hứa giá <span className="font-bold">{formatCurrency(jobOffer.promisedPrice)}đ</span> đấy nhé!
                </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {/* Worker Count - Pre-filled */}
                <div
                    className="flex items-center justify-between p-5 rounded-2xl"
                    style={{ background: '#F0FDF4', border: '2px solid #86EFAC' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#DCFCE7' }}
                        >
                            <Users className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Số thợ đến</p>
                            <p className="text-4xl font-black text-gray-900">{jobOffer.workerCount}</p>
                        </div>
                    </div>
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: '#22C55E' }}
                    >
                        <Check className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Price - Pre-filled but editable */}
                <div
                    className="p-5 rounded-2xl"
                    style={{
                        background: isLowerPrice ? '#FEF2F2' : '#F0FDF4',
                        border: `2px solid ${isLowerPrice ? '#FCA5A5' : '#86EFAC'}`
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center"
                                style={{ background: isLowerPrice ? '#FECACA' : '#DCFCE7' }}
                            >
                                <Tag className="w-7 h-7" style={{ color: isLowerPrice ? '#DC2626' : '#16A34A' }} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Giá công hôm nay</p>
                                <p className="text-3xl font-black text-gray-900">
                                    {formatCurrency(adjustedPrice)}đ
                                </p>
                            </div>
                        </div>
                    </div>

                    {isLowerPrice && (
                        <div className="mt-3 flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="font-medium">Thấp hơn cam kết {formatCurrency(jobOffer.promisedPrice - adjustedPrice)}đ!</p>
                        </div>
                    )}
                </div>

                {/* Quick Adjust */}
                <div className="flex gap-2">
                    {[jobOffer.promisedPrice - 20000, jobOffer.promisedPrice, jobOffer.promisedPrice + 10000].map(p => (
                        <button
                            key={p}
                            onClick={() => setAdjustedPrice(p)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${adjustedPrice === p ? 'ring-2 ring-green-500' : ''
                                } ${p < jobOffer.promisedPrice ? 'opacity-60' : ''}`}
                            style={{
                                background: adjustedPrice === p ? '#DCFCE7' : '#F1F5F9',
                                color: adjustedPrice === p ? '#16A34A' : '#6B7280'
                            }}
                        >
                            {p / 1000}k
                            {p === jobOffer.promisedPrice && ' ✓'}
                        </button>
                    ))}
                </div>

                {/* Total */}
                <div
                    className="p-4 rounded-2xl text-center"
                    style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}
                >
                    <p className="text-sm text-emerald-600 font-medium">Tổng dự kiến hôm nay</p>
                    <p className="text-3xl font-black text-emerald-700">
                        {formatCurrency(jobOffer.workerCount * adjustedPrice)}đ
                    </p>
                </div>

                {/* CTA */}
                <button
                    onClick={handleStart}
                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                    style={{
                        background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
                    }}
                >
                    <Play className="w-6 h-6" />
                    BẮT ĐẦU LÀM VIỆC
                </button>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl overflow-hidden"
                        style={{ background: 'white' }}
                    >
                        <div className="p-6 text-center space-y-4" style={{ background: '#FEF2F2' }}>
                            <div className="w-20 h-20 mx-auto rounded-full bg-red-500 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-red-700">Cảnh báo!</h3>
                            <p className="text-red-600">
                                Bác đang trả thấp hơn cam kết. Điều này sẽ <strong>mất uy tín</strong> với thợ.
                            </p>
                        </div>

                        <div className="p-4 space-y-3">
                            <button
                                onClick={() => { setAdjustedPrice(jobOffer.promisedPrice); setShowWarning(false); }}
                                className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold"
                            >
                                Giữ giá cam kết ({formatCurrency(jobOffer.promisedPrice)}đ)
                            </button>
                            <button
                                onClick={() => { setShowWarning(false); confirmStart(); }}
                                className="w-full py-4 rounded-2xl bg-gray-200 text-gray-700 font-medium"
                            >
                                Vẫn tiếp tục (Mất uy tín)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckinCard;
