/**
 * HubDashboard.tsx
 * Trang "Trạm của tôi" - Hub Dashboard cho Farmer
 * Tầng 4: UX Flow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHub } from '../contexts/HubContext';
import BottomNav from '../components/layout/BottomNav';
import HubSelector from '../components/hub/HubSelector';
import CampaignCard from '../components/hub/CampaignCard';
import { getActiveCampaigns } from '../services/CampaignService';
import { seedAndAssignToHub } from '../utils/seedMockData';
import HubInviteModal from '../components/hub/HubInviteModal';
import { Campaign } from '../types';
import {
    MapPin,
    Users,
    ShoppingBag,
    Wrench,
    Phone,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    Database,
    UserPlus
} from 'lucide-react';

const HubDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const { currentHub, seasonMode, loading, error, locationPermission, isManualLocation, requestLocationAndRoute } = useHub();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [showHubSelector, setShowHubSelector] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Check xem cần chọn Hub không
    useEffect(() => {
        if (!loading && !currentHub && userProfile) {
            // User chưa có Hub -> Cần chọn
            if (locationPermission === 'denied') {
                setShowHubSelector(true);
            }
        }
    }, [loading, currentHub, userProfile, locationPermission]);

    // Load campaigns khi có Hub
    useEffect(() => {
        const loadCampaigns = async () => {
            if (!currentHub?.id) return;

            setLoadingCampaigns(true);
            try {
                const data = await getActiveCampaigns(currentHub.id);
                setCampaigns(data);
            } catch (err) {
                console.error('Error loading campaigns:', err);
            } finally {
                setLoadingCampaigns(false);
            }
        };

        loadCampaigns();
    }, [currentHub?.id]);

    // Request GPS on mount nếu chưa có Hub
    useEffect(() => {
        if (!loading && !currentHub && userProfile && locationPermission !== 'denied') {
            requestLocationAndRoute();
        }
    }, [loading, currentHub, userProfile, locationPermission, requestLocationAndRoute]);

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <RefreshCw className="animate-spin" size={32} color="#16a34a" />
                </div>
                <BottomNav />
            </div>
        );
    }

    // Nếu chưa có Hub và cần chọn thủ công
    if (!currentHub && showHubSelector) {
        return (
            <div className="page-container">
                <HubSelector onComplete={() => setShowHubSelector(false)} />
                <BottomNav />
            </div>
        );
    }

    // Nếu chưa có Hub và đang chờ GPS
    if (!currentHub) {
        const handleSeedMockData = async () => {
            if (!userProfile?.uid) return;
            try {
                await seedAndAssignToHub(userProfile.uid);
                window.location.reload();
            } catch (err) {
                console.error('Error seeding mock data:', err);
            }
        };

        return (
            <div className="page-container">
                <div style={{ padding: 20, textAlign: 'center' }}>
                    <MapPin size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ marginBottom: 8 }}>Đang tìm Trạm gần bạn...</h2>
                    <p style={{ color: '#666', marginBottom: 20 }}>
                        Cho phép ứng dụng truy cập vị trí để tìm kho phân bón và dịch vụ gần nhất
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                            <p style={{ color: '#dc2626' }}>{error}</p>
                        </div>
                    )}

                    <button
                        onClick={() => requestLocationAndRoute()}
                        style={{
                            background: '#16a34a',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: 8,
                            border: 'none',
                            fontWeight: 600,
                            marginBottom: 12,
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%'
                        }}
                    >
                        Cho phép truy cập vị trí
                    </button>

                    <button
                        onClick={() => setShowHubSelector(true)}
                        style={{
                            background: 'transparent',
                            color: '#16a34a',
                            padding: '12px 24px',
                            border: '1px solid #16a34a',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%',
                            marginBottom: 24
                        }}
                    >
                        Chọn địa chỉ thủ công
                    </button>

                    {/* DEV: Mock Data Button */}
                    <div style={{
                        marginTop: 20,
                        paddingTop: 20,
                        borderTop: '1px dashed #e5e7eb'
                    }}>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                            🛠️ Dev Mode
                        </p>
                        <button
                            onClick={handleSeedMockData}
                            style={{
                                background: '#7c3aed',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: 8,
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                width: '100%'
                            }}
                        >
                            <Database size={18} />
                            Tạo Mock Hub Chư Pah
                        </button>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    const isHarvestMode = seasonMode === 'HARVEST';

    return (
        <div className="page-container" style={{ paddingTop: isHarvestMode ? 50 : 40 }}>
            {/* Header */}
            <div style={{ padding: '16px 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ color: '#666', fontSize: 14 }}>Trạm của tôi</p>
                        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{currentHub.name}</h1>
                    </div>

                    {isManualLocation && (
                        <div style={{
                            background: '#fef3c7',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            color: '#92400e'
                        }}>
                            📍 Thủ công
                        </div>
                    )}
                </div>

                {/* Hub Leader Info */}
                {currentHub.leaderName && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 12,
                        padding: 12,
                        background: '#f0fdf4',
                        borderRadius: 8
                    }}>
                        <Users size={18} color="#16a34a" />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600 }}>{currentHub.leaderName}</p>
                            <p style={{ fontSize: 13, color: '#666' }}>Trưởng trạm</p>
                        </div>
                        {currentHub.leaderPhone && (
                            <a href={`tel:${currentHub.leaderPhone}`} style={{ color: '#16a34a' }}>
                                <Phone size={20} />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                        onClick={() => navigate('/market')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 16,
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            cursor: 'pointer'
                        }}
                    >
                        <ShoppingBag size={28} color="#16a34a" />
                        <span style={{ marginTop: 8, fontWeight: 600 }}>Mua phân bón</span>
                        <span style={{ fontSize: 12, color: '#666' }}>Giá sỉ, gom đơn</span>
                    </button>

                    <button
                        onClick={() => navigate('/workers')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 16,
                            background: isHarvestMode ? '#fef2f2' : 'white',
                            border: isHarvestMode ? '2px solid #dc2626' : '1px solid #e5e7eb',
                            borderRadius: 12,
                            cursor: 'pointer'
                        }}
                    >
                        <Wrench size={28} color={isHarvestMode ? '#dc2626' : '#16a34a'} />
                        <span style={{ marginTop: 8, fontWeight: 600, color: isHarvestMode ? '#dc2626' : 'inherit' }}>
                            {isHarvestMode ? 'Đăng ký thợ' : 'Tìm thợ'}
                        </span>
                        <span style={{ fontSize: 12, color: '#666' }}>
                            {isHarvestMode ? 'Mùa thu hoạch' : 'Thợ ruột & lẻ'}
                        </span>
                    </button>
                </div>

                {/* Invite Button */}
                <button
                    onClick={() => setShowInviteModal(true)}
                    style={{
                        width: '100%',
                        marginTop: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: 14,
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 15
                    }}
                >
                    <UserPlus size={20} />
                    Mời Hàng Xóm Vào Trạm
                </button>
            </div>

            {/* Active Campaigns */}
            <div style={{ padding: '0 20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>🔥 Deal đang chạy</h2>
                    <button
                        onClick={() => navigate('/market')}
                        style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        Xem tất cả <ChevronRight size={16} />
                    </button>
                </div>

                {loadingCampaigns ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <RefreshCw className="animate-spin" size={24} color="#16a34a" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 30,
                        background: '#f9fafb',
                        borderRadius: 12
                    }}>
                        <ShoppingBag size={32} color="#9ca3af" />
                        <p style={{ marginTop: 8, color: '#666' }}>Chưa có deal nào đang chạy</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {campaigns.slice(0, 3).map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                )}
            </div>

            {/* Hub Stats */}
            {currentHub.memberCount !== undefined && (
                <div style={{ padding: '0 20px 100px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 8,
                        padding: 16,
                        background: '#f9fafb',
                        borderRadius: 12
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                                {currentHub.memberCount}
                            </p>
                            <p style={{ fontSize: 12, color: '#666' }}>Nông dân</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                                {currentHub.workerCount || 0}
                            </p>
                            <p style={{ fontSize: 12, color: '#666' }}>Thợ</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                                {currentHub.activeCampaigns || 0}
                            </p>
                            <p style={{ fontSize: 12, color: '#666' }}>Deal</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <HubInviteModal onClose={() => setShowInviteModal(false)} />
            )}

            <BottomNav />
        </div>
    );
};

export default HubDashboard;
