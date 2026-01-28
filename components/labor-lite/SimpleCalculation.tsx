/**
 * SimpleCalculation.tsx - Simple Calculation Screen
 * Display: Worker Count × Unit Price = Total
 * NO deductions/advances - Just simple math
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Users,
    Calculator,
    ArrowRight,
    Mic,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import * as LaborService from '../../services/SimpleLaborService';

const SimpleCalculation: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [session, setSession] = useState<LaborService.JobSession | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Load session
    useEffect(() => {
        const current = LaborService.getTodaySession();
        if (current) {
            setSession(current);
        } else {
            // No session, redirect back
            navigate('/labor-lite');
        }
    }, [navigate]);

    // Handler
    const handleConfirmPayment = () => {
        setShowConfirmation(true);
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            {/* Header */}
            <div className="px-6 pt-14 pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/labor-lite')}
                        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white">Tính Tiền</h1>
                        <p className="text-white/60">{LaborService.formatDate(session.date)}</p>
                    </div>
                </div>
            </div>

            {/* Main Calculation Card */}
            <div className="px-6">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                    {/* Worker Count */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                    <Users className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">Số thợ</p>
                                    <p className="text-4xl font-black text-white">{session.workerCount}</p>
                                </div>
                            </div>
                            <span className="text-5xl">👷</span>
                        </div>
                    </div>

                    {/* Unit Price */}
                    <div className="p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/60">Đơn giá</p>
                                <p className="text-3xl font-black text-white">
                                    {LaborService.formatMoney(session.unitPrice)}
                                    <span className="text-lg font-normal text-white/40">/người</span>
                                </p>
                            </div>
                            <span className="text-4xl">💰</span>
                        </div>
                    </div>

                    {/* Calculation */}
                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                        <div className="text-center mb-4">
                            <p className="text-white/60 text-sm mb-2">Công thức</p>
                            <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white/80">
                                <span>{session.workerCount}</span>
                                <span className="text-white/40">×</span>
                                <span>{LaborService.formatMoney(session.unitPrice)}</span>
                                <span className="text-white/40">=</span>
                            </div>
                        </div>

                        {/* Total Amount - SUPER BIG */}
                        <div className="bg-black/30 rounded-3xl p-8 text-center">
                            <p className="text-emerald-400 font-bold text-lg mb-2">💵 TỔNG TIỀN CÔNG</p>
                            <p className="text-6xl font-black text-white">
                                {session.totalAmount.toLocaleString()}
                                <span className="text-2xl text-white/60">đ</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="px-6 mt-8">
                <button
                    onClick={handleConfirmPayment}
                    className="w-full py-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform"
                >
                    XÁC NHẬN ĐÃ TRẢ
                    <ArrowRight className="w-6 h-6" />
                </button>

                <p className="text-center text-white/40 text-sm mt-4">
                    Bước tiếp: Ghi âm xác nhận từ thợ
                </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* AUDIO CONFIRMATION MODAL */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showConfirmation && (
                <AudioConfirmationModal
                    session={session}
                    onComplete={(audioUrl) => {
                        LaborService.confirmPayment(audioUrl);
                        navigate('/labor-lite', { replace: true });
                    }}
                    onCancel={() => setShowConfirmation(false)}
                />
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// AUDIO CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════
interface AudioConfirmationModalProps {
    session: LaborService.JobSession;
    onComplete: (audioUrl?: string) => void;
    onCancel: () => void;
}

const AudioConfirmationModal: React.FC<AudioConfirmationModalProps> = ({
    session,
    onComplete,
    onCancel
}) => {
    const [recording, setRecording] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [recorded, setRecorded] = useState(false);

    // Simulate recording countdown
    useEffect(() => {
        if (recording && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (recording && countdown === 0) {
            setRecording(false);
            setRecorded(true);
        }
    }, [recording, countdown]);

    const handleStartRecording = () => {
        setRecording(true);
        setCountdown(5);
        // In real app: Start actual audio recording here
    };

    const handleConfirm = () => {
        // In real app: Save audio file and get URL
        const mockAudioUrl = `audio_${Date.now()}.m4a`;
        onComplete(mockAudioUrl);
    };

    const handleSkip = () => {
        onComplete(undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-800 rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        {recording ? (
                            <div className="w-12 h-12 rounded-full bg-red-500 animate-pulse" />
                        ) : recorded ? (
                            <CheckCircle className="w-12 h-12 text-white" />
                        ) : (
                            <Mic className="w-12 h-12 text-white" />
                        )}
                    </div>

                    {recording ? (
                        <>
                            <h2 className="text-2xl font-black text-white">Đang ghi âm...</h2>
                            <p className="text-6xl font-black text-white mt-4">{countdown}s</p>
                            <p className="text-white/80 mt-2">Hỏi thợ: "Nhận đủ tiền chưa?"</p>
                        </>
                    ) : recorded ? (
                        <>
                            <h2 className="text-2xl font-black text-white">Đã ghi xong!</h2>
                            <p className="text-white/80 mt-2">Bấm xác nhận để lưu</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black text-white">Ghi âm xác nhận</h2>
                            <p className="text-white/80 mt-2">Ghi lại lời thợ xác nhận đã nhận tiền</p>
                        </>
                    )}
                </div>

                {/* Amount Summary */}
                <div className="px-6 py-5 bg-slate-700/50 text-center">
                    <p className="text-white/60 text-sm">Số tiền đã trả</p>
                    <p className="text-3xl font-black text-emerald-400">
                        {session.totalAmount.toLocaleString()}đ
                    </p>
                </div>

                {/* Buttons */}
                <div className="p-6 space-y-3">
                    {recording ? (
                        <div className="h-14 flex items-center justify-center">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 bg-red-500 rounded-full animate-pulse"
                                        style={{
                                            height: `${20 + Math.random() * 30}px`,
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : recorded ? (
                        <button
                            onClick={handleConfirm}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg"
                        >
                            <CheckCircle className="w-6 h-6" />
                            XÁC NHẬN & LƯU
                        </button>
                    ) : (
                        <button
                            onClick={handleStartRecording}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
                        >
                            <Mic className="w-6 h-6" />
                            BẮT ĐẦU GHI (5 giây)
                        </button>
                    )}

                    {!recording && (
                        <button
                            onClick={recorded ? onCancel : handleSkip}
                            className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold"
                        >
                            {recorded ? 'Ghi lại' : 'Bỏ qua, không ghi âm'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimpleCalculation;
