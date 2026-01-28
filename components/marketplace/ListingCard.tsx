/**
 * ListingCard.tsx
 * Card component for displaying a product listing
 * Features watermarked image, product info, distance, and call button
 */

import React from 'react';
import { MapPin, Phone, Clock, Eye } from 'lucide-react';
import { ProductListing, getCategoryLabel, formatWeight, formatPrice } from '../../types/MarketplaceTypes';

interface ListingCardProps {
    listing: ProductListing;
    onCall: (listing: ProductListing) => void;
    onView?: (listing: ProductListing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
    listing,
    onCall,
    onView,
}) => {
    // Calculate time ago
    const getTimeAgo = (timestamp: any): string => {
        if (!timestamp) return '';
        const now = new Date();
        const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} ngày trước`;
        if (diffHours > 0) return `${diffHours} giờ trước`;
        if (diffMins > 0) return `${diffMins} phút trước`;
        return 'Vừa đăng';
    };

    const handleCall = () => {
        onCall(listing);
        // Actually initiate call
        if (listing.farmerPhone) {
            window.location.href = `tel:${listing.farmerPhone}`;
        }
    };

    return (
        <div
            className="relative rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(20, 60, 40, 0.95) 0%, rgba(10, 35, 25, 0.98) 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
            onClick={() => onView?.(listing)}
        >
            {/* Subtle border glow */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
            />

            <div className="p-4">
                <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-800">
                        {listing.images && listing.images.length > 0 ? (
                            <img
                                src={listing.images[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-700 to-gray-900">
                                📦
                            </div>
                        )}

                        {/* Image count badge */}
                        {listing.images && listing.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs font-medium">
                                +{listing.images.length - 1}
                            </div>
                        )}

                        {/* Category badge */}
                        <div
                            className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium text-white backdrop-blur-sm"
                            style={{ background: 'rgba(0,0,0,0.6)' }}
                        >
                            {getCategoryLabel(listing.category)}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                        {/* Title */}
                        <h3 className="text-white font-semibold text-base leading-tight line-clamp-2">
                            {listing.title}
                        </h3>

                        {/* Location & Time */}
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-emerald-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">
                                    {listing.location.distanceKm !== undefined
                                        ? `Cách ${listing.location.distanceKm}km`
                                        : listing.location.address || 'Gia Lai'
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-white/50">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">{getTimeAgo(listing.createdAt)}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mt-2">
                            <span
                                className="text-xl font-bold"
                                style={{
                                    background: listing.negotiable
                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                        : 'linear-gradient(90deg, #f97316, #fb923c)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {formatPrice(listing.pricePerUnit, listing.negotiable)}
                            </span>
                        </div>

                        {/* View count */}
                        {listing.viewCount > 0 && (
                            <div className="flex items-center gap-1 text-white/40 mt-1">
                                <Eye className="w-3 h-3" />
                                <span className="text-xs">{listing.viewCount} lượt xem</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCall();
                    }}
                    className="w-full mt-4 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                >
                    <Phone className="w-5 h-5 text-white" />
                    <span className="text-white">GỌI NGAY</span>
                </button>
            </div>

            {/* Status badge for sold items */}
            {listing.status === 'SOLD' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                    <div className="px-6 py-3 rounded-full bg-red-500/90 text-white font-bold text-lg transform -rotate-12">
                        ĐÃ BÁN
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingCard;
