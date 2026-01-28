/**
 * EudrStatusCard.tsx - Enhanced for Triple Check System
 * 
 * Dashboard status card showing EUDR verification status
 * Now supports 5 states: Unverified, Safe, Violation, Warning, Legal Risk
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, ShieldCheck, ShieldX, ShieldAlert,
    ChevronRight, QrCode, AlertCircle, AlertOctagon
} from 'lucide-react';

type EudrStatus = 'unverified' | 'safe' | 'violation' | 'warning' | 'legal_risk';

interface EudrStatusCardProps {
    className?: string;
}

const EudrStatusCard: React.FC<EudrStatusCardProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<EudrStatus>('unverified');
    const [timestamp, setTimestamp] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    // Load status from localStorage
    useEffect(() => {
        const savedStatus = localStorage.getItem('eudr_status');
        const savedTimestamp = localStorage.getItem('eudr_timestamp');

        // Map saved status to new 4-state system
        if (savedStatus === 'safe' || savedStatus === 'pass') {
            setStatus('safe');
        } else if (savedStatus === 'violation' || savedStatus === 'fail') {
            setStatus('violation');
        } else if (savedStatus === 'warning') {
            setStatus('warning');
        } else if (savedStatus === 'legal_risk') {
            setStatus('legal_risk');
        } else {
            setStatus('unverified');
        }

        if (savedTimestamp) {
            setTimestamp(new Date(savedTimestamp).toLocaleDateString('vi-VN'));
        }
    }, []);

    const handleClick = () => {
        if (status === 'safe') {
            setShowQRModal(true);
        } else {
            navigate('/eudr-check');
        }
    };

    // Status-based styling configuration
    const statusConfig = {
        unverified: {
            gradient: 'from-orange-500 to-amber-600',
            border: 'border-orange-400/50',
            icon: ShieldAlert,
            iconBg: 'bg-orange-400/20',
            iconColor: 'text-orange-300',
            title: '⚠️ Vườn chưa kiểm tra EUDR',
            subtitle: 'Bấm để xác thực Triple Check!',
            action: 'Kiểm tra ngay',
        },
        safe: {
            gradient: 'from-green-500 to-emerald-600',
            border: 'border-green-400/50',
            icon: ShieldCheck,
            iconBg: 'bg-green-400/20',
            iconColor: 'text-green-300',
            title: '✅ ĐẠT CHUẨN EUDR',
            subtitle: 'Sẵn sàng xuất khẩu Châu Âu',
            action: 'Xem QR',
        },
        warning: {
            gradient: 'from-yellow-500 to-amber-500',
            border: 'border-yellow-400/50',
            icon: AlertCircle,
            iconBg: 'bg-yellow-400/20',
            iconColor: 'text-yellow-300',
            title: '⚠️ Cảnh báo vệ tinh',
            subtitle: 'Cần xác minh thực địa',
            action: 'Xem chi tiết',
        },
        legal_risk: {
            gradient: 'from-orange-600 to-red-500',
            border: 'border-orange-400/50',
            icon: AlertOctagon,
            iconBg: 'bg-orange-400/20',
            iconColor: 'text-orange-300',
            title: '🟠 Rủi ro pháp lý VN',
            subtitle: 'Cần điều chỉnh ranh giới',
            action: 'Xem chi tiết',
        },
        violation: {
            gradient: 'from-red-500 to-rose-600',
            border: 'border-red-400/50',
            icon: ShieldX,
            iconBg: 'bg-red-400/20',
            iconColor: 'text-red-300',
            title: '🛑 Vi phạm nghiêm trọng',
            subtitle: 'Lấn rừng EU + VN',
            action: 'Sửa lại',
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <>
            <button
                onClick={handleClick}
                className={`
          relative w-full p-4 rounded-2xl 
          bg-gradient-to-r ${config.gradient}
          border ${config.border}
          shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
          cursor-pointer
          ${className}
        `}
                style={{ zIndex: 50, position: 'relative' }}
            >
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                        <h3 className="text-white font-bold text-sm">{config.title}</h3>
                        <p className="text-white/70 text-xs mt-0.5">
                            {config.subtitle}
                            {timestamp && status !== 'unverified' && (
                                <span className="text-white/50"> • {timestamp}</span>
                            )}
                        </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5">
                        <span className="text-white text-xs font-bold">{config.action}</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </button>

            {/* QR Modal for verified safe status */}
            {showQRModal && status === 'safe' && (
                <div
                    className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setShowQRModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 max-w-sm w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Chứng nhận EUDR</h3>
                            <p className="text-gray-500 text-sm mb-1">Triple Check - Đạt chuẩn</p>
                            <p className="text-gray-400 text-xs mb-4">Quét mã QR để xác minh</p>

                            {/* QR Code Placeholder */}
                            <div className="bg-gray-100 rounded-xl p-4 mb-4">
                                <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <QrCode className="w-20 h-20 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Farm ID: {localStorage.getItem('farm_id') || 'FARM_001'}</p>
                                <p className="text-xs text-green-600 font-bold mt-1">✓ JRC EU + ✓ VN Forest</p>
                            </div>

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EudrStatusCard;
