/**
 * RecruitCard.tsx - Phase 0: Tuyển thợ
 * 
 * Features:
 * - Input số thợ + giá cam kết
 * - Generate Zalo Poster
 * - Show reputation badge
 */

import React, { useState } from 'react';
import { Users, Tag, Sparkles, Share2, ChevronUp, ChevronDown, Award } from 'lucide-react';
import { useWorkCycle } from '../../contexts/WorkCycleContext';
import * as ReputationService from '../../services/ReputationService';

interface RecruitCardProps {
    onPosterGenerated?: (posterUrl: string) => void;
}

const RecruitCard: React.FC<RecruitCardProps> = ({ onPosterGenerated }) => {
    const { createJobOffer, reputation } = useWorkCycle();
    const [workerCount, setWorkerCount] = useState(5);
    const [price, setPrice] = useState(270000);
    const [showPoster, setShowPoster] = useState(false);

    const marketPrice = 250000;
    const priceBonus = price - marketPrice;
    const repLevel = ReputationService.getReputationLevel(reputation.score);

    const handleCreateOffer = () => {
        createJobOffer(workerCount, price);
        setShowPoster(true);
    };

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <div
            className="w-full max-w-md mx-auto rounded-3xl overflow-hidden"
            style={{
                background: 'linear-gradient(145deg, #FFFFFF, #F8FAFC)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
            }}
        >
            {/* Header với Reputation Badge */}
            <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #065F46, #047857)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Tuyển Thợ</h2>
                        <p className="text-emerald-200 text-sm">Tạo tin mới</p>
                    </div>
                </div>

                {/* Reputation Badge */}
                <div
                    className="px-3 py-1.5 rounded-full flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                    <Award className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-sm font-medium">
                        {repLevel.level}
                    </span>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
                {/* Số thợ */}
                <div
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: '#F1F5F9' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#DBEAFE' }}
                        >
                            <Users className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Số thợ cần</p>
                            <p className="text-3xl font-bold text-gray-900">{workerCount}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setWorkerCount(c => Math.min(20, c + 1))}
                            className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            style={{ background: '#DCFCE7' }}
                        >
                            <ChevronUp className="w-6 h-6 text-green-600" />
                        </button>
                        <button
                            onClick={() => setWorkerCount(c => Math.max(1, c - 1))}
                            className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            style={{ background: '#FEE2E2' }}
                        >
                            <ChevronDown className="w-6 h-6 text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Giá công */}
                <div
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: '#F1F5F9' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#FEF3C7' }}
                        >
                            <Tag className="w-7 h-7 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Giá cam kết</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(price)}đ</p>
                            {priceBonus > 0 && (
                                <p className="text-sm text-green-600 font-medium">
                                    +{formatCurrency(priceBonus)} so với thị trường 🔥
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setPrice(p => p + 10000)}
                            className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            style={{ background: '#DCFCE7' }}
                        >
                            <ChevronUp className="w-6 h-6 text-green-600" />
                        </button>
                        <button
                            onClick={() => setPrice(p => Math.max(100000, p - 10000))}
                            className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                            style={{ background: '#FEE2E2' }}
                        >
                            <ChevronDown className="w-6 h-6 text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Quick Price Buttons */}
                <div className="flex gap-2">
                    {[250000, 270000, 280000, 300000].map(p => (
                        <button
                            key={p}
                            onClick={() => setPrice(p)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${price === p ? 'ring-2 ring-green-500' : ''
                                }`}
                            style={{
                                background: price === p ? '#DCFCE7' : '#F1F5F9',
                                color: price === p ? '#16A34A' : '#6B7280'
                            }}
                        >
                            {p / 1000}k
                        </button>
                    ))}
                </div>

                {/* Summary */}
                <div
                    className="p-4 rounded-2xl text-center"
                    style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}
                >
                    <p className="text-sm text-emerald-600 font-medium">Tổng dự kiến</p>
                    <p className="text-3xl font-black text-emerald-700">
                        {formatCurrency(workerCount * price)}đ
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleCreateOffer}
                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                    style={{
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
                    }}
                >
                    <Share2 className="w-6 h-6" />
                    TẠO TIN & CHIA SẺ ZALO
                </button>
            </div>

            {/* Poster Preview Modal */}
            {showPoster && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setShowPoster(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #065F46, #047857)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 text-center space-y-4">
                            <p className="text-emerald-200 text-lg">🌿 CoffeeLink Agri-OS</p>
                            <h3 className="text-4xl font-black text-white">CẦN TUYỂN THỢ</h3>

                            <div className="py-6 space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-5xl font-black text-white">{workerCount}</p>
                                    <p className="text-2xl text-emerald-200">thợ</p>
                                </div>

                                <div className="pt-4">
                                    <p className="text-emerald-200">Giá công</p>
                                    <p className="text-4xl font-black text-yellow-300">
                                        {formatCurrency(price)}đ
                                    </p>
                                    {priceBonus > 0 && (
                                        <p className="text-lg text-yellow-200 mt-1">
                                            Cao hơn thị trường {formatCurrency(priceBonus)}đ 🔥
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <Award className="w-5 h-5 text-yellow-300" />
                                <p className="text-white font-medium">Uy tín: {repLevel.level}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white/10">
                            <button
                                onClick={() => setShowPoster(false)}
                                className="w-full py-4 rounded-2xl bg-white text-emerald-700 font-bold text-lg"
                            >
                                ✓ Đã tạo tin - Bắt đầu ngày mai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitCard;
