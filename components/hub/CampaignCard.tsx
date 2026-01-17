/**
 * CampaignCard.tsx
 * Card hiển thị Campaign gom đơn phân bón
 * Tầng 2: Commerce
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../../types';
import { onCampaignProgress, generateShareLink, generateShareText } from '../../services/CampaignService';
import { Timer, Users, Share2, ShoppingCart, ExternalLink } from 'lucide-react';

interface CampaignCardProps {
    campaign: Campaign;
    showActions?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign: initialCampaign, showActions = true }) => {
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(initialCampaign);

    // Realtime listener for progress updates
    useEffect(() => {
        const unsubscribe = onCampaignProgress(initialCampaign.id, (updated) => {
            setCampaign(updated);
        });
        return () => unsubscribe();
    }, [initialCampaign.id]);

    const progress = Math.min((campaign.currentQuantity / campaign.targetQuantity) * 100, 100);
    const remaining = campaign.targetQuantity - campaign.currentQuantity;
    const savings = campaign.originalPrice - campaign.dealPrice;
    const savingsPercent = Math.round((savings / campaign.originalPrice) * 100);

    // Calculate time remaining
    const endDate = new Date(campaign.endDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const handleShare = () => {
        const text = generateShareText(campaign);
        const url = generateShareLink(campaign);

        // Try native share first (mobile)
        if (navigator.share) {
            navigator.share({ title: campaign.title, text, url });
        } else {
            // Fallback to copy
            navigator.clipboard.writeText(`${text}\n${url}`);
            alert('Đã copy link. Dán vào Zalo/Facebook để chia sẻ!');
        }
    };

    const isFulfilled = campaign.status === 'FULFILLED';
    const isClosed = campaign.status === 'CLOSED' || campaign.status === 'CANCELLED';

    return (
        <div
            style={{
                background: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                opacity: isClosed ? 0.6 : 1
            }}
        >
            {/* Header with product image or gradient */}
            <div style={{
                height: 80,
                background: campaign.productImage
                    ? `url(${campaign.productImage}) center/cover`
                    : 'linear-gradient(135deg, #16a34a, #22c55e)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: 12
            }}>
                {isFulfilled && (
                    <span style={{
                        background: '#16a34a',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600
                    }}>
                        ✅ Đủ đơn!
                    </span>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{campaign.title}</h3>

                {/* Pricing */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>
                        {campaign.dealPrice.toLocaleString()}đ
                    </span>
                    <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>
                        {campaign.originalPrice.toLocaleString()}đ
                    </span>
                    <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                    }}>
                        -{savingsPercent}%
                    </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{
                        height: 8,
                        background: '#e5e7eb',
                        borderRadius: 4,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: isFulfilled ? '#16a34a' : 'linear-gradient(90deg, #f59e0b, #eab308)',
                            transition: 'width 0.5s ease-out'
                        }} />
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 6,
                        fontSize: 12,
                        color: '#666'
                    }}>
                        <span>Đã đặt: {campaign.currentQuantity}/{campaign.targetQuantity} {campaign.unit}</span>
                        {!isFulfilled && <span style={{ color: '#f59e0b', fontWeight: 500 }}>Còn thiếu {remaining}</span>}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Timer size={14} />
                        {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Hết hạn'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} />
                        {Math.ceil(campaign.currentQuantity / (campaign.minOrderQuantity || 5))} người tham gia
                    </span>
                </div>

                {/* Actions */}
                {showActions && !isClosed && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleShare}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '10px',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            <Share2 size={16} />
                            Rủ hàng xóm
                        </button>

                        <button
                            onClick={() => navigate(`/market?campaign=${campaign.id}`)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '10px',
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <ShoppingCart size={16} />
                            Đặt cọc ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignCard;
