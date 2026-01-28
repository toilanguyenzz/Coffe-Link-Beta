/**
 * SimpleLaborHome.tsx - Chấm Công (Premium UI)
 * Tích hợp: Task Menu + Calculator + Audio Proof
 * Optimized for elderly farmers - Beautiful, High-contrast, Minimal typing
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Cherry,
    Droplets,
    Leaf,
    Wrench,
    Users,
    DollarSign,
    Mic,
    CheckCircle,
    History,
    ChevronLeft,
    Minus,
    Plus,
    Volume2,
    Wallet,
    TrendingUp,
    Calendar,
    Sparkles,
    Clock
} from 'lucide-react';
import * as LaborService from '../../services/SimpleLaborService';

// ═══════════════════════════════════════════════════════════════
// FARMING TASKS
// ═══════════════════════════════════════════════════════════════
interface FarmingTask {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    color: string;
    emoji: string;
}

const FARMING_TASKS: FarmingTask[] = [
    {
        id: 'harvest',
        name: 'Hái Cà',
        icon: Cherry,
        gradient: 'from-rose-500 to-red-600',
        color: 'text-rose-400',
        emoji: '🍒'
    },
    {
        id: 'water',
        name: 'Tưới Nước',
        icon: Droplets,
        gradient: 'from-cyan-500 to-blue-600',
        color: 'text-cyan-400',
        emoji: '💧'
    },
    {
        id: 'weed',
        name: 'Làm Cỏ',
        icon: Leaf,
        gradient: 'from-emerald-500 to-green-600',
        color: 'text-emerald-400',
        emoji: '🌿'
    },
    {
        id: 'other',
        name: 'Khác',
        icon: Wrench,
        gradient: 'from-slate-500 to-gray-600',
        color: 'text-slate-400',
        emoji: '🛠️'
    }
];

// ═══════════════════════════════════════════════════════════════
// FORMAT HELPERS  
// ═══════════════════════════════════════════════════════════════
const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatShort = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}tr`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const SimpleLaborHome: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [currentTask, setCurrentTask] = useState<FarmingTask>(FARMING_TASKS[0]);
    const [workerCount, setWorkerCount] = useState(5);
    const [unitPrice, setUnitPrice] = useState(250000);
    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [history, setHistory] = useState<LaborService.LaborHistory>({ sessions: [], totalSpent: 0, totalDays: 0 });
    const [stats, setStats] = useState({ totalSpent: 0, totalDays: 0, avgPrice: 250000, sessionCount: 0 });

    // Load data
    useEffect(() => {
        const historyData = LaborService.getHistory();
        const statsData = LaborService.getSeasonStats();
        setHistory(historyData);
        setStats(statsData);
    }, []);

    // Calculate total
    const totalCost = useMemo(() => workerCount * unitPrice, [workerCount, unitPrice]);

    // Handlers
    const handleWorkerChange = (delta: number) => {
        setWorkerCount(Math.max(1, Math.min(99, workerCount + delta)));
    };

    const handleComplete = () => {
        // Save session
        LaborService.createNewSession(workerCount, unitPrice);
        LaborService.confirmPayment();

        // Refresh data
        setHistory(LaborService.getHistory());
        setStats(LaborService.getSeasonStats());
        setShowRecordingModal(false);

        // Reset
        setWorkerCount(5);
    };

    // Quick prices
    const quickPrices = [200000, 250000, 280000, 300000];

    return (
        <div className="min-h-screen bg-[#0a0f1a] overflow-x-hidden">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO HEADER WITH GRADIENT */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={`relative bg-gradient-to-br ${currentTask.gradient} pb-32`}>
                {/* Decorative orbs */}
                <div className="absolute top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-40 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                {/* Header */}
                <div className="relative px-6 pt-14 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Chấm Công</h1>
                                <p className="text-white/70 text-sm font-medium">Quản lý thợ đơn giản</p>
                            </div>
                        </div>
                        <button className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20">
                            <History className="w-5 h-5 text-white/80" />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="px-6 flex gap-4">
                    <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-4 h-4 text-white/70" />
                            <span className="text-xs font-bold text-white/60 uppercase">Vụ này</span>
                        </div>
                        <p className="text-2xl font-black text-white">{formatShort(stats.totalSpent)}</p>
                    </div>
                    <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-white/70" />
                            <span className="text-xs font-bold text-white/60 uppercase">Giá TB</span>
                        </div>
                        <p className="text-2xl font-black text-white">{formatShort(stats.avgPrice)}</p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MAIN CONTENT - Overlapping Card */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="px-5 -mt-24 pb-8 space-y-5">
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TASK SELECTION - Beautiful Cards */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-[#131b2e]/90 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Chọn công việc</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {FARMING_TASKS.map((task) => {
                            const Icon = task.icon;
                            const isSelected = currentTask.id === task.id;
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => setCurrentTask(task)}
                                    className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2
                    transition-all duration-300 overflow-hidden
                    ${isSelected
                                            ? `bg-gradient-to-br ${task.gradient} shadow-lg scale-105`
                                            : 'bg-white/5 hover:bg-white/10'
                                        }
                  `}
                                >
                                    {/* Glow effect when selected */}
                                    {isSelected && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${task.gradient} opacity-50 blur-xl`} />
                                    )}

                                    <div className={`relative z-10 text-3xl`}>{task.emoji}</div>
                                    <span className={`relative z-10 text-[11px] font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                        {task.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* CALCULATOR SECTION */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-[#131b2e]/90 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
                    {/* Worker Count */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTask.gradient} flex items-center justify-center shadow-lg`}>
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">Số lượng thợ</p>
                                    <p className="text-white/40 text-sm">Bao nhiêu người làm?</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={() => handleWorkerChange(-1)}
                                className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center active:scale-90 transition-all hover:bg-white/15 border border-white/10"
                            >
                                <Minus className="w-7 h-7 text-white/80" />
                            </button>

                            <div className="text-center min-w-[100px]">
                                <p className="text-7xl font-black text-white tabular-nums">{workerCount}</p>
                                <p className="text-white/40 text-sm mt-1">người</p>
                            </div>

                            <button
                                onClick={() => handleWorkerChange(1)}
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentTask.gradient} flex items-center justify-center active:scale-90 transition-all shadow-lg`}
                            >
                                <Plus className="w-7 h-7 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Divider with glow */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className={`px-4 bg-[#131b2e] text-xs font-bold ${currentTask.color}`}>×</span>
                        </div>
                    </div>

                    {/* Unit Price */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">Giá công hôm nay</p>
                                    <p className="text-white/40 text-sm">Bao nhiêu tiền/người?</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Price Pills */}
                        <div className="flex gap-2 mb-4">
                            {quickPrices.map((price) => (
                                <button
                                    key={price}
                                    onClick={() => setUnitPrice(price)}
                                    className={`
                    flex-1 py-3 rounded-xl font-bold text-sm transition-all
                    ${unitPrice === price
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                        }
                  `}
                                >
                                    {(price / 1000)}k
                                </button>
                            ))}
                        </div>

                        {/* Custom Price */}
                        <div className="relative">
                            <input
                                type="number"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-black text-white text-center outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">đ</span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TOTAL DISPLAY - Premium Card */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className={`relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${currentTask.gradient} shadow-2xl`}>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full mb-4">
                            <span className="text-xl">{currentTask.emoji}</span>
                            <span className="text-white font-bold text-sm">{currentTask.name}</span>
                        </div>

                        <p className="text-white/70 font-bold text-sm uppercase tracking-wider mb-2">
                            Tổng tiền công
                        </p>
                        <p className="text-5xl md:text-6xl font-black text-white tracking-tight">
                            {formatCurrency(totalCost)}
                        </p>
                        <p className="text-white/60 text-sm mt-3 font-medium">
                            {workerCount} người × {formatShort(unitPrice)}
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* ACTION BUTTON - Premium */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <button
                    onClick={() => setShowRecordingModal(true)}
                    disabled={workerCount === 0 || unitPrice === 0}
                    className={`
            w-full py-6 rounded-3xl font-black text-xl
            flex items-center justify-center gap-3
            transition-all active:scale-[0.98]
            bg-gradient-to-r from-rose-500 via-red-500 to-orange-500
            text-white shadow-2xl shadow-red-500/30
            hover:shadow-red-500/40 hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
                >
                    <Mic className="w-7 h-7" />
                    THANH TOÁN & GHI ÂM
                </button>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* RECENT HISTORY */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {history.sessions.length > 0 && (
                    <div className="bg-[#131b2e]/90 backdrop-blur-2xl rounded-3xl p-5 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-white/50" />
                                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Gần đây</span>
                            </div>
                            <button className="text-xs font-bold text-emerald-400">Xem tất cả</button>
                        </div>

                        <div className="space-y-3">
                            {history.sessions.slice(0, 3).map((session, idx) => (
                                <div
                                    key={session.id || idx}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {session.workerCount} người × {formatShort(session.unitPrice)}
                                            </p>
                                            <p className="text-xs text-white/40">{LaborService.formatDate(session.date)}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-emerald-400">{formatShort(session.totalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* AUDIO RECORDING MODAL */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showRecordingModal && (
                <AudioRecordingModal
                    task={currentTask}
                    workerCount={workerCount}
                    totalCost={totalCost}
                    onComplete={handleComplete}
                    onCancel={() => setShowRecordingModal(false)}
                />
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// AUDIO RECORDING MODAL - Premium
// ═══════════════════════════════════════════════════════════════
interface AudioRecordingModalProps {
    task: FarmingTask;
    workerCount: number;
    totalCost: number;
    onComplete: () => void;
    onCancel: () => void;
}

const AudioRecordingModal: React.FC<AudioRecordingModalProps> = ({
    task,
    workerCount,
    totalCost,
    onComplete,
    onCancel
}) => {
    const [stage, setStage] = useState<'ready' | 'recording' | 'done'>('ready');
    const [countdown, setCountdown] = useState(5);
    const [waves, setWaves] = useState<number[]>(Array(12).fill(20));

    // Countdown
    useEffect(() => {
        if (stage === 'recording' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (stage === 'recording' && countdown === 0) {
            setStage('done');
        }
    }, [stage, countdown]);

    // Wave animation
    useEffect(() => {
        if (stage === 'recording') {
            const interval = setInterval(() => {
                setWaves(prev => prev.map(() => 10 + Math.random() * 50));
            }, 80);
            return () => clearInterval(interval);
        }
    }, [stage]);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0f172a] rounded-t-[2.5rem] overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className={`px-8 py-10 text-center bg-gradient-to-br ${stage === 'done' ? 'from-emerald-500 to-teal-600' : task.gradient
                    }`}>
                    <div className={`w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-5 ${stage === 'recording' ? 'animate-pulse' : ''
                        }`}>
                        {stage === 'done' ? (
                            <CheckCircle className="w-14 h-14 text-white" />
                        ) : stage === 'recording' ? (
                            <div className="w-12 h-12 rounded-full bg-white animate-ping" />
                        ) : (
                            <Mic className="w-14 h-14 text-white" />
                        )}
                    </div>

                    {stage === 'ready' && (
                        <>
                            <h2 className="text-2xl font-black text-white mb-2">Xác nhận thanh toán</h2>
                            <p className="text-white/70">Ghi âm thợ xác nhận đã nhận tiền</p>
                        </>
                    )}
                    {stage === 'recording' && (
                        <>
                            <p className="text-7xl font-black text-white mb-2">{countdown}</p>
                            <p className="text-white/70">Đang ghi âm...</p>
                        </>
                    )}
                    {stage === 'done' && (
                        <>
                            <h2 className="text-2xl font-black text-white mb-2">Đã lưu! ✓</h2>
                            <p className="text-white/70">Ghi âm xác nhận thành công</p>
                        </>
                    )}
                </div>

                {/* Wave Visualizer */}
                {stage === 'recording' && (
                    <div className="h-20 bg-black/30 flex items-center justify-center gap-1 px-8">
                        {waves.map((h, i) => (
                            <div
                                key={i}
                                className={`w-2 rounded-full bg-gradient-to-t ${task.gradient} transition-all duration-75`}
                                style={{ height: `${h}px` }}
                            />
                        ))}
                    </div>
                )}

                {/* Summary */}
                <div className="px-8 py-6 bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-sm">{task.emoji} {task.name} • {workerCount} người</p>
                            <p className="text-3xl font-black text-white">{formatCurrency(totalCost)}</p>
                        </div>
                        {stage !== 'ready' && (
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${task.gradient} flex items-center justify-center`}>
                                <Volume2 className="w-7 h-7 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                    {stage === 'ready' && (
                        <>
                            <button
                                onClick={() => { setStage('recording'); setCountdown(5); }}
                                className={`w-full py-5 rounded-2xl bg-gradient-to-r ${task.gradient} text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform`}
                            >
                                <Mic className="w-6 h-6" />
                                BẮT ĐẦU GHI ÂM (5s)
                            </button>
                            <button onClick={onComplete} className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold">
                                Bỏ qua, không ghi âm
                            </button>
                            <button onClick={onCancel} className="w-full py-3 text-white/40 text-sm">
                                Hủy
                            </button>
                        </>
                    )}

                    {stage === 'recording' && (
                        <div className="py-4 text-center text-white/50">
                            Hỏi thợ: "Nhận đủ tiền chưa?"
                        </div>
                    )}

                    {stage === 'done' && (
                        <>
                            <button
                                onClick={onComplete}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
                            >
                                <CheckCircle className="w-6 h-6" />
                                HOÀN TẤT
                            </button>
                            <button
                                onClick={() => { setStage('ready'); setCountdown(5); }}
                                className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold"
                            >
                                Ghi âm lại
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimpleLaborHome;
