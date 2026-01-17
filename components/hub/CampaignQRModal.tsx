/**
 * CampaignQRModal.tsx
 * Modal hiển thị QR Code Campaign để Trưởng Hub share
 * Phase 6: Hub Leader Marketing
 */

import React, { useEffect, useState, useRef } from 'react';
import { Campaign } from '../../types';
import {
    generateCampaignQR,
    generateWebFallbackUrl,
    generateShareText,
    downloadQRImage
} from '../../services/QRService';
import { useAuth } from '../../contexts/AuthContext';
import { X, Download, Share2, Copy, CheckCircle } from 'lucide-react';

interface CampaignQRModalProps {
    campaign: Campaign;
    onClose: () => void;
}

const CampaignQRModal: React.FC<CampaignQRModalProps> = ({ campaign, onClose }) => {
    const { userProfile } = useAuth();
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    const referralCode = userProfile?.referralCode || '';
    const hubId = userProfile?.hubId || '';

    // Generate QR on mount
    useEffect(() => {
        const loadQR = async () => {
            setLoading(true);
            try {
                const dataUrl = await generateCampaignQR(
                    campaign.id,
                    hubId,
                    referralCode,
                    { width: 280, color: { dark: '#16a34a' } }
                );
                setQrDataUrl(dataUrl);
            } catch (err) {
                console.error('Error generating QR:', err);
            }
            setLoading(false);
        };
        loadQR();
    }, [campaign.id, hubId, referralCode]);

    const webUrl = generateWebFallbackUrl(campaign.deepLinkCode, referralCode);
    const savings = campaign.originalPrice - campaign.dealPrice;
    const shareText = generateShareText(campaign.title, savings, webUrl);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(webUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: campaign.title,
                    text: shareText,
                    url: webUrl
                });
            } catch (err) {
                // User cancelled or error
                handleCopyLink();
            }
        } else {
            handleCopyLink();
        }
    };

    const handleDownload = async () => {
        await downloadQRImage(
            campaign.id,
            hubId,
            referralCode,
            `qr-${campaign.deepLinkCode}.png`
        );
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 20
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: 'white',
                borderRadius: 16,
                maxWidth: 360,
                width: '100%',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <h2 style={{ fontWeight: 600, fontSize: 18 }}>Chia sẻ Campaign</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 20, textAlign: 'center' }}>
                    {/* Campaign Info */}
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{campaign.title}</p>
                    <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                        Tiết kiệm <span style={{ color: '#dc2626', fontWeight: 600 }}>
                            {savings.toLocaleString()}đ/{campaign.unit}
                        </span>
                    </p>

                    {/* QR Code */}
                    <div style={{
                        background: '#f9fafb',
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 16
                    }}>
                        {loading ? (
                            <div style={{ width: 200, height: 200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p>Đang tạo QR...</p>
                            </div>
                        ) : (
                            <img
                                src={qrDataUrl}
                                alt="Campaign QR Code"
                                style={{ width: 200, height: 200, margin: '0 auto', display: 'block' }}
                            />
                        )}
                        <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                            Quét để tham gia ngay
                        </p>
                    </div>

                    {/* Short Link */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#f3f4f6',
                        borderRadius: 8,
                        padding: '10px 12px',
                        marginBottom: 16
                    }}>
                        <span style={{
                            flex: 1,
                            fontSize: 13,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {webUrl}
                        </span>
                        <button
                            onClick={handleCopyLink}
                            style={{
                                background: copied ? '#16a34a' : '#e5e7eb',
                                color: copied ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }}
                        >
                            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                            {copied ? 'Đã copy' : 'Copy'}
                        </button>
                    </div>

                    {/* Referral Code Badge */}
                    {referralCode && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px dashed #16a34a',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 16
                        }}>
                            <p style={{ fontSize: 12, color: '#666' }}>Mã giới thiệu của bạn</p>
                            <p style={{ fontWeight: 700, color: '#16a34a', fontSize: 18 }}>{referralCode}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    padding: '0 20px 20px'
                }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: 12,
                            background: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={18} />
                        Tải ảnh
                    </button>

                    <button
                        onClick={handleShare}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: 12,
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <Share2 size={18} />
                        Chia sẻ
                    </button>
                </div>

                {/* Share hint */}
                <div style={{
                    background: '#fef3c7',
                    padding: 12,
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#92400e'
                }}>
                    💡 Tip: Dán ảnh QR vào nhóm Zalo thôn hoặc in dán ở quán cà phê!
                </div>
            </div>
        </div>
    );
};

export default CampaignQRModal;
