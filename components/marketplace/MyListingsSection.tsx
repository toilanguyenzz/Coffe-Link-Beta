/**
 * MyListingsSection.tsx
 * "Góc Của Tôi" - Seller's personal section with stats and listings
 * Features gamification elements showing earnings and sold items
 */

import React, { useState, useEffect } from 'react';
import {
    Package,
    TrendingUp,
    RefreshCw,
    Trash2,
    CheckCircle,
    Clock,
    ChevronRight,
    Award
} from 'lucide-react';
import { ProductListing, formatWeight, getCategoryLabel } from '../../types/MarketplaceTypes';

interface MyListingsSectionProps {
    listings: ProductListing[];
    stats: {
        totalListings: number;
        soldListings: number;
        activeListings: number;
    };
    onRenew: (listingId: string) => void;
    onMarkSold: (listingId: string) => void;
    onDelete: (listingId: string) => void;
    onViewAll: () => void;
}

const MyListingsSection: React.FC<MyListingsSectionProps> = ({
    listings,
    stats,
    onRenew,
    onMarkSold,
    onDelete,
    onViewAll,
}) => {
    const [expandedListing, setExpandedListing] = useState<string | null>(null);

    // Calculate estimated earnings (mock calculation)
    const estimatedEarnings = stats.soldListings * 500000; // Assume 500k avg per sale

    // Get time remaining for listing
    const getTimeRemaining = (expiresAt: any): string => {
        if (!expiresAt) return '';
        const now = new Date();
        const expires = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
        const diffMs = expires.getTime() - now.getTime();

        if (diffMs <= 0) return 'Đã hết hạn';

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        if (hours > 24) {
            return `Còn ${Math.floor(hours / 24)} ngày`;
        }
        return `Còn ${hours} giờ`;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-400 bg-green-500/20';
            case 'SOLD': return 'text-amber-400 bg-amber-500/20';
            case 'EXPIRED': return 'text-red-400 bg-red-500/20';
            case 'PENDING': return 'text-blue-400 bg-blue-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'Đang rao';
            case 'SOLD': return 'Đã bán';
            case 'EXPIRED': return 'Hết hạn';
            case 'PENDING': return 'Chờ duyệt';
            default: return status;
        }
    };

    return (
        <div className="mt-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    <h2 className="text-white font-bold text-lg">Góc Của Tôi</h2>
                </div>
                {listings.length > 0 && (
                    <button
                        onClick={onViewAll}
                        className="flex items-center gap-1 text-emerald-400 text-sm font-medium"
                    >
                        Xem tất cả
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {/* Sold Count */}
                <div
                    className="p-4 rounded-xl text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{stats.soldListings}</p>
                    <p className="text-white/60 text-xs">Đơn đã bán</p>
                </div>

                {/* Active Listings */}
                <div
                    className="p-4 rounded-xl text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.activeListings}</p>
                    <p className="text-white/60 text-xs">Đang rao</p>
                </div>

                {/* Estimated Earnings */}
                <div
                    className="p-4 rounded-xl text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                >
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-lg font-bold text-emerald-400">
                        {estimatedEarnings >= 1000000
                            ? `${(estimatedEarnings / 1000000).toFixed(1)}tr`
                            : `${(estimatedEarnings / 1000).toFixed(0)}k`
                        }
                    </p>
                    <p className="text-white/60 text-xs">Kiếm được</p>
                </div>
            </div>

            {/* My Listings */}
            {listings.length === 0 ? (
                <div
                    className="p-6 rounded-xl text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">Bạn chưa có tin đăng nào</p>
                    <p className="text-white/30 text-xs mt-1">Bấm "Đăng bán" để bắt đầu rao hàng!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {listings.slice(0, 3).map((listing) => (
                        <div
                            key={listing.id}
                            className="rounded-xl overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div
                                className="p-3 flex items-center gap-3"
                                onClick={() => setExpandedListing(
                                    expandedListing === listing.id ? null : listing.id
                                )}
                            >
                                {/* Thumbnail */}
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                                    {listing.images?.[0] ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            📦
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium text-sm truncate">
                                        {listing.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                                            {getStatusLabel(listing.status)}
                                        </span>
                                        {listing.status === 'APPROVED' && (
                                            <span className="text-white/40 text-xs">
                                                {getTimeRemaining(listing.expiresAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Contact count */}
                                <div className="text-right">
                                    <p className="text-white/80 text-sm font-medium">{listing.contactCount || 0}</p>
                                    <p className="text-white/40 text-xs">liên hệ</p>
                                </div>
                            </div>

                            {/* Expanded Actions */}
                            {expandedListing === listing.id && (
                                <div className="px-3 pb-3 flex gap-2">
                                    {listing.status === 'APPROVED' && (
                                        <button
                                            onClick={() => onMarkSold(listing.id)}
                                            className="flex-1 py-2 px-3 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Đã bán
                                        </button>
                                    )}
                                    {(listing.status === 'EXPIRED' || listing.status === 'APPROVED') && (
                                        <button
                                            onClick={() => onRenew(listing.id)}
                                            className="flex-1 py-2 px-3 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium flex items-center justify-center gap-1"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Gia hạn
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(listing.id)}
                                        className="py-2 px-3 rounded-lg bg-red-500/20 text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListingsSection;
