/**
 * HubSelector.tsx
 * Component chọn Hub thủ công qua Tỉnh/Huyện/Xã
 * Được dùng khi user từ chối GPS
 */

import React, { useState, useEffect } from 'react';
import { useHub } from '../../contexts/HubContext';
import { getProvinces, getDistricts, getWards } from '../../services/LocationService';
import { Province, District, Ward } from '../../types';
import { MapPin, ChevronDown, Loader2, CheckCircle } from 'lucide-react';

interface HubSelectorProps {
    onComplete: () => void;
}

const HubSelector: React.FC<HubSelectorProps> = ({ onComplete }) => {
    const { selectHubManually, loading: hubLoading, error } = useHub();

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Load provinces on mount
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getProvinces();
            setProvinces(data);
            setLoading(false);
        };
        load();
    }, []);

    // Load districts when province changes
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([]);
            setSelectedDistrict('');
            return;
        }

        const load = async () => {
            setLoading(true);
            const data = await getDistricts(selectedProvince);
            setDistricts(data);
            setSelectedDistrict('');
            setSelectedWard('');
            setLoading(false);
        };
        load();
    }, [selectedProvince]);

    // Load wards when district changes
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([]);
            setSelectedWard('');
            return;
        }

        const load = async () => {
            setLoading(true);
            const data = await getWards(selectedDistrict);
            setWards(data);
            setSelectedWard('');
            setLoading(false);
        };
        load();
    }, [selectedDistrict]);

    const handleSubmit = async () => {
        if (!selectedProvince || !selectedDistrict || !selectedWard) return;

        setSubmitting(true);
        const success = await selectHubManually(selectedProvince, selectedDistrict, selectedWard);
        setSubmitting(false);

        if (success) {
            onComplete();
        }
    };

    const canSubmit = selectedProvince && selectedDistrict && selectedWard && !submitting;

    return (
        <div style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <MapPin size={32} color="#16a34a" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    Chọn địa chỉ của bạn
                </h2>
                <p style={{ color: '#666', fontSize: 14 }}>
                    Để tìm kho phân bón và dịch vụ gần bạn nhất
                </p>
            </div>

            {/* Province Dropdown */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    Tỉnh / Thành phố
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 40px 12px 12px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            fontSize: 16,
                            appearance: 'none',
                            background: 'white'
                        }}
                    >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown
                        size={20}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}
                    />
                </div>
            </div>

            {/* District Dropdown */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    Quận / Huyện
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedProvince || loading}
                        style={{
                            width: '100%',
                            padding: '12px 40px 12px 12px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            fontSize: 16,
                            appearance: 'none',
                            background: !selectedProvince ? '#f3f4f6' : 'white',
                            opacity: !selectedProvince ? 0.7 : 1
                        }}
                    >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                    </select>
                    <ChevronDown
                        size={20}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}
                    />
                </div>
            </div>

            {/* Ward Dropdown */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                    Xã / Phường
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict || loading}
                        style={{
                            width: '100%',
                            padding: '12px 40px 12px 12px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            fontSize: 16,
                            appearance: 'none',
                            background: !selectedDistrict ? '#f3f4f6' : 'white',
                            opacity: !selectedDistrict ? 0.7 : 1
                        }}
                    >
                        <option value="">Chọn Xã/Phường</option>
                        {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                    </select>
                    <ChevronDown
                        size={20}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}
                    />
                </div>
            </div>

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

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                    width: '100%',
                    padding: 14,
                    background: canSubmit ? '#16a34a' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}
            >
                {submitting ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang tìm trạm...
                    </>
                ) : (
                    <>
                        <CheckCircle size={18} />
                        Xác nhận địa chỉ
                    </>
                )}
            </button>
        </div>
    );
};

export default HubSelector;
