/**
 * GreenPointsWallet.tsx
 * 
 * Compact widget showing green points balance
 * Displays in top-right corner of Dashboard
 */

import React from 'react';
import { useGreenPoints } from '../../contexts/GreenPointsContext';
import { Leaf, Star, ChevronRight } from 'lucide-react';

interface GreenPointsWalletProps {
    onClick?: () => void;
    compact?: boolean;
}

const GreenPointsWallet: React.FC<GreenPointsWalletProps> = ({ onClick, compact = false }) => {
    const { balance, loading } = useGreenPoints();

    const getRankColor = () => {
        switch (balance.rank) {
            case 'Kim Cương': return 'from-cyan-400 to-blue-500';
            case 'Vàng': return 'from-yellow-400 to-amber-500';
            case 'Bạc': return 'from-gray-300 to-gray-400';
            default: return 'from-orange-400 to-orange-600';
        }
    };

    const getRankStars = () => {
        switch (balance.rank) {
            case 'Kim Cương': return '💎';
            case 'Vàng': return '⭐⭐⭐';
            case 'Bạc': return '⭐⭐';
            default: return '⭐';
        }
    };

    if (loading) {
        return (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-lg animate-pulse">
                <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
        );
    }

    if (compact) {
        return (
            <button
                onClick={onClick}
                className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-transform"
            >
                <Leaf className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">
                    {balance.points.toLocaleString()}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-green-100 active:scale-95 transition-all hover:shadow-2xl"
        >
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankColor()} flex items-center justify-center shadow-md`}>
                    <Leaf className="w-5 h-5 text-white" />
                </div>

                {/* Info */}
                <div className="text-left">
                    <div className="flex items-center gap-1">
                        <span className="text-green-700 font-black text-lg">
                            {balance.points.toLocaleString()}
                        </span>
                        <span className="text-green-600 text-xs font-medium">điểm</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500">Hạng:</span>
                        <span className={`font-bold bg-gradient-to-r ${getRankColor()} bg-clip-text text-transparent`}>
                            {balance.rank}
                        </span>
                        <span className="text-xs">{getRankStars()}</span>
                    </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
            </div>

            {/* Progress to next rank */}
            {balance.rank !== 'Kim Cương' && (
                <div className="mt-2 pt-2 border-t border-green-50">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Còn {(balance.nextRankPoints - balance.points).toLocaleString()} điểm</span>
                        <span>lên hạng tiếp</span>
                    </div>
                    <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${getRankColor()} rounded-full transition-all duration-500`}
                            style={{
                                width: `${Math.min(100, (balance.points / balance.nextRankPoints) * 100)}%`
                            }}
                        />
                    </div>
                </div>
            )}
        </button>
    );
};

export default GreenPointsWallet;
