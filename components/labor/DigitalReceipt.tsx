/**
 * DigitalReceipt.tsx - Screen 3: Hóa Đơn Ảnh
 * Professional receipt với VietQR và Share to Zalo
 */

import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    Share2,
    Download,
    CheckCircle,
    QrCode,
    Printer,
    MessageCircle
} from 'lucide-react';

interface ReceiptData {
    jobType: 'contract' | 'daily';
    quantity: number;
    pricePerUnit: number;
    slopeFactor: number;
    qualityFactor: number;
    grossAmount: number;
    totalAdvances: number;
    netAmount: number;
    breakdown: string[];
}

const DigitalReceipt: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const receiptRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = useState(false);

    // Get data from navigation state or use demo data
    const data: ReceiptData = location.state || {
        jobType: 'contract',
        quantity: 150,
        pricePerUnit: 800,
        slopeFactor: 1.1,
        qualityFactor: 1.0,
        grossAmount: 132000,
        totalAdvances: 500000,
        netAmount: 820000,
        breakdown: [
            '150 kg x 800đ = 120,000đ',
            '+ Hệ số đất dốc (+10%): +12,000đ',
            '- Đã ứng: -500,000đ'
        ]
    };

    // Generate receipt number
    const receiptNo = `CL-${Date.now().toString(36).toUpperCase()}`;
    const today = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Generate VietQR data
    const vietQRData = `${receiptNo}|${data.netAmount}|Thanh toan tien cong`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(vietQRData)}&bgcolor=FFFFFF&color=000000`;

    // Handle share to Zalo
    const handleShareZalo = async () => {
        setSharing(true);
        const text = `📋 PHIẾU THANH TOÁN - ${receiptNo}

💰 Thực lĩnh: ${data.netAmount.toLocaleString()}đ
📊 Chi tiết:
${data.breakdown.join('\n')}

✅ Xác nhận bởi CoffeeLink Agri-OS`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Phiếu thanh toán ${receiptNo}`,
                    text: text
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            // Fallback: Open Zalo with text
            window.open(`https://zalo.me/share?text=${encodeURIComponent(text)}`, '_blank');
        }
        setSharing(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-8">
            {/* Header */}
            <div className="bg-emerald-600 px-5 pt-12 pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white">Hóa Đơn Điện Tử</h1>
                        <p className="text-sm text-white/80">Mã: {receiptNo}</p>
                    </div>
                </div>
            </div>

            {/* Receipt Card */}
            <div className="px-4 -mt-2">
                <div
                    ref={receiptRef}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Receipt Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black">PHIẾU THANH TOÁN</h2>
                        <p className="text-sm text-white/80">CoffeeLink Agri-OS</p>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-6">
                        {/* Meta Info */}
                        <div className="flex justify-between text-sm mb-6 pb-4 border-b border-dashed border-gray-200">
                            <div>
                                <p className="text-gray-400">Mã phiếu</p>
                                <p className="font-bold text-gray-700">{receiptNo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400">Ngày xuất</p>
                                <p className="font-bold text-gray-700">{today}</p>
                            </div>
                        </div>

                        {/* Calculation Details */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Chi tiết tính toán</h3>

                            {/* Job Info */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Loại hình</span>
                                <span className="font-bold text-gray-700">
                                    {data.jobType === 'daily' ? '📅 Công Nhật' : '⚖️ Khoán'}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    {data.jobType === 'daily' ? 'Số ngày' : 'Số lượng'}
                                </span>
                                <span className="font-bold text-gray-700">
                                    {data.quantity} {data.jobType === 'daily' ? 'ngày' : 'kg'}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Đơn giá</span>
                                <span className="font-bold text-gray-700">
                                    {data.pricePerUnit.toLocaleString()}đ/{data.jobType === 'daily' ? 'ngày' : 'kg'}
                                </span>
                            </div>

                            {/* Breakdown */}
                            <div className="my-4 py-4 border-y border-dashed border-gray-200 space-y-2">
                                {data.breakdown.map((line, idx) => {
                                    const isDeduction = line.includes('-');
                                    const isBonus = line.includes('+');
                                    return (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{line.split('=')[0] || line.split(':')[0]}</span>
                                            <span className={`font-bold ${isDeduction ? 'text-red-500' : isBonus ? 'text-emerald-600' : 'text-gray-700'
                                                }`}>
                                                {line.split('=')[1] || line.split(':')[1] || ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Slope & Quality Badges */}
                            <div className="flex gap-2 mb-4">
                                {data.slopeFactor > 1.0 && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                        🏔️ Đất dốc +10%
                                    </span>
                                )}
                                {data.qualityFactor < 1.0 && (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                        ⚠️ Chất lượng -{((1 - data.qualityFactor) * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>

                            {/* Net Amount */}
                            <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-emerald-600 font-bold mb-1">💰 THỰC LĨNH</p>
                                <p className={`text-4xl font-black ${data.netAmount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {data.netAmount.toLocaleString()}
                                    <span className="text-xl">đ</span>
                                </p>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="text-center py-4 border-t border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 mb-3">Quét mã để thanh toán hoặc xác nhận</p>
                            <div className="inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <img
                                    src={qrCodeUrl}
                                    alt="VietQR Code"
                                    className="w-32 h-32"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">VietQR • {receiptNo}</p>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                            <p>Xác nhận bởi CoffeeLink Agri-OS</p>
                            <p className="mt-1">agri-os.coffeelink.vn</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 mt-6 space-y-3">
                <div className="flex gap-3">
                    <button
                        onClick={handleShareZalo}
                        disabled={sharing}
                        className="flex-1 py-4 rounded-xl bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Gửi qua Zalo
                    </button>

                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Phiếu ${receiptNo}`,
                                    text: `Thực lĩnh: ${data.netAmount.toLocaleString()}đ`
                                });
                            }
                        }}
                        className="flex-1 py-4 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                        <Share2 className="w-5 h-5" />
                        Chia sẻ khác
                    </button>
                </div>

                <button
                    onClick={() => navigate('/labor/advances')}
                    className="w-full py-4 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    Hoàn tất
                </button>
            </div>
        </div>
    );
};

export default DigitalReceipt;
