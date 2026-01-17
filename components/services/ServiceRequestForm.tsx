/**
 * ServiceRequestForm.tsx
 * Form tạo yêu cầu tìm thợ
 * Tầng 3: Services Flow
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHub } from '../../contexts/HubContext';
import { createP2PRequest, createHubPoolingRequest } from '../../services/ServiceRequestService';
import { JobType } from '../../types';
import { Calendar, Users, DollarSign, FileText, MapPin, Loader2 } from 'lucide-react';

interface ServiceRequestFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const JOB_TYPES: { value: JobType; label: string; emoji: string }[] = [
    { value: 'harvest', label: 'Hái cà phê', emoji: '🌾' },
    { value: 'irrigation', label: 'Tưới nước', emoji: '💧' },
    { value: 'pruning', label: 'Cắt tỉa', emoji: '✂️' },
    { value: 'fertilizing', label: 'Bón phân', emoji: '🌱' },
    { value: 'spraying', label: 'Phun thuốc', emoji: '🧪' },
    { value: 'other', label: 'Khác', emoji: '🔧' }
];

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ onSuccess, onCancel }) => {
    const { currentUser, userProfile } = useAuth();
    const { currentHub, seasonMode } = useHub();

    const isHarvestMode = seasonMode === 'HARVEST';

    const [jobType, setJobType] = useState<JobType>('harvest');
    const [jobDescription, setJobDescription] = useState('');
    const [workersNeeded, setWorkersNeeded] = useState(1);
    const [daysNeeded, setDaysNeeded] = useState(1);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyRate, setDailyRate] = useState(isHarvestMode ? 350000 : 300000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const estimatedCost = dailyRate * workersNeeded * daysNeeded;
    const depositAmount = isHarvestMode ? Math.round(estimatedCost * 0.3) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser || !userProfile || !currentHub) {
            setError('Vui lòng đăng nhập lại');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = {
                farmerId: currentUser.uid,
                farmerName: userProfile.displayName,
                farmerPhone: userProfile.email, // TODO: Add phone to UserProfile
                hubId: currentHub.id,
                jobType,
                jobDescription: jobDescription || undefined,
                workersNeeded,
                daysNeeded,
                startDate,
                dailyRate
            };

            let result;
            if (isHarvestMode) {
                result = await createHubPoolingRequest(data);
            } else {
                result = await createP2PRequest(data);
            }

            if (result) {
                onSuccess();
            } else {
                setError('Không thể tạo yêu cầu. Vui lòng thử lại.');
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            {/* Job Type Selection */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    Loại công việc
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {JOB_TYPES.map(type => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => setJobType(type.value)}
                            style={{
                                padding: '12px 8px',
                                background: jobType === type.value ? (isHarvestMode ? '#fef2f2' : '#f0fdf4') : '#f9fafb',
                                border: jobType === type.value
                                    ? `2px solid ${isHarvestMode ? '#dc2626' : '#16a34a'}`
                                    : '1px solid #e5e7eb',
                                borderRadius: 8,
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: 20 }}>{type.emoji}</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    <FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Mô tả thêm (tùy chọn)
                </label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="VD: Vườn 2ha, cách đường chính 500m..."
                    rows={2}
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        resize: 'none'
                    }}
                />
            </div>

            {/* Workers & Days */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                        <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Số người cần
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={workersNeeded}
                        onChange={(e) => setWorkersNeeded(parseInt(e.target.value) || 1)}
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            fontSize: 16
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                        <Calendar size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Số ngày làm
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={30}
                        value={daysNeeded}
                        onChange={(e) => setDaysNeeded(parseInt(e.target.value) || 1)}
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            fontSize: 16
                        }}
                    />
                </div>
            </div>

            {/* Start Date */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    <Calendar size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Ngày bắt đầu
                </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 16
                    }}
                />
            </div>

            {/* Daily Rate */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    <DollarSign size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Giá công / ngày / người
                </label>
                <input
                    type="number"
                    min={100000}
                    step={10000}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(parseInt(e.target.value) || 300000)}
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 16
                    }}
                />
            </div>

            {/* Cost Summary */}
            <div style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 12,
                marginBottom: 20
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>Ước tính tổng:</span>
                    <span style={{ fontWeight: 600 }}>{estimatedCost.toLocaleString()}đ</span>
                </div>
                {isHarvestMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#dc2626' }}>Tiền cọc (30%):</span>
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>{depositAmount.toLocaleString()}đ</span>
                    </div>
                )}
            </div>

            {/* Harvest Mode Notice */}
            {isHarvestMode && (
                <div style={{
                    padding: 12,
                    background: '#fef2f2',
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 13,
                    color: '#991b1b'
                }}>
                    ⚠️ <strong>Mùa thu hoạch:</strong> Bạn cần đặt cọc 30% để đảm bảo có thợ.
                    Tiền cọc sẽ được trừ vào tiền công cuối cùng.
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    padding: 12,
                    background: '#fef2f2',
                    borderRadius: 8,
                    marginBottom: 16,
                    color: '#dc2626',
                    fontSize: 14
                }}>
                    {error}
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: 14,
                        background: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        flex: 2,
                        padding: 14,
                        background: loading ? '#9ca3af' : (isHarvestMode ? '#dc2626' : '#16a34a'),
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Đang tạo...
                        </>
                    ) : isHarvestMode ? (
                        'Đăng ký suất thợ'
                    ) : (
                        'Đăng tìm thợ'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ServiceRequestForm;
