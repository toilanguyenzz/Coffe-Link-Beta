/**
 * Marketplace.tsx - Chợ Nhà Nông
 * Complete marketplace with TWO modes:
 * 1. "Vật tư" - Group buying campaigns (gom đơn) - OLD FEATURE
 * 2. "Phụ phẩm" - By-products selling/buying - NEW FEATURE
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, RefreshCw, ShoppingBag, Recycle, Leaf } from 'lucide-react';

// import MarketplaceHeader from '../components/marketplace/MarketplaceHeader'; // Removed
import FlashSaleSlider from '../components/marketplace/FlashSaleSlider';
import CompactSellBanner from '../components/marketplace/CompactSellBanner';
import OneClickListing from '../components/marketplace/OneClickListing';
import ListingCard from '../components/marketplace/ListingCard';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import MyListingsSection from '../components/marketplace/MyListingsSection';
import CampaignCard from '../components/hub/CampaignCard';
import CampaignJoinModal from '../components/hub/CampaignJoinModal';
import { useAuth } from '../contexts/DemoAuthContext';
import { useMarketplace } from '../hooks/useDemoMarketplace';
import { Campaign, Deal } from '../types';
import {
    ProductListing,
    ProductCategory,
    ListingFormData,
} from '../types/MarketplaceTypes';
import {
    createListing,
    getListingsNearby,
    getMyListings,
    markAsSold,
    renewListing,
    deleteListing,
    incrementContactCount,
    getSellerStats,
} from '../services/MarketplaceListingService';

// Demo listings for by-products
const DEMO_LISTINGS: ProductListing[] = [
    {
        id: 'demo_1',
        farmerId: 'demo_farmer_1',
        farmerName: 'Bác Hùng',
        farmerPhone: '0359123456',
        category: 'COFFEE_HUSK',
        title: 'Vỏ cà phê khô (2 tấn)',
        estimatedWeight: 2,
        weightUnit: 'tan',
        negotiable: true,
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'],
        originalImages: [],
        location: { lat: 13.9833, lng: 108.0, address: 'Chư Sê, Gia Lai', distanceKm: 2.1 },
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 47 * 3600000),
        viewCount: 15,
        contactCount: 3,
    },
    {
        id: 'demo_2',
        farmerId: 'demo_farmer_2',
        farmerName: 'Chị Lan',
        farmerPhone: '0987654321',
        category: 'FERTILIZER',
        title: 'Phân bò ủ hoai (500kg)',
        estimatedWeight: 500,
        weightUnit: 'kg',
        pricePerUnit: 800000,
        negotiable: false,
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
        originalImages: [],
        location: { lat: 13.95, lng: 108.05, address: 'Ia Sao, Ia Grai', distanceKm: 5.3 },
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 7200000),
        expiresAt: new Date(Date.now() + 46 * 3600000),
        viewCount: 8,
        contactCount: 1,
    },
    {
        id: 'demo_3',
        farmerId: 'demo_farmer_3',
        farmerName: 'Anh Minh',
        farmerPhone: '0912345678',
        category: 'WOOD',
        title: 'Cành cà phê tỉa (1.5 tấn)',
        estimatedWeight: 1.5,
        weightUnit: 'tan',
        pricePerUnit: 300000,
        negotiable: true,
        images: ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400'],
        originalImages: [],
        location: { lat: 14.0, lng: 108.1, address: 'Chư Păh', distanceKm: 8.7 },
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 18000000),
        expiresAt: new Date(Date.now() + 43 * 3600000),
        viewCount: 22,
        contactCount: 5,
    },
];

// Tab type
type MarketTab = 'supplies' | 'byproducts';

// Product images for deals
const PRODUCT_IMAGES: Record<string, string> = {
    'deal_1': 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lmr5c7l6qpzg68',
    'deal_2': 'https://bizweb.dktcdn.net/100/006/093/products/neem-oil-1l.jpg?v=1586929488827',
    'deal_3': 'https://cf.shopee.vn/file/d4a65204c5b25de097e5feb10c64e57d',
    'deal_4': 'https://may-cat-co.vn/wp-content/uploads/2020/05/may-cat-co-honda-umk435.jpg',
};

const Marketplace: React.FC = () => {
    const { currentUser, userProfile } = useAuth();
    const { deals, loading: dealsLoading, reserveSlot } = useMarketplace();

    // Tab state - NEW: Toggle between supplies (gom đơn) and by-products
    const [activeTab, setActiveTab] = useState<MarketTab>('supplies');

    // Modal states
    const [showListingModal, setShowListingModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

    // By-products data
    const [listings, setListings] = useState<ProductListing[]>(DEMO_LISTINGS);
    const [myListings, setMyListings] = useState<ProductListing[]>([]);
    const [sellerStats, setSellerStats] = useState({
        totalListings: 0,
        soldListings: 0,
        activeListings: 0,
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [processingDealId, setProcessingDealId] = useState<string | null>(null);

    // User location
    const [userLocation, setUserLocation] = useState({ lat: 13.9833, lng: 108.0 });

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => console.log('Using default location')
            );
        }
    }, []);

    // Load by-products data
    useEffect(() => {
        if (activeTab === 'byproducts') {
            loadListings();
            if (currentUser) {
                loadMyListings();
                loadSellerStats();
            }
        }
    }, [currentUser, userLocation, activeTab]);

    const loadListings = async () => {
        setLoading(true);
        try {
            const fetchedListings = await getListingsNearby(
                userLocation.lat, userLocation.lng, 50, selectedCategory || undefined
            );
            setListings(fetchedListings.length > 0 ? fetchedListings : DEMO_LISTINGS);
        } catch (error) {
            setListings(DEMO_LISTINGS);
        } finally {
            setLoading(false);
        }
    };

    const loadMyListings = async () => {
        if (!currentUser) return;
        try {
            const myData = await getMyListings(currentUser.uid);
            setMyListings(myData);
        } catch (error) {
            console.error('Error loading my listings:', error);
        }
    };

    const loadSellerStats = async () => {
        if (!currentUser) return;
        try {
            const stats = await getSellerStats(currentUser.uid);
            setSellerStats(stats);
        } catch (error) {
            console.error('Error loading seller stats:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'byproducts') {
            await Promise.all([loadListings(), loadMyListings(), loadSellerStats()]);
        }
        setRefreshing(false);
    };

    // Handle new listing submission
    const handleSubmitListing = async (formData: ListingFormData, location: { lat: number; lng: number }) => {
        if (!currentUser) throw new Error('Vui lòng đăng nhập để đăng tin');
        await createListing(
            currentUser.uid,
            userProfile?.displayName || 'Nông dân',
            '',
            formData,
            location
        );
        await handleRefresh();
    };

    // Handle reserve deal (old campaign feature)
    const handleReserveDeal = async (dealId: string) => {
        setProcessingDealId(dealId);
        try {
            await reserveSlot(dealId);
            alert("🎉 Chúc mừng! Bác đã giữ suất thành công.");
        } catch (error: any) {
            alert(error.message || "Có lỗi xảy ra.");
        } finally {
            setProcessingDealId(null);
        }
    };

    // By-products actions
    const handleCallListing = async (listing: ProductListing) => {
        await incrementContactCount(listing.id);
    };

    const handleMarkSold = async (listingId: string) => {
        await markAsSold(listingId);
        await loadMyListings();
        await loadSellerStats();
    };

    const handleRenewListing = async (listingId: string) => {
        await renewListing(listingId);
        await loadMyListings();
    };

    const handleDeleteListing = async (listingId: string) => {
        if (confirm('Bạn có chắc muốn xóa tin đăng này?')) {
            await deleteListing(listingId);
            await loadMyListings();
            await loadSellerStats();
        }
    };

    // Filter by-products
    const filteredListings = listings.filter((listing) => {
        if (selectedCategory && listing.category !== selectedCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return listing.title.toLowerCase().includes(query) ||
                listing.location.address?.toLowerCase().includes(query);
        }
        return true;
    });

    // Filter deals
    const filteredDeals = deals.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const userName = userProfile?.displayName || 'Bác';

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* DARK GRADIENT BACKGROUND */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a2e1a] via-[#0d3a21] to-[#071a10]" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-md mx-auto min-h-screen relative z-10">
                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* HEADER */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* NEW HEADER ELEMENTS: FLASH SALE & BANNER */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="pt-6">
                    <FlashSaleSlider
                        deals={deals}
                        onItemClick={(deal) => handleReserveDeal(deal.id)}
                    />

                    <CompactSellBanner
                        onClick={() => setShowListingModal(true)}
                    />
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* TAB SWITCHER - VẬT TƯ vs PHỤ PHẨM */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="px-4 mt-4">
                    <div className="flex gap-2 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
                        <button
                            onClick={() => setActiveTab('supplies')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'supplies'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Gom đơn vật tư
                        </button>
                        <button
                            onClick={() => setActiveTab('byproducts')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'byproducts'
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <Recycle className="w-4 h-4" />
                            Chợ phụ phẩm
                        </button>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* SEARCH BAR */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="px-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl flex items-center gap-3 px-4 py-3 border border-white/10">
                        <Search className="w-5 h-5 text-white/50" strokeWidth={1.5} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeTab === 'supplies' ? "Tìm vật tư..." : "Tìm phụ phẩm gần bạn..."}
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-[15px]"
                        />
                        {refreshing ? (
                            <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                        ) : (
                            <button onClick={handleRefresh}>
                                <RefreshCw className="w-5 h-5 text-white/50 hover:text-white transition-colors" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* CATEGORY FILTER (BY-PRODUCTS ONLY) */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'byproducts' && (
                    <div className="px-4 mt-4">
                        <CategoryFilter
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* CONTENT AREA */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="px-4 mt-4 space-y-4">

                    {/* ════════════════════════════════════════════════════════════════ */}
                    {/* TAB: GOM ĐƠN VẬT TƯ (OLD FEATURE) */}
                    {/* ════════════════════════════════════════════════════════════════ */}
                    {activeTab === 'supplies' && (
                        <>
                            {dealsLoading ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="w-10 h-10 animate-spin text-green-400" />
                                </div>
                            ) : filteredDeals.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-white/50 text-lg">Không tìm thấy chiến dịch nào</p>
                                </div>
                            ) : (
                                filteredDeals.map((deal, index) => {
                                    const isSoldOut = deal.currentQuantity >= deal.maxQuantity;

                                    return (
                                        <div
                                            key={deal.id}
                                            className="relative overflow-hidden rounded-2xl"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(20, 60, 40, 0.95) 0%, rgba(10, 35, 25, 0.98) 100%)',
                                                boxShadow: '0 0 20px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            {/* Neon border glow */}
                                            <div className="absolute inset-0 rounded-2xl pointer-events-none"
                                                style={{ border: '1px solid rgba(34, 197, 94, 0.3)' }}
                                            />

                                            <div className="relative p-4">
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="relative w-24 h-24 flex-shrink-0">
                                                        <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
                                                            <img
                                                                src={PRODUCT_IMAGES[deal.id] || 'https://via.placeholder.com/150'}
                                                                alt={deal.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute -top-2 -left-2 w-6 h-6 text-green-400">
                                                            <Leaf className="w-full h-full" fill="currentColor" opacity={0.6} />
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                                        <h3 className="text-white font-semibold text-[15px] leading-tight mb-2 pr-4">
                                                            {deal.title}
                                                        </h3>

                                                        <div className="flex items-baseline gap-2 mb-3">
                                                            <span className="text-white text-2xl font-bold">
                                                                {(deal.price / 1000).toFixed(0)}k
                                                            </span>
                                                            {deal.originalPrice > deal.price && (
                                                                <span className="text-gray-500 text-sm line-through">
                                                                    {(deal.originalPrice / 1000).toFixed(0)}k
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar & Status */}
                                                        {deal.maxQuantity - deal.currentQuantity < 20 && (
                                                            <div className="mb-1 flex justify-end">
                                                                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">
                                                                    SẮP HẾT
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="relative h-6 bg-gray-700/50 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className="absolute inset-y-0 left-0 transition-all duration-500"
                                                                style={{
                                                                    width: `${Math.min((deal.currentQuantity / deal.maxQuantity) * 100, 100)}%`,
                                                                    background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)', // Red-Orange Gradient
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <span className="text-white text-xs font-bold drop-shadow-md">
                                                                    Đã gom: {deal.currentQuantity}/{deal.maxQuantity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Buy Button */}
                                                <button
                                                    onClick={() => handleReserveDeal(deal.id)}
                                                    disabled={isSoldOut || processingDealId === deal.id}
                                                    className={`w-full mt-4 h-12 rounded-xl font-bold text-base uppercase tracking-wide transition-all active:scale-[0.98] flex items-center justify-center ${isSoldOut ? 'bg-gray-600 text-gray-400' : 'text-white'
                                                        }`}
                                                    style={!isSoldOut ? {
                                                        background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
                                                        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                                                    } : {}}
                                                >
                                                    {processingDealId === deal.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : isSoldOut ? 'HẾT HÀNG' : 'GOM ĐƠN NGAY'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </>
                    )}

                    {/* ════════════════════════════════════════════════════════════════ */}
                    {/* TAB: CHỢ PHỤ PHẨM (NEW FEATURE) */}
                    {/* ════════════════════════════════════════════════════════════════ */}
                    {activeTab === 'byproducts' && (
                        <>
                            {loading ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="w-10 h-10 animate-spin text-green-400" />
                                </div>
                            ) : filteredListings.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-white/50 text-lg">Không tìm thấy phụ phẩm nào</p>
                                    <p className="text-white/30 text-sm mt-2">
                                        Thử thay đổi bộ lọc hoặc tìm kiếm khác
                                    </p>
                                </div>
                            ) : (
                                filteredListings.map((listing) => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onCall={handleCallListing}
                                    />
                                ))
                            )}

                            {/* My Listings Section */}
                            {currentUser && (
                                <MyListingsSection
                                    listings={myListings}
                                    stats={sellerStats}
                                    onRenew={handleRenewListing}
                                    onMarkSold={handleMarkSold}
                                    onDelete={handleDeleteListing}
                                    onViewAll={() => { }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* MODALS */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <OneClickListing
                isOpen={showListingModal}
                onClose={() => setShowListingModal(false)}
                onSubmit={handleSubmitListing}
            />

            {selectedCampaign && (
                <CampaignJoinModal
                    campaign={selectedCampaign}
                    onClose={() => setSelectedCampaign(null)}
                    onSuccess={() => setSelectedCampaign(null)}
                />
            )}
        </div>
    );
};

export default Marketplace;
