/**
 * RewardCelebration.tsx
 * 
 * Celebration overlay when user earns points
 * Features confetti, sound effect, and animated point display
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Star, Gift, TrendingUp } from 'lucide-react';
import { PointTransaction } from '../../services/GreenCreditService';
import { useGreenPoints } from '../../contexts/GreenPointsContext';

interface RewardCelebrationProps {
    transaction: PointTransaction | null;
    onComplete: () => void;
    autoHide?: boolean;
    autoHideDelay?: number;
}

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
    const randomX = Math.random() * 100;
    const randomDuration = 2 + Math.random() * 2;

    return (
        <div
            className="absolute w-3 h-3 rounded-sm animate-bounce"
            style={{
                left: `${randomX}%`,
                top: '-10%',
                backgroundColor: color,
                animation: `fall ${randomDuration}s ease-in forwards`,
                animationDelay: `${delay}s`,
                transform: `rotate(${Math.random() * 360}deg)`
            }}
        />
    );
};

const RewardCelebration: React.FC<RewardCelebrationProps> = ({
    transaction,
    onComplete,
    autoHide = true,
    autoHideDelay = 3000
}) => {
    const { balance } = useGreenPoints();
    const [visible, setVisible] = useState(false);
    const [confetti, setConfetti] = useState<{ id: number; color: string; delay: number }[]>([]);

    useEffect(() => {
        if (transaction && transaction.amount > 0) {
            setVisible(true);

            // Generate confetti
            const colors = ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6'];
            const particles = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5
            }));
            setConfetti(particles);

            // Play sound (if available)
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJirnMKIgId0d3tkgY+LjV9VRU5+uP/Y1b6TkYZyamt0e3t3bmZjZml1f3N1');
                audio.volume = 0.3;
                audio.play().catch(() => { });
            } catch (e) { }

            // Auto hide
            if (autoHide) {
                const timer = setTimeout(() => {
                    setVisible(false);
                    setTimeout(onComplete, 300);
                }, autoHideDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [transaction, autoHide, autoHideDelay, onComplete]);

    if (!visible || !transaction || transaction.amount <= 0) return null;

    // Determine rank progress
    const getNextRankInfo = () => {
        const { points, nextRankPoints, rank } = balance;
        const remaining = nextRankPoints - points;
        return { remaining, rank };
    };

    const rankInfo = getNextRankInfo();

    return (
        <>
            {/* CSS for falling animation */}
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>

            {/* Overlay */}
            <div
                className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => {
                    setVisible(false);
                    onComplete();
                }}
            >
                {/* Confetti */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {confetti.map(p => (
                        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />
                    ))}
                </div>

                {/* Celebration Card */}
                <div
                    className="relative bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sparkle decorations */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Stars decoration */}
                    <div className="absolute top-2 left-4 animate-pulse">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="absolute top-6 right-6 animate-pulse" style={{ animationDelay: '0.5s' }}>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>

                    {/* Content */}
                    <div className="text-center mt-6">
                        <h2 className="text-3xl font-black text-green-600 mb-2">
                            TUYỆT VỜI!
                        </h2>

                        {/* Points earned */}
                        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl py-4 px-6 mb-4">
                            <TrendingUp className="w-6 h-6" />
                            <span className="text-3xl font-black">+{transaction.amount}</span>
                            <span className="text-lg font-medium">điểm Xanh</span>
                        </div>

                        {/* Reason */}
                        <p className="text-gray-600 text-sm mb-4">
                            {transaction.reason}
                        </p>

                        {/* Current total */}
                        <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-sm">Tổng điểm hiện tại:</span>
                                <span className="text-green-600 font-black text-xl">
                                    {balance.points.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500 text-sm">Hạng:</span>
                                <span className="text-amber-600 font-bold">
                                    {balance.rank} ⭐
                                </span>
                            </div>
                        </div>

                        {/* Progress to reward */}
                        {rankInfo.remaining > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Gift className="w-4 h-4 text-pink-500" />
                                <span>Còn <strong>{rankInfo.remaining}</strong> điểm nữa là lên hạng!</span>
                            </div>
                        )}

                        {/* Close button */}
                        <button
                            onClick={() => {
                                setVisible(false);
                                onComplete();
                            }}
                            className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RewardCelebration;
