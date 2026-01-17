/**
 * SocialLeaderboardCard.tsx
 * Khối "Bảng phong thần" - Social Leaderboard
 * Hiển thị top người giúp cộng đồng + tạo competitive motivation
 */

import React from 'react';
import {
    Trophy,
    Users,
    TrendingUp,
    Crown,
    Medal,
    Star,
    ChevronRight
} from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    name: string;
    hubName: string;
    achievement: string;
    value: string;
    avatar?: string;
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
    {
        rank: 1,
        name: 'Bác Ba',
        hubName: 'Trạm Chư Pah',
        achievement: 'Giúp xóm tiết kiệm',
        value: '5 triệu đồng'
    },
    {
        rank: 2,
        name: 'Anh Bốn',
        hubName: 'Trạm Chư Sê',
        achievement: 'Mời hàng xóm tham gia',
        value: '10 người'
    },
    {
        rank: 3,
        name: 'Chị Năm',
        hubName: 'Trạm Ia Hlốp',
        achievement: 'Gom đơn phân bón',
        value: '2 tấn'
    }
];

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1:
            return <Crown className="w-5 h-5 text-yellow-400" />;
        case 2:
            return <Medal className="w-5 h-5 text-gray-300" />;
        case 3:
            return <Medal className="w-5 h-5 text-amber-600" />;
        default:
            return <Star className="w-5 h-5 text-gray-500" />;
    }
};

const getRankStyle = (rank: number) => {
    switch (rank) {
        case 1:
            return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
        case 2:
            return 'bg-white/5 border-white/10';
        case 3:
            return 'bg-white/5 border-white/10';
        default:
            return 'bg-white/5 border-white/10';
    }
};

const SocialLeaderboardCard: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-violet-600/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">🏆 Bảng Phong Thần</h3>
                            <p className="text-purple-300 text-xs">Người hùng của xóm</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-1 text-purple-300 text-sm hover:text-white transition-colors">
                        Xem tất cả
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="p-4 space-y-3">
                {mockLeaderboard.map((entry, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${getRankStyle(entry.rank)}`}
                    >
                        {/* Rank Badge */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.rank === 1
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30'
                                : 'bg-white/10'
                            }`}>
                            {getRankIcon(entry.rank)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-white font-bold truncate">{entry.name}</h4>
                                <span className="text-xs text-purple-300 px-2 py-0.5 bg-purple-500/20 rounded-full">
                                    {entry.hubName}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm truncate">
                                {entry.achievement}
                            </p>
                        </div>

                        {/* Value */}
                        <div className="text-right">
                            <p className="text-white font-bold text-lg">
                                {entry.value}
                            </p>
                            {entry.rank === 1 && (
                                <span className="text-xs text-yellow-400 flex items-center gap-1 justify-end">
                                    <TrendingUp className="w-3 h-3" />
                                    Top 1
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:to-violet-600 transition-all shadow-lg shadow-purple-500/30">
                    <Users className="w-5 h-5" />
                    Mời bạn bè để leo hạng
                </button>
            </div>

            {/* Motivational Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-5 py-3 border-t border-yellow-500/20">
                <p className="text-center text-sm text-yellow-300">
                    🌟 Giúp cộng đồng → Lên bảng vàng → Được yêu quý!
                </p>
            </div>
        </div>
    );
};

export default SocialLeaderboardCard;
