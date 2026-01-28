/**
 * Workers.tsx - Optimized Smart Card Stack
 * 
 * "VÒNG LẶP CÔNG BẰNG" - Fair-Play Loop
 * 
 * ✓ UI tối ưu, mượt hơn
 * ✓ Hình ảnh cà phê Việt Nam
 * ✓ Background trong suốt đẹp
 * ✓ Transition mượt giữa các phase
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BottomNav from '../components/layout/BottomNav';
import {
    Users,
    Tag,
    Mic,
    Play,
    Check,
    Clock,
    Award,
    Share2,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    Sparkles,
    Coffee,
    Sun,
    RotateCcw,
    DollarSign
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES & STATE
// ═══════════════════════════════════════════════════════════════
type Phase =
    | 'RECRUIT'      // Phase 0: Tuyển thợ
    | 'CHECKIN'      // Phase 1: Điểm danh sáng  
    | 'WORKING'      // Phase 2: Đang làm
    | 'PAYMENT';     // Phase 3: Thanh toán

interface WorkState {
    phase: Phase;
    workerCount: number;
    promisedPrice: number;
    actualPrice: number;
    startTime: Date | null;
    reputation: number;
}

const STORAGE_KEY = 'coffeelink_workstate';

const loadState = (): WorkState => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...parsed, startTime: parsed.startTime ? new Date(parsed.startTime) : null };
        }
    } catch (e) { }
    return {
        phase: 'RECRUIT',
        workerCount: 5,
        promisedPrice: 270000,
        actualPrice: 270000,
        startTime: null,
        reputation: 3,
    };
};

const saveState = (state: WorkState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

const haptic = (type: 'light' | 'heavy' | 'success') => {
    if ('vibrate' in navigator) {
        const patterns = { light: 30, heavy: 100, success: [50, 50, 100] };
        navigator.vibrate(patterns[type]);
    }
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const Workers: React.FC = () => {
    const [state, setState] = useState<WorkState>(loadState);
    const [elapsed, setElapsed] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);

    // Auto-save state
    useEffect(() => { saveState(state); }, [state]);

    // Update time
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Timer for WORKING phase
    useEffect(() => {
        if (state.phase === 'WORKING' && state.startTime) {
            const interval = setInterval(() => {
                const now = Date.now();
                const start = new Date(state.startTime!).getTime();
                setElapsed(Math.floor((now - start) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [state.phase, state.startTime]);

    const totalAmount = state.workerCount * state.actualPrice;
    const hour = currentTime.getHours();

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════
    const nextPhase = () => {
        haptic('heavy');
        setState(s => {
            switch (s.phase) {
                case 'RECRUIT':
                    return { ...s, phase: 'CHECKIN', actualPrice: s.promisedPrice };
                case 'CHECKIN':
                    return { ...s, phase: 'WORKING', startTime: new Date() };
                case 'WORKING':
                    return { ...s, phase: 'PAYMENT' };
                case 'PAYMENT':
                    const earned = s.actualPrice >= s.promisedPrice;
                    setShowConfetti(earned);
                    setTimeout(() => {
                        setShowConfetti(false);
                        setShowReceipt(true);
                    }, 2000);
                    return { ...s, reputation: earned ? s.reputation + 1 : Math.max(0, s.reputation - 1) };
                default:
                    return s;
            }
        });
    };

    const resetFlow = () => {
        setState({
            phase: 'RECRUIT',
            workerCount: 5,
            promisedPrice: 270000,
            actualPrice: 270000,
            startTime: null,
            reputation: state.reputation,
        });
        setShowReceipt(false);
        setElapsed(0);
    };

    // Navigate to any phase directly
    const goToPhase = (targetPhase: Phase) => {
        haptic('light');
        setState(s => {
            switch (targetPhase) {
                case 'RECRUIT':
                    return { ...s, phase: 'RECRUIT', startTime: null };
                case 'CHECKIN':
                    return { ...s, phase: 'CHECKIN', actualPrice: s.promisedPrice };
                case 'WORKING':
                    return { ...s, phase: 'WORKING', startTime: s.startTime || new Date() };
                case 'PAYMENT':
                    return { ...s, phase: 'PAYMENT' };
                default:
                    return s;
            }
        });
    };

    const adjustWorkers = (delta: number) => {
        haptic('light');
        setState(s => ({ ...s, workerCount: Math.max(1, Math.min(20, s.workerCount + delta)) }));
    };

    const setPrice = (price: number) => {
        haptic('light');
        setState(s => ({
            ...s,
            promisedPrice: price,
            actualPrice: s.phase === 'RECRUIT' ? price : s.actualPrice
        }));
    };

    // Mic button handlers
    const handleMicPress = () => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            haptic('heavy');
            setIsRecording(true);
        }, 300);
    };

    const handleMicRelease = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (isRecording) {
            setIsRecording(false);
            speak(`Đã thanh toán ${formatCurrency(totalAmount)} đồng`);
            nextPhase();
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // PHASE INDICATOR
    // ═══════════════════════════════════════════════════════════════
    const phases: { key: Phase; label: string; icon: React.ReactNode }[] = [
        { key: 'RECRUIT', label: 'Tuyển', icon: <Users className="w-3 h-3" /> },
        { key: 'CHECKIN', label: 'Điểm danh', icon: <Sun className="w-3 h-3" /> },
        { key: 'WORKING', label: 'Làm việc', icon: <Clock className="w-3 h-3" /> },
        { key: 'PAYMENT', label: 'Thanh toán', icon: <DollarSign className="w-3 h-3" /> },
    ];

    const phaseIndex = phases.findIndex(p => p.key === state.phase);

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen relative overflow-hidden pb-24">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* COFFEE PLANTATION BACKGROUND */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="fixed inset-0 z-0">
                {/* Main background image */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/images/coffee_plantation_bg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7) saturate(1.2)',
                    }}
                />

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(
              180deg,
              rgba(45, 90, 61, 0.4) 0%,
              rgba(74, 124, 89, 0.3) 50%,
              rgba(45, 90, 61, 0.6) 100%
            )`,
                    }}
                />

                {/* Coffee beans pattern overlay (subtle) */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'url(/images/coffee_beans_pattern.png)',
                        backgroundSize: '300px',
                        backgroundRepeat: 'repeat',
                    }}
                />

                {/* Floating coffee elements */}
                <div className="absolute top-[10%] right-[5%] text-5xl opacity-20 animate-float">☕</div>
                <div className="absolute top-[30%] left-[3%] text-4xl opacity-15 animate-float-delayed">🌿</div>
                <div className="absolute bottom-[40%] right-[8%] text-3xl opacity-20 animate-float">🍃</div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TOP BAR */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-10 px-4 pt-4">
                <div className="flex items-center justify-between">
                    {/* Time */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md bg-white/20">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-white font-medium">
                            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Reputation */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-2 rounded-full backdrop-blur-md bg-white/20">
                            <Award className="w-4 h-4 text-yellow-300" />
                            <span className="text-white font-bold">{state.reputation}</span>
                            {state.reputation >= 5 && <span>⭐</span>}
                        </div>

                        {state.phase !== 'RECRUIT' && (
                            <button
                                onClick={resetFlow}
                                className="w-10 h-10 rounded-full backdrop-blur-md bg-white/20 flex items-center justify-center"
                            >
                                <RotateCcw className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Phase Progress - CLICKABLE NAVIGATION */}
                <div className="mt-4 flex items-center justify-center gap-2">
                    {phases.map((p, i) => (
                        <React.Fragment key={p.key}>
                            <button
                                onClick={() => goToPhase(p.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95 hover:opacity-90 ${i === phaseIndex
                                    ? 'bg-white text-emerald-700 shadow-lg scale-110'
                                    : i < phaseIndex
                                        ? 'bg-emerald-500/80 text-white'
                                        : 'bg-white/20 text-white/60 hover:bg-white/30'
                                    }`}
                            >
                                {p.icon}
                                <span className="text-xs font-medium">{p.label}</span>
                            </button>
                            {i < phases.length - 1 && (
                                <div className={`w-4 h-0.5 ${i < phaseIndex ? 'bg-emerald-400' : 'bg-white/20'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SMART CARD */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-10 px-4 py-6">
                <div
                    className="rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500"
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.5) inset',
                    }}
                >
                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* PHASE 0: RECRUIT */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {state.phase === 'RECRUIT' && (
                        <>
                            {/* Header */}
                            <div
                                className="px-5 py-4 flex items-center gap-3"
                                style={{ background: 'linear-gradient(135deg, #065F46, #047857)' }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Coffee className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Tuyển Thợ Hái</h2>
                                    <p className="text-emerald-200 text-sm">Tạo tin đăng mới</p>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Worker Count */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Số thợ cần</p>
                                            <p className="text-3xl font-black text-gray-900">{state.workerCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => adjustWorkers(1)} className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center active:scale-90">
                                            <ChevronUp className="w-5 h-5 text-emerald-600" />
                                        </button>
                                        <button onClick={() => adjustWorkers(-1)} className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center active:scale-90">
                                            <ChevronDown className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Tag className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Giá cam kết</p>
                                            <p className="text-2xl font-black text-gray-900">{formatCurrency(state.promisedPrice)}đ</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Prices */}
                                <div className="flex gap-2">
                                    {[250000, 270000, 280000, 300000].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPrice(p)}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${state.promisedPrice === p ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {p / 1000}k
                                        </button>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="p-4 rounded-2xl text-center bg-gradient-to-r from-emerald-50 to-green-50">
                                    <p className="text-sm text-emerald-600 font-medium">Tổng dự kiến</p>
                                    <p className="text-3xl font-black text-emerald-700">{formatCurrency(totalAmount)}đ</p>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={nextPhase}
                                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform text-white"
                                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)' }}
                                >
                                    <Share2 className="w-6 h-6" />
                                    TẠO TIN & TIẾP TỤC
                                </button>
                            </div>
                        </>
                    )}

                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* PHASE 1: CHECK-IN */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {state.phase === 'CHECKIN' && (
                        <>
                            <div
                                className="px-5 py-4 flex items-center gap-3"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
                                    <Sun className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Chào buổi sáng!</h2>
                                    <p className="text-yellow-100 text-sm">Thợ tới chưa bác?</p>
                                </div>
                            </div>

                            {/* Reminder */}
                            <div className="px-5 py-3 bg-yellow-50 flex items-center gap-2">
                                <span className="text-xl">📢</span>
                                <p className="text-amber-800 text-sm font-medium">
                                    Bác đã hứa giá <strong>{formatCurrency(state.promisedPrice)}đ</strong> đấy nhé!
                                </p>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Pre-filled info */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Số thợ đến</p>
                                            <p className="text-3xl font-black text-gray-900">{state.workerCount}</p>
                                        </div>
                                    </div>
                                    <Check className="w-8 h-8 text-emerald-500" />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <Tag className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Giá hôm nay</p>
                                            <p className="text-2xl font-black text-gray-900">{formatCurrency(state.promisedPrice)}đ</p>
                                        </div>
                                    </div>
                                    <Check className="w-8 h-8 text-emerald-500" />
                                </div>

                                {/* Total */}
                                <div className="p-4 rounded-2xl text-center bg-gradient-to-r from-emerald-50 to-green-50">
                                    <p className="text-sm text-emerald-600 font-medium">Tổng dự kiến</p>
                                    <p className="text-3xl font-black text-emerald-700">{formatCurrency(totalAmount)}đ</p>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={nextPhase}
                                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform text-white"
                                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)' }}
                                >
                                    <Play className="w-6 h-6" />
                                    BẮT ĐẦU LÀM VIỆC
                                </button>
                            </div>
                        </>
                    )}

                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* PHASE 2: WORKING */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {state.phase === 'WORKING' && (
                        <>
                            <div
                                className="px-5 py-3 flex items-center justify-between"
                                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 10px rgba(239,68,68,0.8)' }} />
                                    <span className="text-white font-bold">ĐANG LÀM VIỆC</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20">
                                    <Users className="w-4 h-4 text-white" />
                                    <span className="text-white font-bold">{state.workerCount}</span>
                                </div>
                            </div>

                            <div className="p-6 text-center space-y-6">
                                {/* Big Clock */}
                                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                                    <Clock className="w-8 h-8 text-emerald-600" />
                                    <span className="text-5xl font-mono font-black text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {formatTime(elapsed)}
                                    </span>
                                </div>

                                {/* Cost Display */}
                                <div className="py-4">
                                    <p className="text-gray-500 text-sm mb-2">Số tiền chuẩn bị</p>
                                    <p className="text-4xl font-black text-emerald-600">{formatCurrency(totalAmount)}đ</p>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Giá công</p>
                                        <p className="text-lg font-bold">{formatCurrency(state.promisedPrice)}đ</p>
                                    </div>
                                    <div className="w-px bg-gray-200" />
                                    <div>
                                        <p className="text-sm text-gray-500">Số thợ</p>
                                        <p className="text-lg font-bold">{state.workerCount}</p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={nextPhase}
                                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform text-white"
                                    style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}
                                >
                                    <Check className="w-6 h-6" />
                                    KẾT THÚC & THANH TOÁN
                                </button>
                            </div>
                        </>
                    )}

                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* PHASE 3: PAYMENT */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {state.phase === 'PAYMENT' && (
                        <>
                            <div
                                className="px-5 py-4 flex items-center gap-3"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Thanh Toán</h2>
                                    <p className="text-purple-200 text-sm">Xác nhận cuối ngày</p>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Receipt Header */}
                                <div className="text-center pb-3 border-b-2 border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm">📋 PHIẾU THANH TOÁN</p>
                                </div>

                                {/* Details */}
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Số thợ</span>
                                    <span className="font-bold text-xl">{state.workerCount}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Giá công</span>
                                    <span className="font-bold text-xl">{formatCurrency(state.actualPrice)}đ</span>
                                </div>

                                {/* Total */}
                                <div className="p-4 rounded-2xl text-center bg-gradient-to-r from-purple-50 to-violet-50">
                                    <p className="text-sm text-purple-600 font-medium">TỔNG THANH TOÁN</p>
                                    <p className="text-4xl font-black text-purple-700">{formatCurrency(totalAmount)}đ</p>
                                </div>

                                {/* Giant Mic Button */}
                                <div className="flex flex-col items-center py-4">
                                    <button
                                        onMouseDown={handleMicPress}
                                        onMouseUp={handleMicRelease}
                                        onMouseLeave={handleMicRelease}
                                        onTouchStart={handleMicPress}
                                        onTouchEnd={handleMicRelease}
                                        className="relative"
                                    >
                                        {/* Ripples */}
                                        {isRecording && [1, 2, 3].map(i => (
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

                                        <div
                                            className="w-[100px] h-[100px] rounded-full flex items-center justify-center transition-transform"
                                            style={{
                                                background: isRecording ? 'linear-gradient(145deg, #6D28D9, #5B21B6)' : 'linear-gradient(145deg, #8B5CF6, #7C3AED)',
                                                boxShadow: isRecording ? '0 0 40px rgba(124, 58, 237, 0.6)' : '8px 8px 20px rgba(124, 58, 237, 0.3)',
                                                transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                                            }}
                                        >
                                            <Mic className="w-10 h-10 text-white" />
                                        </div>
                                    </button>
                                    <p className="text-gray-500 text-sm mt-4">
                                        {isRecording ? '🔴 Đang ghi... Thả để xác nhận' : 'Giữ nút và nói "Trả đủ nhé"'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CONFETTI */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showConfetti && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5],
                                animation: `confettiFall ${1 + Math.random() * 2}s ease-out forwards`,
                            }}
                        />
                    ))}
                    <div className="bg-white/95 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-2xl text-center">
                        <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-green-600">UY TÍN +1! 🎉</h3>
                        <p className="text-gray-600">Cảm ơn bác đã giữ chữ tín!</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* RECEIPT MODAL */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="w-full max-w-sm rounded-3xl overflow-hidden bg-white">
                        <div className="p-6 text-center bg-gradient-to-br from-emerald-500 to-green-600">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">ĐÃ THANH TOÁN</h3>
                            <p className="text-emerald-100">Uy tín: {state.reputation} ⭐</p>
                        </div>

                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số thợ</span>
                                <span className="font-bold">{state.workerCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Giá công</span>
                                <span className="font-bold">{formatCurrency(state.actualPrice)}đ</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="font-medium">TỔNG</span>
                                <span className="text-xl font-black text-emerald-600">{formatCurrency(totalAmount)}đ</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 bg-gray-50">
                            <button className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white" style={{ background: '#25D366' }}>
                                <Share2 className="w-5 h-5" />
                                Chia sẻ Zalo
                            </button>
                            <button onClick={resetFlow} className="w-full py-4 rounded-2xl font-bold bg-gray-200 text-gray-700">
                                Mai làm tiếp →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS */}
            <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 8s ease-in-out infinite; animation-delay: 2s; }
      `}</style>

            <BottomNav />
        </div>
    );
};

export default Workers;
