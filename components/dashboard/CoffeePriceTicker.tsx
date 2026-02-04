/**
 * CoffeePriceTicker.tsx - Compact coffee price display
 * Shows current Robusta price with trend indicator
 */

import React from 'react';
import { Coffee, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface CoffeePriceTickerProps {
    price: number;
    change: number; // percentage change
    onClick?: () => void;
}

const CoffeePriceTicker: React.FC<CoffeePriceTickerProps> = ({
    price = 117500,
    change = 2.5,
    onClick,
}) => {
    const isPositive = change >= 0;

    return (
        <button
            onClick={onClick}
            className="mx-4 mb-4 flex items-center justify-between 
                 bg-gradient-to-r from-amber-900/90 via-yellow-900/90 to-amber-900/90
                 backdrop-blur-md rounded-2xl px-4 py-3.5
                 border border-amber-600/30 shadow-lg
                 active:scale-[0.98] transition-all duration-200
                 cursor-pointer"
        >
            {/* Left: Coffee icon + Price */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/30 rounded-xl flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-amber-300" />
                </div>
                <div className="text-left">
                    <span className="text-amber-200/70 text-xs font-medium block">Robusta hôm nay</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-white text-xl font-bold">
                            {price.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-amber-200/80 text-sm">đ/kg</span>
                    </div>
                </div>
            </div>

            {/* Right: Change indicator */}
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-200/50" />
            </div>
        </button>
    );
};

export default CoffeePriceTicker;
