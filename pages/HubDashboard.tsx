/**
 * HubDashboard.tsx - Trạm của tôi
 * EXACT MATCH to reference design with blurred farm background
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/DemoAuthContext';
import { useHub } from '../contexts/DemoHubContext';
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
    Wrench,
    Phone,
    ChevronRight,
    RefreshCw,
    Database,
    UserPlus,
    Gift,
    Star,
    Coffee,
    ShoppingBag
} from 'lucide-react';

// Background images - Matching reference design exactly
const IMAGES = {
    farmBg: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80',
    // Fertilizer bags on green field
    fertilizer: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop&q=80',
    // Garden tools collection
    tools: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&auto=format&fit=crop&q=80',
    // Deal images
    deal1: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&auto=format&fit=crop&q=80',
    deal2: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&auto=format&fit=crop&q=80',
    deal3: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&auto=format&fit=crop&q=80',
    // Farmer avatar
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&auto=format&fit=crop&q=80'
};

// Mock deals data
const MOCK_DEALS = [
    { id: 1, title: 'Giảm 20%', subtitle: 'Phân bón', image: IMAGES.deal1, bgColor: '#4A7C59' },
    { id: 2, title: 'Ưu đãi', subtitle: 'Máy gặt', image: IMAGES.deal2, bgColor: '#D4A574' },
    { id: 3, title: 'Ưu đãi 2', subtitle: 'Máy gặt', image: IMAGES.deal3, bgColor: '#8B9B6B' }
];

const HubDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const { currentHub, seasonMode, loading, error, locationPermission, isManualLocation, requestLocationAndRoute } = useHub();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [showHubSelector, setShowHubSelector] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        if (!loading && !currentHub && userProfile) {
            if (locationPermission === 'denied') {
                setShowHubSelector(true);
            }
        }
    }, [loading, currentHub, userProfile, locationPermission]);

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

    useEffect(() => {
        if (!loading && !currentHub && userProfile && locationPermission !== 'denied') {
            requestLocationAndRoute();
        }
    }, [loading, currentHub, userProfile, locationPermission, requestLocationAndRoute]);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-100 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-green-800 font-bold text-lg">Đang tải...</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    // Hub Selector
    if (!currentHub && showHubSelector) {
        return (
            <div className="page-container">
                <HubSelector onComplete={() => setShowHubSelector(false)} />
                <BottomNav />
            </div>
        );
    }

    // Waiting for GPS
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
            <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-400 pb-24">
                <div className="px-6 py-12 text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-white/20 backdrop-blur-md">
                        <MapPin className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Đang tìm Trạm gần bạn...</h2>
                    <p className="text-white/80">Cho phép ứng dụng truy cập vị trí</p>

                    {error && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/90">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={() => requestLocationAndRoute()}
                        className="w-full mt-6 py-4 rounded-full font-bold text-lg bg-white text-green-600 shadow-xl active:scale-95 transition-transform"
                    >
                        📍 Cho phép truy cập vị trí
                    </button>

                    <button
                        onClick={() => setShowHubSelector(true)}
                        className="w-full mt-3 py-4 rounded-full font-bold border-2 border-white/50 text-white"
                    >
                        Chọn địa chỉ thủ công
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/20">
                        <button
                            onClick={handleSeedMockData}
                            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-full font-medium bg-white/20 text-white"
                        >
                            <Database className="w-5 h-5" />
                            🛠️ Demo: Tạo Mock Hub
                        </button>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    const isHarvestMode = seasonMode === 'HARVEST';

    return (
        <div className="min-h-screen relative overflow-hidden pb-24">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* BLURRED FARM BACKGROUND - Matching Reference */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="fixed inset-0 z-0">
                <img
                    src={IMAGES.farmBg}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: 'blur(8px)', transform: 'scale(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/80" />
            </div>

            {/* Max Width Container */}
            <div className="relative z-10 max-w-md mx-auto">

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* HEADER - Trạm của tôi */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="px-5 pt-12 pb-4">
                    <p className="text-gray-600 text-sm font-medium flex items-center gap-1">
                        <span className="text-lg">🏠</span> Trạm của tôi
                    </p>
                    <h1 className="text-2xl font-black text-gray-900 mt-1">
                        {currentHub.name}
                    </h1>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* LEADER CARD - Matching Reference Exactly */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {currentHub.leaderName && (
                    <div className="mx-5 mb-5">
                        <div className="bg-[#5D6B5E]/80 backdrop-blur-md rounded-[28px] p-4 flex items-center gap-4 shadow-lg">
                            {/* Avatar with farmer image */}
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shadow-md flex-shrink-0">
                                <img
                                    src={IMAGES.avatar}
                                    alt="Leader"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate">
                                    {currentHub.leaderName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-white/80 text-sm">Trưởng trạm</span>
                                </div>
                            </div>

                            {/* Phone Button */}
                            {currentHub.leaderPhone && (
                                <a
                                    href={`tel:${currentHub.leaderPhone}`}
                                    className="w-12 h-12 rounded-full bg-[#8B9B8C] flex items-center justify-center shadow-md active:scale-90 transition-transform flex-shrink-0"
                                >
                                    <Phone className="w-5 h-5 text-white" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* FEATURE CARDS - Two Cards with Real Images */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="px-5 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Mua phân bón Card */}
                        <button
                            onClick={() => navigate('/market')}
                            className="relative overflow-hidden rounded-[24px] aspect-square shadow-lg active:scale-95 transition-transform"
                        >
                            <img
                                src={IMAGES.fertilizer}
                                alt="Mua phân bón"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Icon Badge */}
                            <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-md">
                                <ShoppingBag className="w-5 h-5 text-green-700" />
                            </div>

                            {/* Text */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white font-bold text-lg">Mua phân bón</p>
                                <p className="text-white/80 text-sm">Giá sỉ, gom đơn</p>
                            </div>
                        </button>

                        {/* Tìm thợ Card */}
                        <button
                            onClick={() => navigate('/workers')}
                            className={`relative overflow-hidden rounded-[24px] aspect-square shadow-lg active:scale-95 transition-transform ${isHarvestMode ? 'ring-4 ring-red-500 animate-pulse' : ''}`}
                        >
                            <img
                                src={IMAGES.tools}
                                alt="Tìm thợ"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Icon Badge */}
                            <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-md">
                                <Wrench className="w-5 h-5 text-amber-700" />
                            </div>

                            {/* Text */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white font-bold text-lg">
                                    {isHarvestMode ? 'Đăng ký thợ' : 'Tìm thợ'}
                                </p>
                                <p className="text-white/80 text-sm">
                                    {isHarvestMode ? '🔴 Mùa thu hoạch' : 'Thợ ruột & lẻ'}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* INVITE BUTTON - Golden Gradient */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="px-5 mb-5">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #C9A227 0%, #DAA520 50%, #B8960F 100%)',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(201, 162, 39, 0.35)'
                        }}
                    >
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <span>Mời Hàng Xóm Vào Trạm</span>
                        <Gift className="w-5 h-5" />
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* DEALS SECTION - Horizontal Scroll */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="mb-5">
                    <div className="flex items-center justify-between px-5 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🏷️</span>
                            <h2 className="text-lg font-bold text-gray-900">Deal đang chạy</h2>
                        </div>
                        <button
                            onClick={() => navigate('/market')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium active:scale-95 transition-transform"
                        >
                            Xem tất cả <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {loadingCampaigns ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-3 px-5 pb-2" style={{ width: 'max-content' }}>
                                {/* Show campaigns or mock deals */}
                                {(campaigns.length > 0 ? campaigns.slice(0, 5) : MOCK_DEALS).map((item: any, index: number) => (
                                    <button
                                        key={item.id || index}
                                        onClick={() => navigate('/market')}
                                        className="relative overflow-hidden rounded-2xl shadow-lg active:scale-95 transition-transform flex-shrink-0"
                                        style={{ width: '140px', height: '160px' }}
                                    >
                                        <img
                                            src={item.image || MOCK_DEALS[index % 3].image}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(to top, ${item.bgColor || MOCK_DEALS[index % 3].bgColor}ee 0%, transparent 60%)`
                                            }}
                                        />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-white font-bold text-base">
                                                {item.title || item.name}
                                            </p>
                                            <p className="text-white/80 text-sm">
                                                {item.subtitle || item.description?.slice(0, 15)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* STATS SECTION - Matching Reference Exactly */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="px-5 mb-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-[24px] p-5 shadow-lg">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Nông dân */}
                            <div className="text-center">
                                <div className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-md bg-gradient-to-br from-[#8B9B8C] to-[#6B7B6C]">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-3xl font-black text-[#5D6B5E]">
                                    {currentHub.memberCount || 52}
                                </p>
                                <p className="text-xs font-medium text-gray-500">Nông dân</p>
                            </div>

                            {/* Thợ */}
                            <div className="text-center">
                                <div className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-md bg-gradient-to-br from-[#C9A227] to-[#A68B1F]">
                                    <Wrench className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-3xl font-black text-[#C9A227]">
                                    {currentHub.workerCount || 14}
                                </p>
                                <p className="text-xs font-medium text-gray-500">Thợ</p>
                            </div>

                            {/* Deal */}
                            <div className="text-center">
                                <div className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-md bg-gradient-to-br from-[#D4A574] to-[#B8895C]">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-3xl font-black text-[#D4A574]">
                                    {currentHub.activeCampaigns || campaigns.length || 3}
                                </p>
                                <p className="text-xs font-medium text-gray-500">Deal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-4" />
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <HubInviteModal onClose={() => setShowInviteModal(false)} />
            )}

            <BottomNav />
        </div>
    );
};

export default HubDashboard;
