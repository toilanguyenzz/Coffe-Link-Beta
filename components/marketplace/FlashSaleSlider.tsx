
import React, { useState, useEffect } from 'react';
import { Timer, FireExtinguisher as Fire, ChevronRight, Leaf } from 'lucide-react';
import { Deal } from '../../types';

interface FlashSaleSliderProps {
    deals: Deal[];
    onItemClick: (deal: Deal) => void;
}

const FlashSaleSlider: React.FC<FlashSaleSliderProps> = ({ deals, onItemClick }) => {
    // Filter deals with progress > 60% (lowered threshold to ensure we have items to show)
    // or fallback to top deals if none meet the criteria
    const highDemandDeals = deals.filter(deal =>
        (deal.currentQuantity / deal.maxQuantity) > 0.8
    );

    // If no high demand deals, take top 5 from the original list
    const displayDeals = highDemandDeals.length > 0 ? highDemandDeals : deals.slice(0, 5);

    // Mock countdown timer
    const [timeLeft, setTimeLeft] = useState({
        hours: 12,
        minutes: 45,
        seconds: 30
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 23, minutes: 59, seconds: 59 }; // Reset for demo
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time helper
    const fmt = (n: number) => n.toString().padStart(2, '0');

    if (displayDeals.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 blur-sm opacity-50 animate-pulse rounded-full" />
                        <Fire className="w-5 h-5 text-red-500 relative z-10" fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-white font-bold text-lg leading-none flex items-center gap-2">
                            FLASH SALE <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider skew-x-[-10deg]">HOT</span>
                        </h2>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-white/60 text-xs">Kết thúc trong:</span>
                            <div className="flex gap-0.5 items-center">
                                <span className="bg-white/10 text-white text-xs font-mono px-1 rounded">{fmt(timeLeft.hours)}</span>
                                <span className="text-white/40 text-xs">:</span>
                                <span className="bg-white/10 text-white text-xs font-mono px-1 rounded">{fmt(timeLeft.minutes)}</span>
                                <span className="text-white/40 text-xs">:</span>
                                <span className="bg-red-500/20 text-red-400 text-xs font-mono px-1 rounded border border-red-500/30">{fmt(timeLeft.seconds)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="text-white/50 text-xs flex items-center gap-1 hover:text-white transition-colors">
                    Xem tất cả <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto pb-4 px-4 flex gap-4 snap-x hide-scrollbar">
                {displayDeals.map((deal) => {
                    const progress = (deal.currentQuantity / deal.maxQuantity) * 100;
                    const discountPercent = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

                    return (
                        <div
                            key={deal.id}
                            onClick={() => onItemClick(deal)}
                            className="snap-center shrink-0 w-[240px] bg-[#0c2e1e] rounded-xl overflow-hidden border border-white/5 relative active:scale-[0.98] transition-transform"
                            style={{
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            {/* Hot Badge */}
                            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                                <Fire className="w-3 h-3" fill="currentColor" /> -{discountPercent}%
                            </div>

                            {/* Image Area */}
                            <div className="h-32 w-full bg-gray-800 relative">
                                <img
                                    src={deal.productImage || 'https://via.placeholder.com/200'}
                                    alt={deal.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                        <Leaf className="w-4 h-4 text-green-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h3 className="text-white font-medium text-sm line-clamp-2 h-10 mb-2 leading-tight">
                                    {deal.title}
                                </h3>

                                <div className="flex items-end gap-2 mb-3">
                                    <span className="text-red-400 font-bold text-lg">
                                        {(deal.price / 1000).toFixed(0)}k
                                    </span>
                                    <span className="text-white/40 text-xs line-through mb-1">
                                        {(deal.originalPrice / 1000).toFixed(0)}k
                                    </span>
                                </div>

                                {/* Progress Bar with Fire Effect */}
                                <div className="relative">
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full relative"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        >
                                            {/* Shimmer */}
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] uppercase">
                                            {progress >= 100 ? 'Cháy hàng' : `Sắp hết: còn ${deal.maxQuantity - deal.currentQuantity}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FlashSaleSlider;
