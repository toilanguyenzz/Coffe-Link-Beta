/**
 * HubInviteModal.tsx
 * Modal mời hàng xóm vào Trạm
 * Features: QR Code, Share Link, Incentive display
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHub } from '../../contexts/HubContext';
import { generateCampaignQR } from '../../services/QRService';
import {
    generateInviteLink,
    createHubInvite,
    INCENTIVES,
    getInviteStats
} from '../../services/InviteService';
import {
    X,
    Copy,
    CheckCircle,
    Share2,
    Users,
    Gift,
    TrendingDown,
    MessageCircle,
    QrCode
} from 'lucide-react';

interface HubInviteModalProps {
    onClose: () => void;
}

const HubInviteModal: React.FC<HubInviteModalProps> = ({ onClose }) => {
    const { userProfile } = useAuth();
    const { currentHub } = useHub();

    const [qrDataUrl, setQrDataUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inviteStats, setInviteStats] = useState({ pending: 0, joined: 0, ordered: 0 });

    const inviteLink = currentHub && userProfile
        ? generateInviteLink(currentHub.name, userProfile.displayName)
        : '';

    // Generate QR & load stats
    useEffect(() => {
        const loadData = async () => {
            if (!currentHub || !userProfile) return;

            setLoading(true);
            try {
                // Generate QR with invite link
                const qr = await generateCampaignQR(
                    currentHub.id,
                    currentHub.id,
                    userProfile.uid,
                    { width: 200, color: { dark: '#16a34a' } }
                );
                setQrDataUrl(qr);

                // Load invite stats
                const stats = await getInviteStats(userProfile.uid);
                setInviteStats(stats);

                // Create invite record
                await createHubInvite(
                    currentHub.id,
                    currentHub.name,
                    userProfile.uid,
                    userProfile.displayName
                );
            } catch (err) {
                console.error('Error loading invite data:', err);
            }
            setLoading(false);
        };

        loadData();
    }, [currentHub, userProfile]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleShareZalo = () => {
        const text = `🌱 Bác ơi, vào Trạm ${currentHub?.name} mua phân bón giá sỉ với cháu!\n\n💰 Mời đủ 100 người, giá giảm thêm 2,000đ/bao cho TẤT CẢ mọi người.\n🎁 Bác được tặng ngay Voucher 50k đơn đầu tiên!\n\n👉 Bấm link: ${inviteLink}`;
        const zaloUrl = `https://zalo.me/share?link=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
        window.open(zaloUrl, '_blank');
    };

    const handleShareFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
        window.open(fbUrl, '_blank');
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Mời vào ${currentHub?.name}`,
                    text: `Bác ơi, vào Trạm mua phân bón giá sỉ với cháu! Được tặng Voucher 50k.`,
                    url: inviteLink
                });
            } catch (err) {
                handleCopy();
            }
        } else {
            handleCopy();
        }
    };

    const totalInvited = inviteStats.joined + inviteStats.ordered;

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
                padding: 16
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: 'white',
                borderRadius: 20,
                maxWidth: 380,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    padding: '20px 16px',
                    borderRadius: '20px 20px 0 0',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={18} color="white" />
                    </button>

                    <Users size={40} style={{ marginBottom: 8 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                        Mời Hàng Xóm Vào Trạm
                    </h2>
                    <p style={{ opacity: 0.9, fontSize: 14 }}>
                        {currentHub?.name}
                    </p>
                </div>

                {/* Incentives */}
                <div style={{ padding: 16 }}>
                    <div style={{
                        background: '#fef3c7',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16
                    }}>
                        <h3 style={{
                            fontWeight: 600,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#92400e'
                        }}>
                            🎁 Quà cho cả 2
                        </h3>
                        <div style={{ fontSize: 13, color: '#78350f' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <Gift size={14} />
                                <span><b>Bác</b> được +{(INCENTIVES.INVITER_BONUS / 1000).toFixed(0)}k khi họ đặt đơn đầu</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Gift size={14} />
                                <span><b>Họ</b> được Voucher {(INCENTIVES.NEW_USER_VOUCHER / 1000).toFixed(0)}k đơn đầu tiên</span>
                            </div>
                        </div>
                    </div>

                    {/* Sliding Price Incentive */}
                    <div style={{
                        background: '#f0fdf4',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16,
                        border: '1px dashed #16a34a'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 600,
                            color: '#166534',
                            marginBottom: 6
                        }}>
                            <TrendingDown size={16} />
                            Giá Trượt - Mời càng nhiều, giá càng rẻ!
                        </div>
                        <p style={{ fontSize: 12, color: '#15803d' }}>
                            Hiện tại: <b>{currentHub?.memberCount || 0} người</b>
                            <br />
                            Mời thêm đủ <b>100 người</b> → Giá giảm thêm <b>2,000đ/bao</b> cho TẤT CẢ!
                        </p>
                    </div>
                </div>

                {/* QR Code */}
                <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
                    <div style={{
                        background: '#f9fafb',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16
                    }}>
                        {loading ? (
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <QrCode size={32} color="#9ca3af" />
                            </div>
                        ) : (
                            <>
                                <img
                                    src={qrDataUrl}
                                    alt="QR mời vào Trạm"
                                    style={{ width: 160, height: 160, margin: '0 auto' }}
                                />
                                <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                                    Đưa mã này cho hàng xóm quét
                                </p>
                            </>
                        )}
                    </div>

                    {/* Link */}
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
                            fontSize: 12,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#374151'
                        }}>
                            {inviteLink}
                        </span>
                        <button
                            onClick={handleCopy}
                            style={{
                                background: copied ? '#16a34a' : '#e5e7eb',
                                color: copied ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12
                            }}
                        >
                            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                            {copied ? 'Đã copy' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Share Buttons */}
                <div style={{ padding: '0 16px 16px' }}>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8, textAlign: 'center' }}>
                        Chia sẻ qua
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <button
                            onClick={handleShareZalo}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                padding: 12,
                                background: '#0068ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <MessageCircle size={20} />
                            <span style={{ fontSize: 11 }}>Zalo</span>
                        </button>

                        <button
                            onClick={handleShareFacebook}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                padding: 12,
                                background: '#1877f2',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Share2 size={20} />
                            <span style={{ fontSize: 11 }}>Facebook</span>
                        </button>

                        <button
                            onClick={handleNativeShare}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                padding: 12,
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Share2 size={20} />
                            <span style={{ fontSize: 11 }}>Khác</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    padding: 16,
                    background: '#f9fafb',
                    borderRadius: '0 0 20px 20px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        Bác đã mời thành công
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                        <div>
                            <p style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                                {totalInvited}
                            </p>
                            <p style={{ fontSize: 11, color: '#666' }}>người vào Trạm</p>
                        </div>
                        <div style={{ width: 1, background: '#e5e7eb' }} />
                        <div>
                            <p style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                                {(inviteStats.ordered * INCENTIVES.INVITER_BONUS / 1000).toFixed(0)}k
                            </p>
                            <p style={{ fontSize: 11, color: '#666' }}>đã nhận thưởng</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HubInviteModal;
