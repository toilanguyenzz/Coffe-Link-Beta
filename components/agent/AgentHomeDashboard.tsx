/**
 * AgentHomeDashboard.tsx
 * Home tab for Agent - Shows today's stats, market prices, notifications
 */

import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Scale,
    Wallet,
    Bell,
    Coffee,
    ArrowRight,
    Zap
} from 'lucide-react';

// Mock data for demo
const MOCK_TODAY_STATS = {
    purchaseCount: 12,
    totalWeightKg: 2450,
    totalSpent: 245000000, // 245 triệu
    averagePricePerKg: 100000,
};

const MOCK_MARKET_PRICE = {
    source: 'LONDON' as const,
    priceVND: 102500,
    change: 2.3, // +2.3%
    updatedAt: new Date(),
};

const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        type: 'PURCHASE_REQUEST',
        title: '🏭 Coffee ID cần mua 50 tấn vỏ cà phê',
        message: 'Giá 500đ/kg. Hạn: 30/01/2026',
        read: false,
    },
    {
        id: '2',
        type: 'PRICE_UPDATE',
        title: '📈 Giá cà phê tăng 2.3%',
        message: 'Giá London đạt đỉnh 3 tháng',
        read: true,
    },
];

const AgentHomeDashboard: React.FC = () => {
    const stats = MOCK_TODAY_STATS;
    const marketPrice = MOCK_MARKET_PRICE;
    const notifications = MOCK_NOTIFICATIONS;

    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)} tỷ`;
        } else if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)} triệu`;
        }
        return `${amount.toLocaleString()}đ`;
    };

    return (
        <div className="space-y-4 mt-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* TODAY'S STATS */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div
                className="p-5 rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-white font-bold text-lg">Hôm nay</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Total Weight */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Scale className="w-4 h-4 text-emerald-400" />
                            <span className="text-white/60 text-xs">Đã mua</span>
                        </div>
                        <p className="text-white text-2xl font-bold">
                            {(stats.totalWeightKg / 1000).toFixed(1)} <span className="text-lg">tấn</span>
                        </p>
                        <p className="text-emerald-400/70 text-xs mt-1">
                            {stats.purchaseCount} lượt thu mua
                        </p>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-4 h-4 text-amber-400" />
                            <span className="text-white/60 text-xs">Đã chi</span>
                        </div>
                        <p className="text-white text-2xl font-bold">
                            {formatCurrency(stats.totalSpent)}
                        </p>
                        <p className="text-amber-400/70 text-xs mt-1">
                            TB: {(stats.averagePricePerKg / 1000).toFixed(0)}k/kg
                        </p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* MARKET PRICE CARD */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div
                className="p-5 rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                }}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-amber-400" />
                        <h2 className="text-white font-bold">Giá cà phê hôm nay</h2>
                    </div>
                    <span className="text-white/40 text-xs">Sàn {marketPrice.source}</span>
                </div>

                <div className="flex items-baseline gap-3">
                    <span className="text-white text-3xl font-black">
                        {(marketPrice.priceVND / 1000).toFixed(1)}k
                    </span>
                    <span className="text-white/50">/kg</span>

                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${marketPrice.change >= 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                        {marketPrice.change >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        {marketPrice.change >= 0 ? '+' : ''}{marketPrice.change}%
                    </div>
                </div>

                <p className="text-white/40 text-xs mt-2">
                    Cập nhật: {marketPrice.updatedAt.toLocaleTimeString('vi-VN')}
                </p>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* NOTIFICATIONS */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-white/60" />
                        <h2 className="text-white font-bold">Thông báo</h2>
                    </div>
                    <button className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-xl transition-all ${notif.read
                                    ? 'bg-white/5'
                                    : 'bg-emerald-500/10 border border-emerald-500/30'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-white font-medium text-sm">{notif.title}</h3>
                                    <p className="text-white/50 text-xs mt-1">{notif.message}</p>
                                </div>
                                {!notif.read && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* QUICK ACTIONS */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    className="p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    }}
                >
                    <Scale className="w-5 h-5" />
                    Thu mua ngay
                </button>

                <button
                    className="p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
                    }}
                >
                    <Wallet className="w-5 h-5" />
                    Xem sổ nợ
                </button>
            </div>
        </div>
    );
};

export default AgentHomeDashboard;
