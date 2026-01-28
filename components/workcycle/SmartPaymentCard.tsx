/**
 * SmartPaymentCard.tsx - Phase 3: Thanh toán (5:00 PM)
 * 
 * Features:
 * - Calculator layout (Hóa đơn + Mic to)
 * - Voice command: "Trả đủ nhé"
 * - Reputation logic: actualPrice >= promisedPrice
 * - Generate Payment Receipt Image
 * - Confetti animation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Mic,
    DollarSign,
    Users,
    Tag,
    Check,
    AlertTriangle,
    Share2,
    Sparkles,
    X
} from 'lucide-react';
import { useWorkCycle } from '../../contexts/WorkCycleContext';
import * as ReputationService from '../../services/ReputationService';

const SmartPaymentCard: React.FC = () => {
    const {
        jobOffer,
        workSession,
        processPayment,
        reputation,
        getElapsedTime
    } = useWorkCycle();

    const [actualPrice, setActualPrice] = useState(jobOffer?.promisedPrice || 250000);
    const [isRecording, setIsRecording] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentResult, setPaymentResult] = useState<{ earned: boolean; total: number } | null>(null);
    const [rippleScale, setRippleScale] = useState(1);

    // Refs
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    if (!jobOffer || !workSession) return null;

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
    const totalAmount = jobOffer.workerCount * actualPrice;
    const isLowerPrice = actualPrice < jobOffer.promisedPrice;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // VOICE RECORDING
    // ═══════════════════════════════════════════════════════════════
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.onstop = () => {
                // Process payment
                const earned = processPayment(actualPrice);
                setPaymentResult({ earned, total: totalAmount });

                if (earned) {
                    setShowConfetti(true);
                    speak(`Tuyệt vời! Đã thanh toán ${formatCurrency(totalAmount)} đồng. Uy tín cộng 1 điểm!`);
                } else {
                    speak(`Đã lưu. Lưu ý giá thấp hơn cam kết, mất uy tín.`);
                }

                setTimeout(() => {
                    setShowReceipt(true);
                    setShowConfetti(false);
                }, 2000);

                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current.start();
        } catch (err) {
            console.error('Mic error:', err);
            speak('Không thể mở micro');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // MIC BUTTON HANDLERS
    // ═══════════════════════════════════════════════════════════════
    const handleMicPress = () => {
        isLongPress.current = false;

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            if ('vibrate' in navigator) navigator.vibrate(100);
            setIsRecording(true);
            setRippleScale(1.15);
            startRecording();
        }, 300);
    };

    const handleMicRelease = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }

        if (isRecording) {
            setIsRecording(false);
            setRippleScale(1);
            stopRecording();
        }
    };

    return (
        <>
            <div
                className="w-full max-w-md mx-auto rounded-3xl overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, #FFFFFF, #F8FAFC)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
                }}
            >
                {/* Header - Payment Mode */}
                <div
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.2)' }}
                        >
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Thanh toán</h2>
                            <p className="text-purple-200 text-sm">Xác nhận cuối ngày</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-purple-200 text-sm">Thời gian</p>
                        <p className="text-white font-bold">{formatTime(getElapsedTime())}</p>
                    </div>
                </div>

                {/* Receipt Style Content */}
                <div className="p-5 space-y-4">
                    {/* Dashed Header */}
                    <div className="text-center pb-3" style={{ borderBottom: '2px dashed #E5E7EB' }}>
                        <p className="text-gray-500 text-sm">📋 PHIẾU THANH TOÁN</p>
                        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    {/* Worker Row */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-gray-700 font-medium">Số thợ</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{jobOffer.workerCount}</p>
                    </div>

                    {/* Price Row */}
                    <div
                        className="flex items-center justify-between py-3 px-3 rounded-xl"
                        style={{ background: isLowerPrice ? '#FEF2F2' : '#F0FDF4' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: isLowerPrice ? '#FECACA' : '#DCFCE7' }}
                            >
                                <Tag className="w-5 h-5" style={{ color: isLowerPrice ? '#DC2626' : '#16A34A' }} />
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium">Giá công</p>
                                {isLowerPrice && (
                                    <p className="text-xs text-red-500">Cam kết: {formatCurrency(jobOffer.promisedPrice)}đ</p>
                                )}
                            </div>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: isLowerPrice ? '#DC2626' : '#111827' }}>
                            {formatCurrency(actualPrice)}đ
                        </p>
                    </div>

                    {/* Quick Price Adjust */}
                    <div className="flex gap-2">
                        {[jobOffer.promisedPrice - 20000, jobOffer.promisedPrice, jobOffer.promisedPrice + 20000].map(p => (
                            <button
                                key={p}
                                onClick={() => setActualPrice(p)}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${actualPrice === p ? 'ring-2 ring-purple-500' : ''
                                    }`}
                                style={{
                                    background: actualPrice === p ? '#EDE9FE' : '#F3F4F6',
                                    color: actualPrice === p ? '#7C3AED' : '#6B7280'
                                }}
                            >
                                {p / 1000}k
                                {p === jobOffer.promisedPrice && ' ✓'}
                            </button>
                        ))}
                    </div>

                    {/* Total */}
                    <div
                        className="py-4 text-center rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}
                    >
                        <p className="text-sm text-purple-600 font-medium mb-1">TỔNG THANH TOÁN</p>
                        <p className="text-4xl font-black text-purple-700">
                            {formatCurrency(totalAmount)}đ
                        </p>
                    </div>

                    {/* Warning if lower */}
                    {isLowerPrice && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <p className="text-red-600 text-sm font-medium">
                                Trả thấp hơn cam kết, sẽ mất uy tín!
                            </p>
                        </div>
                    )}
                </div>

                {/* Giant Mic Button */}
                <div className="p-6 pt-2 text-center">
                    <div className="flex flex-col items-center">
                        <button
                            onMouseDown={handleMicPress}
                            onMouseUp={handleMicRelease}
                            onMouseLeave={handleMicRelease}
                            onTouchStart={handleMicPress}
                            onTouchEnd={handleMicRelease}
                            className="relative transition-transform duration-200"
                            style={{ transform: `scale(${rippleScale})` }}
                        >
                            {/* Ripple rings when recording */}
                            {isRecording && (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="absolute rounded-full border-2"
                                            style={{
                                                width: `${100 + i * 25}px`,
                                                height: `${100 + i * 25}px`,
                                                left: `${-12.5 * i}px`,
                                                top: `${-12.5 * i}px`,
                                                borderColor: `rgba(124, 58, 237, ${0.5 - i * 0.15})`,
                                                animation: `ripple ${1 + i * 0.3}s ease-out infinite`,
                                            }}
                                        />
                                    ))}
                                </>
                            )}

                            {/* Main Button */}
                            <div
                                className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
                                style={{
                                    background: isRecording
                                        ? 'linear-gradient(145deg, #6D28D9, #5B21B6)'
                                        : 'linear-gradient(145deg, #8B5CF6, #7C3AED)',
                                    boxShadow: isRecording
                                        ? '0 0 40px rgba(124, 58, 237, 0.6)'
                                        : '8px 8px 20px rgba(124, 58, 237, 0.3), -4px -4px 12px rgba(255,255,255,0.8)',
                                }}
                            >
                                <Mic className="w-10 h-10 text-white" />
                            </div>
                        </button>

                        <p className="text-gray-500 text-sm mt-4">
                            {isRecording ? '🔴 Đang ghi âm... Thả tay để xác nhận' : 'Giữ nút và nói "Trả đủ nhé"'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                    <div className="text-center">
                        {/* Simple confetti simulation */}
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5],
                                    animation: `confettiFall ${1 + Math.random() * 2}s ease-out forwards`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                }}
                            />
                        ))}
                        <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-2xl">
                            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold text-green-600">UY TÍN +1! 🎉</h3>
                            <p className="text-gray-600">Cảm ơn bác đã giữ chữ tín!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Receipt Modal */}
            {showReceipt && paymentResult && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl overflow-hidden"
                        style={{ background: 'white' }}
                    >
                        {/* Receipt Header */}
                        <div
                            className="p-6 text-center"
                            style={{
                                background: paymentResult.earned
                                    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                                    : 'linear-gradient(135deg, #F59E0B, #D97706)'
                            }}
                        >
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                                {paymentResult.earned ? (
                                    <Check className="w-8 h-8 text-white" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                {paymentResult.earned ? 'ĐÃ THANH TOÁN' : 'ĐÃ LƯU'}
                            </h3>
                            <p className="text-white/80">
                                {paymentResult.earned ? 'Uy tín được bảo toàn ✓' : 'Cảnh báo: Mất điểm uy tín'}
                            </p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between py-2 border-b border-dashed">
                                <span className="text-gray-500">Số thợ</span>
                                <span className="font-bold">{jobOffer.workerCount}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-dashed">
                                <span className="text-gray-500">Giá công</span>
                                <span className="font-bold">{formatCurrency(actualPrice)}đ</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-700 font-medium">TỔNG CỘNG</span>
                                <span className="text-xl font-black text-purple-600">
                                    {formatCurrency(paymentResult.total)}đ
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 space-y-3 bg-gray-50">
                            <button
                                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                                style={{ background: '#25D366', color: 'white' }}
                            >
                                <Share2 className="w-5 h-5" />
                                Chia sẻ Zalo
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 rounded-2xl font-bold bg-gray-200 text-gray-700"
                            >
                                Mai làm tiếp →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
        </>
    );
};

export default SmartPaymentCard;
