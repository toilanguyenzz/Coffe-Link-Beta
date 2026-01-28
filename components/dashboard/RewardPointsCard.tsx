/**
 * RewardPointsCard.tsx - Widget điểm thưởng cho Dashboard
 * Hiển thị điểm, level, progress
 */

import React, { useState } from 'react';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import * as RewardSystem from '../../services/RewardSystem';
import { Gift, ChevronRight, Star, Calendar, TrendingUp } from 'lucide-react';

interface RewardPointsCardProps {
    onViewHistory?: () => void;
}

const RewardPointsCard: React.FC<RewardPointsCardProps> = ({ onViewHistory }) => {
    const { userProfile } = useDemoAuth();
    const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);

    if (!userProfile) return null;

    const points = RewardSystem.getPoints(userProfile.uid);
    const levelProgress = RewardSystem.getLevelProgress(userProfile.uid);
    const canCheckin = RewardSystem.canCheckIn(userProfile.uid);
    const recentHistory = RewardSystem.getHistory(userProfile.uid).slice(0, 3);

    const handleCheckin = () => {
        const result = RewardSystem.doCheckIn(userProfile.uid);
        if (result.success) {
            setShowCheckinSuccess(true);
            setTimeout(() => setShowCheckinSuccess(false), 3000);
        }
    };

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                        <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Điểm Thưởng</h3>
                        <p className="text-xs text-gray-500">{levelProgress.current.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-amber-600">{points}</div>
                    <div className="text-xs text-gray-500">điểm</div>
                </div>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl">
                <div className="text-3xl">{levelProgress.current.badge}</div>
                <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-600">Level {levelProgress.current.level}</span>
                        {levelProgress.next && (
                            <span className="text-gray-400">
                                Còn {levelProgress.pointsToNext} điểm → Lv.{levelProgress.next.level}
                            </span>
                        )}
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${levelProgress.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Check-in Button */}
            {canCheckin && (
                <button
                    onClick={handleCheckin}
                    className="w-full mb-3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                    <Calendar className="h-5 w-5" />
                    <span>Check-in nhận 5 điểm!</span>
                </button>
            )}

            {showCheckinSuccess && (
                <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-xl text-center animate-pulse">
                    <p className="text-green-700 font-bold">🎉 +5 điểm! Check-in thành công!</p>
                </div>
            )}

            {/* Recent History */}
            {recentHistory.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gần đây</h4>
                        {onViewHistory && (
                            <button
                                onClick={onViewHistory}
                                className="text-xs text-amber-600 font-medium flex items-center gap-1 hover:underline"
                            >
                                Xem tất cả <ChevronRight size={12} />
                            </button>
                        )}
                    </div>
                    {recentHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Star className="h-4 w-4 text-amber-500" />
                                </div>
                                <span className="text-sm text-gray-600">{item.description}</span>
                            </div>
                            <span className="text-sm font-bold text-amber-600">+{item.points}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Perks */}
            <div className="mt-4 pt-3 border-t border-amber-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <TrendingUp size={14} className="text-amber-500" />
                    <span>Đặc quyền: {levelProgress.current.perks[0]}</span>
                </div>
            </div>
        </div>
    );
};

export default RewardPointsCard;
