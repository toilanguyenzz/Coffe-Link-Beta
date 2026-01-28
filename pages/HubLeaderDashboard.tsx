/**
 * HubLeaderDashboard.tsx
 * Dashboard riêng cho Trưởng Hub - Quản lý Campaigns, Referrals, Leaderboard
 * Phase 6: Hub Leader Marketing System
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/DemoAuthContext';
import { useHub } from '../contexts/DemoHubContext';

import CampaignCard from '../components/hub/CampaignCard';
import CampaignQRModal from '../components/hub/CampaignQRModal';
import LeaderboardCard from '../components/hub/LeaderboardCard';
import { getActiveCampaigns } from '../services/CampaignService';
import { getHubLeaderBonuses, getHubLeaderStats } from '../services/ReferralService';
import { Campaign, HubLeaderStats, ReferralBonus } from '../types';
import {
    Crown,
    Users,
    Gift,
    TrendingUp,
    QrCode,
    ChevronRight,
    Wallet,
    History,
    Share2
} from 'lucide-react';

const HubLeaderDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const { currentHub, seasonMode } = useHub();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<HubLeaderStats | null>(null);
    const [bonuses, setBonuses] = useState<ReferralBonus[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'campaigns' | 'referrals' | 'earnings'>('campaigns');

    // Check if user is Hub Leader
    const isHubLeader = userProfile?.role === 'hub_leader';

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!currentHub?.id || !userProfile?.uid) return;

            setLoading(true);
            try {
                const [campaignsData, statsData, bonusesData] = await Promise.all([
                    getActiveCampaigns(currentHub.id),
                    getHubLeaderStats(currentHub.id),
                    getHubLeaderBonuses(userProfile.uid)
                ]);

                setCampaigns(campaignsData);
                setStats(statsData);
                setBonuses(bonusesData);
            } catch (err) {
                console.error('Error loading hub leader data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentHub?.id, userProfile?.uid]);

    // Redirect if not Hub Leader
    if (!isHubLeader) {
        return (
            <div className="page-container">
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <Crown size={48} color="#d4af37" style={{ margin: '0 auto 16px' }} />
                    <h2>Chỉ dành cho Trưởng Hub</h2>
                    <p style={{ color: '#666', marginTop: 8 }}>
                        Liên hệ admin để được cấp quyền Trưởng Hub
                    </p>
                    <button
                        onClick={() => navigate('/hub')}
                        style={{
                            marginTop: 20,
                            padding: '12px 24px',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Về trang Hub
                    </button>
                </div>

            </div>
        );
    }

    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}tr`;
        }
        return amount.toLocaleString();
    };

    const isHarvestMode = seasonMode === 'HARVEST';

    return (
        <div className="page-container" style={{ paddingTop: isHarvestMode ? 50 : 0 }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                padding: '24px 20px',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Crown size={24} />
                    </div>
                    <div>
                        <p style={{ opacity: 0.9, fontSize: 14 }}>Trưởng Hub</p>
                        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{userProfile?.displayName}</h1>
                    </div>
                </div>

                {/* Stats Overview */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    marginTop: 20
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 12,
                        padding: 12,
                        textAlign: 'center'
                    }}>
                        <Users size={20} style={{ marginBottom: 4 }} />
                        <p style={{ fontSize: 20, fontWeight: 700 }}>{stats?.totalReferrals || userProfile?.referralCount || 0}</p>
                        <p style={{ fontSize: 11, opacity: 0.9 }}>Đã giới thiệu</p>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 12,
                        padding: 12,
                        textAlign: 'center'
                    }}>
                        <TrendingUp size={20} style={{ marginBottom: 4 }} />
                        <p style={{ fontSize: 20, fontWeight: 700 }}>+{stats?.monthlyReferrals || 0}</p>
                        <p style={{ fontSize: 11, opacity: 0.9 }}>Tháng này</p>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 12,
                        padding: 12,
                        textAlign: 'center'
                    }}>
                        <Gift size={20} style={{ marginBottom: 4 }} />
                        <p style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(userProfile?.referralBonus || 0)}</p>
                        <p style={{ fontSize: 11, opacity: 0.9 }}>Tiền thưởng</p>
                    </div>
                </div>

                {/* Referral Code */}
                {userProfile?.referralCode && (
                    <div style={{
                        marginTop: 16,
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ fontSize: 12, opacity: 0.8 }}>Mã giới thiệu</p>
                            <p style={{ fontWeight: 700, fontSize: 18 }}>{userProfile.referralCode}</p>
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(userProfile.referralCode || '')}
                            style={{
                                background: 'white',
                                color: '#16a34a',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                background: 'white'
            }}>
                {[
                    { id: 'campaigns', label: 'Campaigns', icon: QrCode },
                    { id: 'referrals', label: 'Giới thiệu', icon: Users },
                    { id: 'earnings', label: 'Thu nhập', icon: Wallet }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: 14,
                                background: 'none',
                                border: 'none',
                                borderBottom: isActive ? '2px solid #16a34a' : '2px solid transparent',
                                color: isActive ? '#16a34a' : '#666',
                                fontWeight: isActive ? 600 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div style={{ padding: 20, paddingBottom: 100 }}>
                {activeTab === 'campaigns' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600 }}>🔥 Campaigns đang chạy</h2>
                        </div>

                        {campaigns.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
                                <QrCode size={40} color="#9ca3af" />
                                <p style={{ marginTop: 8, color: '#666' }}>Chưa có Campaign nào</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {campaigns.map(campaign => (
                                    <div key={campaign.id}>
                                        <CampaignCard campaign={campaign} showActions={false} />
                                        <button
                                            onClick={() => setSelectedCampaign(campaign)}
                                            style={{
                                                width: '100%',
                                                marginTop: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                padding: 12,
                                                background: '#7c3aed',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Share2 size={16} />
                                            Lấy QR & Chia sẻ
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'referrals' && (
                    <>
                        <LeaderboardCard maxItems={10} />
                    </>
                )}

                {activeTab === 'earnings' && (
                    <>
                        <div style={{
                            background: '#f0fdf4',
                            borderRadius: 12,
                            padding: 20,
                            textAlign: 'center',
                            marginBottom: 20
                        }}>
                            <Wallet size={32} color="#16a34a" style={{ marginBottom: 8 }} />
                            <p style={{ fontSize: 14, color: '#666' }}>Tổng tiền thưởng</p>
                            <p style={{ fontSize: 28, fontWeight: 700, color: '#16a34a' }}>
                                {(userProfile?.referralBonus || 0).toLocaleString()}đ
                            </p>
                        </div>

                        <h3 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <History size={18} />
                            Lịch sử thưởng
                        </h3>

                        {bonuses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, background: '#f9fafb', borderRadius: 12 }}>
                                <p style={{ color: '#666' }}>Chưa có giao dịch nào</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {bonuses.map(bonus => (
                                    <div
                                        key={bonus.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: 12,
                                            background: 'white',
                                            borderRadius: 8,
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 500 }}>
                                                {bonus.bonusType === 'SIGNUP' && '👤 Đăng ký mới'}
                                                {bonus.bonusType === 'FIRST_ORDER' && '🛒 Đơn đầu tiên'}
                                                {bonus.bonusType === 'CAMPAIGN_JOIN' && '📦 Tham gia Campaign'}
                                            </p>
                                            <p style={{ fontSize: 12, color: '#666' }}>{bonus.referredUserName}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 600, color: '#16a34a' }}>+{bonus.bonusAmount.toLocaleString()}đ</p>
                                            <span style={{
                                                fontSize: 11,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                background: bonus.status === 'CONFIRMED' ? '#dcfce7' : '#fef3c7',
                                                color: bonus.status === 'CONFIRMED' ? '#166534' : '#92400e'
                                            }}>
                                                {bonus.status === 'PENDING' ? 'Chờ' : 'Đã duyệt'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* QR Modal */}
            {selectedCampaign && (
                <CampaignQRModal
                    campaign={selectedCampaign}
                    onClose={() => setSelectedCampaign(null)}
                />
            )}


        </div>
    );
};

export default HubLeaderDashboard;
