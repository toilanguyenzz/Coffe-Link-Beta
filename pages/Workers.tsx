/**
 * Workers.tsx
 * Trang tìm thợ - Thợ Ruột & Đăng tìm thợ
 * Tầng 3: Services Flow
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHub } from '../contexts/HubContext';
import BottomNav from '../components/layout/BottomNav';
import ServiceRequestForm from '../components/services/ServiceRequestForm';
import {
    getFarmerRequests,
    getFavoriteWorkers,
    getOpenRequests,
    generateFacebookShareText
} from '../services/ServiceRequestService';
import { ServiceRequest, UserProfile } from '../types';
import {
    Users,
    Plus,
    Search,
    Calendar,
    Star,
    Phone,
    MessageCircle,
    Share2,
    CheckCircle,
    Clock,
    X
} from 'lucide-react';

type Tab = 'favorites' | 'find' | 'history';

const Workers: React.FC = () => {
    const { currentUser, userProfile } = useAuth();
    const { currentHub, seasonMode } = useHub();

    const [activeTab, setActiveTab] = useState<Tab>('favorites');
    const [favoriteWorkers, setFavoriteWorkers] = useState<UserProfile[]>([]);
    const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
    const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const isHarvestMode = seasonMode === 'HARVEST';

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser || !userProfile) return;

            setLoading(true);
            try {
                const [favorites, requests] = await Promise.all([
                    getFavoriteWorkers(currentUser.uid),
                    getFarmerRequests(currentUser.uid)
                ]);

                setFavoriteWorkers(favorites);
                setMyRequests(requests);

                // Load open requests nếu user là thợ
                if (userProfile.role === 'worker' && currentHub?.id) {
                    const open = await getOpenRequests(currentHub.id);
                    setOpenRequests(open);
                }
            } catch (err) {
                console.error('Error loading workers data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentUser, userProfile, currentHub?.id]);

    const handleShareToFacebook = (request: ServiceRequest) => {
        const text = generateFacebookShareText(request);
        const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; label: string }> = {
            OPEN: { bg: '#fef3c7', color: '#92400e', label: 'Đang tìm' },
            MATCHED: { bg: '#dbeafe', color: '#1e40af', label: 'Đã khớp' },
            IN_PROGRESS: { bg: '#dcfce7', color: '#166534', label: 'Đang làm' },
            COMPLETED: { bg: '#f3f4f6', color: '#374151', label: 'Hoàn thành' },
            CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Đã hủy' }
        };
        const style = styles[status] || styles.OPEN;

        return (
            <span style={{
                background: style.bg,
                color: style.color,
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div className="page-container" style={{ paddingTop: isHarvestMode ? 50 : 0 }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                background: isHarvestMode ? '#fef2f2' : 'white',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700 }}>
                        {isHarvestMode ? '🔴 Đăng ký thợ mùa vụ' : '👷 Tìm thợ'}
                    </h1>

                    <button
                        onClick={() => setShowCreateForm(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: isHarvestMode ? '#dc2626' : '#16a34a',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} />
                        {isHarvestMode ? 'Đăng ký suất' : 'Đăng tìm'}
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {[
                        { id: 'favorites', label: 'Thợ ruột', icon: Star },
                        { id: 'find', label: 'Tìm mới', icon: Search },
                        { id: 'history', label: 'Lịch sử', icon: Calendar }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    padding: '10px 12px',
                                    background: isActive ? (isHarvestMode ? '#dc2626' : '#16a34a') : '#f3f4f6',
                                    color: isActive ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: 8,
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
            </div>

            {/* Content */}
            <div style={{ padding: 20, paddingBottom: 100 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Clock size={32} color="#9ca3af" className="animate-spin" />
                        <p style={{ marginTop: 8, color: '#666' }}>Đang tải...</p>
                    </div>
                ) : activeTab === 'favorites' ? (
                    /* Thợ Ruột Tab */
                    favoriteWorkers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
                            <Star size={40} color="#d4af37" />
                            <h3 style={{ marginTop: 12 }}>Chưa có thợ ruột</h3>
                            <p style={{ color: '#666', marginTop: 4 }}>
                                Thêm thợ vào danh sách để đặt lịch nhanh hơn
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {favoriteWorkers.map(worker => (
                                <div
                                    key={worker.uid}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 16,
                                        background: 'white',
                                        borderRadius: 12,
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        background: '#f0fdf4',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}>
                                        <Users size={24} color="#16a34a" />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600 }}>{worker.displayName}</p>
                                        {worker.workerProfile && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#666', fontSize: 13 }}>
                                                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                                    {worker.workerProfile.rating.toFixed(1)}
                                                </span>
                                                <span style={{ color: '#9ca3af' }}>•</span>
                                                <span style={{ fontSize: 13, color: '#666' }}>
                                                    {worker.workerProfile.completedJobs} việc
                                                </span>
                                                <span style={{
                                                    fontSize: 11,
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    background: worker.workerProfile.availability === 'available' ? '#dcfce7' : '#fee2e2',
                                                    color: worker.workerProfile.availability === 'available' ? '#166534' : '#991b1b'
                                                }}>
                                                    {worker.workerProfile.availability === 'available' ? 'Rảnh' : 'Bận'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button style={{ background: '#f0fdf4', padding: 8, borderRadius: 8, border: 'none' }}>
                                            <Phone size={18} color="#16a34a" />
                                        </button>
                                        <button style={{ background: '#dbeafe', padding: 8, borderRadius: 8, border: 'none' }}>
                                            <MessageCircle size={18} color="#2563eb" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'find' ? (
                    /* Tìm mới Tab - Cho thợ xem */
                    openRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
                            <Search size={40} color="#9ca3af" />
                            <h3 style={{ marginTop: 12 }}>Không có việc mới</h3>
                            <p style={{ color: '#666', marginTop: 4 }}>
                                Các yêu cầu tìm thợ sẽ hiển thị ở đây
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {openRequests.map(req => (
                                <div
                                    key={req.id}
                                    style={{
                                        padding: 16,
                                        background: 'white',
                                        borderRadius: 12,
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 16 }}>{req.jobDescription || req.jobType}</p>
                                            <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                                                {req.farmerName} • {req.startDate}
                                            </p>
                                        </div>
                                        {getStatusBadge(req.status)}
                                    </div>

                                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                                        <span style={{ fontSize: 13 }}>👥 {req.workersNeeded} người</span>
                                        <span style={{ fontSize: 13 }}>📅 {req.daysNeeded} ngày</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                                            💰 {(req.dailyRate || 300000).toLocaleString()}đ/ngày
                                        </span>
                                    </div>

                                    <button
                                        style={{
                                            width: '100%',
                                            marginTop: 12,
                                            padding: '10px',
                                            background: '#16a34a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Nhận việc
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Lịch sử Tab */
                    myRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
                            <Calendar size={40} color="#9ca3af" />
                            <h3 style={{ marginTop: 12 }}>Chưa có lịch sử</h3>
                            <p style={{ color: '#666', marginTop: 4 }}>
                                Các yêu cầu tìm thợ của bạn sẽ hiển thị ở đây
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {myRequests.map(req => (
                                <div
                                    key={req.id}
                                    style={{
                                        padding: 16,
                                        background: 'white',
                                        borderRadius: 12,
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{req.jobDescription || req.jobType}</p>
                                            <p style={{ fontSize: 13, color: '#666' }}>{req.startDate}</p>
                                        </div>
                                        {getStatusBadge(req.status)}
                                    </div>

                                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13 }}>
                                        <span>👥 {req.workersNeeded} người</span>
                                        <span>📅 {req.daysNeeded} ngày</span>
                                    </div>

                                    {req.status === 'OPEN' && !req.isSharedToFacebook && (
                                        <button
                                            onClick={() => handleShareToFacebook(req)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                width: '100%',
                                                marginTop: 12,
                                                padding: '10px',
                                                background: '#1877f2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Share2 size={16} />
                                            Đăng hộ lên Facebook
                                        </button>
                                    )}

                                    {req.isSharedToFacebook && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 8,
                                            color: '#16a34a',
                                            fontSize: 13
                                        }}>
                                            <CheckCircle size={14} />
                                            Đã đăng lên Facebook
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Create Request Modal */}
            {showCreateForm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '100%',
                        maxHeight: '90vh',
                        background: 'white',
                        borderRadius: '20px 20px 0 0',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <h2 style={{ fontWeight: 600 }}>
                                {isHarvestMode ? 'Đăng ký suất thợ mùa vụ' : 'Đăng tìm thợ'}
                            </h2>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <ServiceRequestForm
                            onSuccess={() => {
                                setShowCreateForm(false);
                                // Reload requests
                                if (currentUser) {
                                    getFarmerRequests(currentUser.uid).then(setMyRequests);
                                }
                            }}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default Workers;
