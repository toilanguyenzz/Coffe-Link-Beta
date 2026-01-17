/**
 * LeaderboardCard.tsx
 * Card hiển thị Top Referrers - "Người Mở Đường"
 * Phase 6: Hub Leader Marketing
 */

import React, { useEffect, useState } from 'react';
import { HubLeaderStats } from '../../types';
import { getTopReferrers } from '../../services/ReferralService';
import { Trophy, Users, TrendingUp, Medal } from 'lucide-react';

interface LeaderboardCardProps {
    maxItems?: number;
    showTitle?: boolean;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
    maxItems = 5,
    showTitle = true
}) => {
    const [leaders, setLeaders] = useState<HubLeaderStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            const data = await getTopReferrers(maxItems);
            setLeaders(data);
            setLoading(false);
        };
        loadLeaderboard();
    }, [maxItems]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy size={20} color="#f59e0b" />;
        if (rank === 2) return <Medal size={20} color="#9ca3af" />;
        if (rank === 3) return <Medal size={20} color="#b45309" />;
        return <span style={{ fontWeight: 700, color: '#666' }}>{rank}</span>;
    };

    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)} tỷ`;
        }
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(0)} triệu`;
        }
        return amount.toLocaleString();
    };

    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center'
            }}>
                <p style={{ color: '#666' }}>Đang tải...</p>
            </div>
        );
    }

    if (leaders.length === 0) {
        return (
            <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center'
            }}>
                <Trophy size={32} color="#d4af37" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#666' }}>Chưa có dữ liệu xếp hạng</p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
        }}>
            {showTitle && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 16px 12px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <Trophy size={20} color="#f59e0b" />
                    <h3 style={{ fontWeight: 600 }}>🏆 Top Người Mở Đường</h3>
                </div>
            )}

            <div>
                {leaders.map((leader, index) => (
                    <div
                        key={leader.leaderId}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            borderBottom: index < leaders.length - 1 ? '1px solid #f3f4f6' : 'none',
                            background: index === 0 ? '#fffbeb' : 'white'
                        }}
                    >
                        {/* Rank */}
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: index === 0 ? '#fef3c7' : '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {getRankIcon(leader.rank || index + 1)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600 }}>{leader.leaderName}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Users size={12} />
                                    {leader.totalReferrals} hộ
                                </span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TrendingUp size={12} />
                                    +{leader.monthlyReferrals} tháng này
                                </span>
                            </div>
                        </div>

                        {/* Savings generated */}
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700, color: '#16a34a', fontSize: 14 }}>
                                {formatCurrency(leader.totalSavingsGenerated)}đ
                            </p>
                            <p style={{ fontSize: 11, color: '#666' }}>tiết kiệm</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                padding: '10px 16px',
                background: '#f9fafb',
                textAlign: 'center',
                fontSize: 12,
                color: '#666'
            }}>
                Giới thiệu bà con → Nhận thưởng → Lên bảng vàng ✨
            </div>
        </div>
    );
};

export default LeaderboardCard;
