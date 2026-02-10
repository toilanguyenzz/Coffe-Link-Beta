/**
 * ChemicalResultCard.tsx
 * 
 * Display scanned chemical product with EU export compliance status.
 * 
 * Three states:
 * - BANNED: Full-screen red alert, cannot proceed
 * - WARNING: Yellow alert with PHI countdown, must confirm
 * - SAFE: Green checkmark, can proceed
 */

import React, { useState } from 'react';
import {
    X, Ban, AlertTriangle, CheckCircle2, ShieldCheck, ShieldAlert, ShieldX,
    Calendar, Clock, Beaker, Building2, ChevronRight
} from 'lucide-react';
import { CropProtectionProduct, ComplianceStatus } from '../types';

interface ChemicalResultCardProps {
    product: CropProtectionProduct;
    earliestHarvestDate?: Date;
    onClose: () => void;
    onConfirm?: () => void;  // Only for WARNING status
    onScanAnother: () => void;
}

const ChemicalResultCard: React.FC<ChemicalResultCardProps> = ({
    product,
    earliestHarvestDate,
    onClose,
    onConfirm,
    onScanAnother
}) => {
    const [acknowledged, setAcknowledged] = useState(false);
    const status = product.export_compliance.eu_status;

    // Format date in Vietnamese
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Status-specific configurations
    const getStatusConfig = (status: ComplianceStatus) => {
        switch (status) {
            case 'BANNED':
                return {
                    bgGradient: 'from-red-900 via-red-800 to-red-900',
                    headerBg: 'bg-red-600',
                    accentColor: 'text-red-400',
                    borderColor: 'border-red-500/30',
                    badgeBg: 'bg-red-500',
                    badgeText: '🔴 CẤM XUẤT KHẨU',
                    Icon: ShieldX,
                    title: 'KHÔNG ĐƯỢC SỬ DỤNG',
                    subtitle: 'Sản phẩm này chứa hoạt chất bị EU cấm'
                };
            case 'WARNING':
                return {
                    bgGradient: 'from-amber-900 via-orange-900 to-amber-900',
                    headerBg: 'bg-amber-600',
                    accentColor: 'text-amber-400',
                    borderColor: 'border-amber-500/30',
                    badgeBg: 'bg-amber-500',
                    badgeText: '🟡 CẢNH BÁO CAO',
                    Icon: ShieldAlert,
                    title: 'CẨN THẬN KHI SỬ DỤNG',
                    subtitle: 'Phải tuân thủ thời gian cách ly nghiêm ngặt'
                };
            case 'SAFE':
                return {
                    bgGradient: 'from-green-900 via-emerald-900 to-green-900',
                    headerBg: 'bg-green-600',
                    accentColor: 'text-green-400',
                    borderColor: 'border-green-500/30',
                    badgeBg: 'bg-green-500',
                    badgeText: '🟢 ĐẠT CHUẨN',
                    Icon: ShieldCheck,
                    title: 'AN TOÀN CHO XUẤT KHẨU',
                    subtitle: 'Sản phẩm đáp ứng tiêu chuẩn EU'
                };
        }
    };

    const config = getStatusConfig(status);
    const StatusIcon = config.Icon;

    return (
        <div className={`fixed inset-0 z-[1000] flex flex-col bg-gradient-to-b ${config.bgGradient}`}>
            {/* Header */}
            <div className={`${config.headerBg} px-4 pt-12 pb-6`}>
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <span className={`${config.badgeBg} text-white px-3 py-1.5 rounded-full text-xs font-bold`}>
                        {config.badgeText}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <StatusIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-white text-xl font-black">{config.title}</h1>
                        <p className="text-white/80 text-sm">{config.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {/* Product Info */}
                <div className={`bg-white/10 rounded-2xl p-4 border ${config.borderColor}`}>
                    <h2 className="text-white font-bold text-lg mb-1">{product.trade_name}</h2>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Building2 className="w-4 h-4" />
                        <span>{product.manufacturer}</span>
                    </div>
                    <div className="mt-2 text-white/40 text-xs font-mono">
                        Mã vạch: {product.barcode}
                    </div>
                </div>

                {/* Active Ingredients */}
                <div className={`bg-white/10 rounded-2xl p-4 border ${config.borderColor}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Beaker className={`w-5 h-5 ${config.accentColor}`} />
                        <h3 className="text-white font-bold">Hoạt chất chính</h3>
                    </div>
                    <div className="space-y-2">
                        {product.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                <span className="text-white font-medium">{ing.name}</span>
                                <span className={`${config.accentColor} font-bold`}>
                                    {ing.concentration} {ing.unit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Violation Reason */}
                <div className={`bg-white/10 rounded-2xl p-4 border ${config.borderColor}`}>
                    <p className="text-white/90 text-sm leading-relaxed">
                        {product.export_compliance.violation_reason}
                    </p>
                </div>

                {/* PHI / Harvest Date - Only for WARNING and SAFE */}
                {status !== 'BANNED' && earliestHarvestDate && (
                    <div className={`bg-white/10 rounded-2xl p-4 border ${config.borderColor}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className={`w-5 h-5 ${config.accentColor}`} />
                            <h3 className="text-white font-bold">Thời gian cách ly (PHI)</h3>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/70 text-sm">Số ngày chờ:</span>
                            <span className={`text-2xl font-black ${config.accentColor}`}>
                                {product.export_compliance.isolation_days} ngày
                            </span>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                            <Clock className={`w-6 h-6 ${config.accentColor}`} />
                            <div>
                                <p className="text-white/60 text-xs">Ngày thu hoạch sớm nhất:</p>
                                <p className="text-white font-bold text-sm">{formatDate(earliestHarvestDate)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation checkbox - Only for WARNING */}
                {status === 'WARNING' && (
                    <label className="flex items-start gap-3 bg-amber-500/20 rounded-2xl p-4 border border-amber-500/30 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            className="w-5 h-5 rounded mt-0.5 accent-amber-500"
                        />
                        <span className="text-white text-sm leading-relaxed">
                            Tôi cam kết tuân thủ thời gian cách ly <strong>{product.export_compliance.isolation_days} ngày</strong> trước khi thu hoạch.
                            Tôi hiểu rằng vi phạm sẽ dẫn đến lô hàng bị từ chối xuất khẩu.
                        </span>
                    </label>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pb-10 bg-black/30 backdrop-blur-md">
                {status === 'BANNED' ? (
                    <>
                        {/* BANNED: Only allowed to close or scan another */}
                        <button
                            onClick={onScanAnother}
                            className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg mb-3"
                        >
                            Quét sản phẩm khác
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white/10 text-white/70 rounded-xl font-medium"
                        >
                            Đóng
                        </button>
                    </>
                ) : status === 'WARNING' ? (
                    <>
                        {/* WARNING: Must acknowledge before proceeding */}
                        <button
                            onClick={onConfirm}
                            disabled={!acknowledged}
                            className={`w-full py-4 rounded-2xl font-bold text-lg mb-3 transition-all ${acknowledged
                                    ? 'bg-amber-500 text-white hover:bg-amber-400'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {acknowledged ? 'Xác nhận đã hiểu' : 'Đánh dấu cam kết để tiếp tục'}
                        </button>
                        <button
                            onClick={onScanAnother}
                            className="w-full py-3 bg-white/10 text-white/70 rounded-xl font-medium"
                        >
                            Quét sản phẩm khác
                        </button>
                    </>
                ) : (
                    <>
                        {/* SAFE: Can proceed freely */}
                        <button
                            onClick={onConfirm || onClose}
                            className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg mb-3 hover:bg-green-400 transition-colors"
                        >
                            ✓ Đã ghi nhận, tiếp tục
                        </button>
                        <button
                            onClick={onScanAnother}
                            className="w-full py-3 bg-white/10 text-white/70 rounded-xl font-medium"
                        >
                            Quét sản phẩm khác
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Not Found Card - When barcode doesn't match any product
export const ChemicalNotFoundCard: React.FC<{
    barcode: string;
    onClose: () => void;
    onScanAnother: () => void;
}> = ({ barcode, onClose, onScanAnother }) => (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="bg-gray-700 px-4 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white">
                    <X className="h-5 w-5" />
                </button>
                <span className="bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    ❓ KHÔNG TÌM THẤY
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-white text-xl font-black">Sản phẩm không có trong CSDL</h1>
                    <p className="text-white/80 text-sm">Mã vạch: {barcode}</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-white/70 mb-6">
                Sản phẩm này chưa được kiểm tra trong hệ thống. Vui lòng liên hệ đại lý hoặc nhà cung cấp để xác minh thông tin tuân thủ EU.
            </p>

            <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30 w-full max-w-sm">
                <p className="text-blue-300 text-sm">
                    💡 <strong>Mẹo:</strong> Chụp ảnh nhãn sản phẩm và gửi cho chúng tôi qua Zalo để được hỗ trợ thêm.
                </p>
            </div>
        </div>

        {/* Actions */}
        <div className="p-4 pb-10 bg-black/30">
            <button
                onClick={onScanAnother}
                className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg mb-3"
            >
                Quét sản phẩm khác
            </button>
            <button
                onClick={onClose}
                className="w-full py-3 bg-white/10 text-white/70 rounded-xl font-medium"
            >
                Đóng
            </button>
        </div>
    </div>
);

export default ChemicalResultCard;
