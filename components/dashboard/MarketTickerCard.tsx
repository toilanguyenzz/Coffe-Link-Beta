/**
 * MarketTickerCard.tsx
 * Khối "Bảng giá thị trường hôm nay" - Market Ticker
 * Hiển thị giá realtime + so sánh với giá App (gom đơn)
 */

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Sparkles,
    Coffee,
    Leaf,
    Package
} from 'lucide-react';

interface MarketPrice {
    id: string;
    name: string;
    icon: React.ElementType;
    marketPrice: number;
    appPrice: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
}

// Mock market data - thực tế sẽ fetch từ API realtime
const mockPrices: MarketPrice[] = [
    {
        id: 'coffee',
        name: 'Cà phê nhân',
        icon: Coffee,
        marketPrice: 95000,
        appPrice: 102000,
        unit: 'kg',
        trend: 'up',
        changePercent: 2.5
    },
    {
        id: 'pepper',
        name: 'Hồ tiêu',
        icon: Leaf,
        marketPrice: 85000,
        appPrice: 89000,
        unit: 'kg',
        trend: 'down',
        changePercent: -1.2
    },
    {
        id: 'fertilizer',
        name: 'NPK Đầu Trâu',
        icon: Package,
        marketPrice: 380000,
        appPrice: 350000,
        unit: 'bao 50kg',
        trend: 'stable',
        changePercent: 0
    }
];

const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN');
};

const MarketTickerCard: React.FC = () => {
    const [prices] = useState<MarketPrice[]>(mockPrices);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    // Auto scroll ticker
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % prices.length);
                setAnimating(false);
            }, 300);
        }, 4000);
        return () => clearInterval(interval);
    }, [prices.length]);

    const currentPrice = prices[currentIndex];
    const Icon = currentPrice.icon;
    const priceDiff = currentPrice.appPrice - currentPrice.marketPrice;
    const isBuying = currentPrice.id === 'fertilizer'; // Phân bón là mua vào
    const advantage = isBuying ? -priceDiff : priceDiff; // Lợi thế khi dùng App

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-400" />
                        </div>
                        <h3 className="text-white font-bold">Bảng Giá Hôm Nay</h3>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>
            </div>

            {/* Ticker Display */}
            <div className={`p-5 transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                {/* Product Info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg">{currentPrice.name}</h4>
                        <div className="flex items-center gap-2">
                            {currentPrice.trend === 'up' ? (
                                <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                                    <TrendingUp className="w-3 h-3" />
                                    +{currentPrice.changePercent}%
                                </span>
                            ) : currentPrice.trend === 'down' ? (
                                <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                                    <TrendingDown className="w-3 h-3" />
                                    {currentPrice.changePercent}%
                                </span>
                            ) : (
                                <span className="text-gray-400 text-xs">Ổn định</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Price Comparison */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Market Price */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Giá đại lý</p>
                        <p className="text-white text-xl font-bold">
                            {formatCurrency(currentPrice.marketPrice)}đ
                        </p>
                        <p className="text-gray-500 text-xs">/{currentPrice.unit}</p>
                    </div>

                    {/* App Price */}
                    <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-2xl p-4 border border-emerald-500/30">
                        <p className="text-emerald-400 text-xs mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Giá qua App
                        </p>
                        <p className="text-white text-xl font-bold">
                            {formatCurrency(currentPrice.appPrice)}đ
                        </p>
                        <p className="text-emerald-400/70 text-xs">/{currentPrice.unit}</p>
                    </div>
                </div>

                {/* Advantage Banner */}
                <div className={`rounded-xl p-3 flex items-center justify-between ${advantage > 0
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
                        : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                    }`}>
                    <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${advantage > 0 ? 'text-green-400' : 'text-amber-400'}`} />
                        <span className="text-white text-sm font-medium">
                            {advantage > 0
                                ? `Lời thêm ${formatCurrency(advantage)}đ/${currentPrice.unit}`
                                : `Tiết kiệm ${formatCurrency(Math.abs(advantage))}đ/${currentPrice.unit}`
                            }
                        </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Price Ticker Strip */}
            <div className="bg-black/30 px-5 py-3 overflow-hidden">
                <div className="flex items-center gap-6 animate-marquee">
                    {prices.map((p, idx) => (
                        <div
                            key={p.id}
                            className={`flex items-center gap-2 whitespace-nowrap ${idx === currentIndex ? 'text-amber-400' : 'text-gray-400'
                                }`}
                        >
                            <span className="font-medium">{p.name}</span>
                            <span className="font-bold">{formatCurrency(p.marketPrice)}đ</span>
                            {p.trend === 'up' ? (
                                <TrendingUp className="w-3 h-3 text-green-400" />
                            ) : p.trend === 'down' ? (
                                <TrendingDown className="w-3 h-3 text-red-400" />
                            ) : null}
                            <span className="text-white/30">•</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 py-3 bg-black/20">
                {prices.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-amber-400 w-6' : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default MarketTickerCard;
