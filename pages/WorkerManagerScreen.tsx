/**
 * WorkerManagerScreen.tsx - Smart Worker Manager
 * "Lazy Farmer" Flow: One-Screen Calculator with Audio Proof
 * Optimized for elderly farmers - Big fonts, high contrast, minimal typing
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
    Volume2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════════════════════
interface FarmingTask {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
}

interface WorkSession {
    id: string;
    date: string;
    taskType: FarmingTask;
    workerCount: number;
    unitPrice: number;
    totalCost: number;
    audioProofUri?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const FARMING_TASKS: FarmingTask[] = [
    {
        id: 'harvest',
        name: 'Hái Cà',
        icon: Cherry,
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500'
    },
    {
        id: 'water',
        name: 'Tưới Nước',
        icon: Droplets,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500'
    },
    {
        id: 'weed',
        name: 'Làm Cỏ',
        icon: Leaf,
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500'
    },
    {
        id: 'other',
        name: 'Khác',
        icon: Wrench,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500'
    }
];

const STORAGE_KEY = 'worker_sessions';
const DEFAULT_PRICE = 250000;
const DEFAULT_WORKERS = 5;

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(amount) + ' đ';
};

const getLastPrice = (): number => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const sessions: WorkSession[] = JSON.parse(data);
            if (sessions.length > 0) {
                return sessions[0].unitPrice;
            }
        }
    } catch (e) {
        console.error('Error reading last price:', e);
    }
    return DEFAULT_PRICE;
};

const saveSession = (session: WorkSession): void => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const sessions: WorkSession[] = data ? JSON.parse(data) : [];
        sessions.unshift(session);
        // Keep only last 100 sessions
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 100)));
    } catch (e) {
        console.error('Error saving session:', e);
    }
};

const getHistory = (): WorkSession[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const WorkerManagerScreen: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [currentTask, setCurrentTask] = useState<FarmingTask>(FARMING_TASKS[0]);
    const [workerCount, setWorkerCount] = useState(DEFAULT_WORKERS);
    const [unitPrice, setUnitPrice] = useState(getLastPrice());
    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<WorkSession[]>([]);

    // Load history on mount
    useEffect(() => {
        setHistory(getHistory());
    }, []);

    // Calculate total
    const totalCost = useMemo(() => {
        return workerCount * unitPrice;
    }, [workerCount, unitPrice]);

    // Handlers
    const handleWorkerChange = (delta: number) => {
        setWorkerCount(Math.max(1, Math.min(99, workerCount + delta)));
    };

    const handlePayment = () => {
        setShowRecordingModal(true);
    };

    const handleRecordingComplete = (audioUri?: string) => {
        const session: WorkSession = {
            id: `session_${Date.now()}`,
            date: new Date().toISOString(),
            taskType: currentTask,
            workerCount,
            unitPrice,
            totalCost,
            audioProofUri: audioUri
        };

        saveSession(session);
        setHistory(getHistory());
        setShowRecordingModal(false);

        // Reset to defaults for next session
        setWorkerCount(DEFAULT_WORKERS);
    };

    // Quick price buttons
    const quickPrices = [200000, 250000, 280000, 300000];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HEADER */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="px-5 pt-12 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white">NHẬT KÝ THUÊ THỢ</h1>
                            <p className="text-white/50 text-sm">Chấm công đơn giản</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <History className="w-5 h-5 text-white/70" />
                    </button>
                </div>
            </div>

            <div className="px-5 pb-8 space-y-6">
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION A: TASK MENU */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                        Chọn công việc
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                        {FARMING_TASKS.map((task) => {
                            const Icon = task.icon;
                            const isSelected = currentTask.id === task.id;
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => setCurrentTask(task)}
                                    className={`
                    aspect-square rounded-2xl flex flex-col items-center justify-center gap-2
                    border-2 transition-all duration-200 active:scale-95
                    ${isSelected
                                            ? `${task.bgColor} ${task.borderColor} shadow-lg`
                                            : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }
                  `}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${task.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${task.color}`} />
                                    </div>
                                    <span className={`text-xs font-bold ${isSelected ? task.color : 'text-white/60'}`}>
                                        {task.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION B: THE CALCULATOR */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-6">
                    {/* Worker Count */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">Số lượng thợ</p>
                                <p className="text-white/40 text-sm">Bao nhiêu người làm?</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={() => handleWorkerChange(-1)}
                                className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <Minus className="w-8 h-8 text-white" />
                            </button>

                            <div className="text-center min-w-[100px]">
                                <p className="text-7xl font-black text-white">{workerCount}</p>
                                <p className="text-white/40 text-sm mt-1">người</p>
                            </div>

                            <button
                                onClick={() => handleWorkerChange(1)}
                                className="w-16 h-16 rounded-2xl bg-emerald-500/30 flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <Plus className="w-8 h-8 text-emerald-400" />
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10" />

                    {/* Unit Price */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">Giá công hôm nay</p>
                                <p className="text-white/40 text-sm">Bao nhiêu tiền/người?</p>
                            </div>
                        </div>

                        {/* Quick Price Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {quickPrices.map((price) => (
                                <button
                                    key={price}
                                    onClick={() => setUnitPrice(price)}
                                    className={`
                    py-3 rounded-xl font-bold text-sm transition-all
                    ${unitPrice === price
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }
                  `}
                                >
                                    {(price / 1000)}k
                                </button>
                            ))}
                        </div>

                        {/* Custom Price Input */}
                        <input
                            type="number"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-3xl font-black text-white text-center outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TOTAL DISPLAY - THE BIG NUMBER */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className={`rounded-3xl p-8 text-center ${currentTask.bgColor} border-2 ${currentTask.borderColor}`}>
                    <p className="text-white/70 font-bold text-sm uppercase tracking-wider mb-2">
                        💰 TỔNG TIỀN
                    </p>
                    <p className="text-5xl md:text-6xl font-black text-white">
                        {formatCurrency(totalCost)}
                    </p>
                    <p className="text-white/50 text-sm mt-3">
                        {workerCount} người × {formatCurrency(unitPrice)}
                    </p>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION C: ACTION BUTTON */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <button
                    onClick={handlePayment}
                    disabled={workerCount === 0 || unitPrice === 0}
                    className={`
            w-full py-6 rounded-3xl font-black text-xl
            flex items-center justify-center gap-3
            transition-all active:scale-[0.98]
            ${workerCount > 0 && unitPrice > 0
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl shadow-red-500/30'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }
          `}
                >
                    <Mic className="w-7 h-7" />
                    THANH TOÁN & GHI ÂM
                </button>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* HISTORY SECTION (Collapsible) */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {showHistory && history.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                            Lịch sử gần đây
                        </p>
                        {history.slice(0, 5).map((session) => {
                            const task = FARMING_TASKS.find(t => t.id === session.taskType.id) || FARMING_TASKS[3];
                            const TaskIcon = task.icon;
                            return (
                                <div
                                    key={session.id}
                                    className="bg-white/5 rounded-2xl p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${task.bgColor} flex items-center justify-center`}>
                                            <TaskIcon className={`w-5 h-5 ${task.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">
                                                {session.workerCount} người × {formatCurrency(session.unitPrice)}
                                            </p>
                                            <p className="text-xs text-white/40">
                                                {new Date(session.date).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-400">{formatCurrency(session.totalCost)}</p>
                                        {session.audioProofUri && (
                                            <p className="text-xs text-white/40">🎙️ Có ghi âm</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* PAYMENT CONFIRMATION MODAL (Audio Recording) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showRecordingModal && (
                <PaymentConfirmationModal
                    totalCost={totalCost}
                    taskName={currentTask.name}
                    workerCount={workerCount}
                    onComplete={handleRecordingComplete}
                    onCancel={() => setShowRecordingModal(false)}
                />
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// PAYMENT CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════
interface PaymentConfirmationModalProps {
    totalCost: number;
    taskName: string;
    workerCount: number;
    onComplete: (audioUri?: string) => void;
    onCancel: () => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    totalCost,
    taskName,
    workerCount,
    onComplete,
    onCancel
}) => {
    const [stage, setStage] = useState<'ready' | 'recording' | 'done'>('ready');
    const [countdown, setCountdown] = useState(5);
    const [waveHeights, setWaveHeights] = useState<number[]>([20, 30, 25, 35, 20, 40, 25, 30, 20, 35]);

    // Recording countdown
    useEffect(() => {
        if (stage === 'recording' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (stage === 'recording' && countdown === 0) {
            setStage('done');
        }
    }, [stage, countdown]);

    // Animate wave heights during recording
    useEffect(() => {
        if (stage === 'recording') {
            const interval = setInterval(() => {
                setWaveHeights(prev => prev.map(() => 15 + Math.random() * 40));
            }, 100);
            return () => clearInterval(interval);
        }
    }, [stage]);

    const handleStartRecording = () => {
        setStage('recording');
        setCountdown(5);
    };

    const handleConfirm = () => {
        const mockAudioUri = `audio_proof_${Date.now()}.m4a`;
        onComplete(mockAudioUri);
    };

    const handleSkip = () => {
        onComplete(undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-800 rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className={`px-6 py-8 text-center ${stage === 'done'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        : stage === 'recording'
                            ? 'bg-gradient-to-br from-red-500 to-orange-500'
                            : 'bg-gradient-to-br from-amber-500 to-orange-500'
                    }`}>
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        {stage === 'done' ? (
                            <CheckCircle className="w-12 h-12 text-white" />
                        ) : stage === 'recording' ? (
                            <div className="w-12 h-12 rounded-full bg-white animate-pulse" />
                        ) : (
                            <Mic className="w-12 h-12 text-white" />
                        )}
                    </div>

                    {stage === 'ready' && (
                        <>
                            <h2 className="text-2xl font-black text-white">Xác nhận thanh toán</h2>
                            <p className="text-white/80 mt-2">Ghi âm thợ xác nhận đã nhận tiền</p>
                        </>
                    )}

                    {stage === 'recording' && (
                        <>
                            <h2 className="text-2xl font-black text-white">Đang ghi âm...</h2>
                            <p className="text-6xl font-black text-white mt-4">{countdown}s</p>
                            <p className="text-white/80 mt-2">Hỏi thợ: "Nhận đủ tiền chưa?"</p>
                        </>
                    )}

                    {stage === 'done' && (
                        <>
                            <h2 className="text-2xl font-black text-white">Đã Lưu!</h2>
                            <p className="text-white/80 mt-2">Ghi âm xác nhận đã được lưu</p>
                        </>
                    )}
                </div>

                {/* Wave Visualization (during recording) */}
                {stage === 'recording' && (
                    <div className="h-16 bg-slate-700/50 flex items-center justify-center gap-1 px-8">
                        {waveHeights.map((height, i) => (
                            <div
                                key={i}
                                className="w-2 bg-red-500 rounded-full transition-all duration-100"
                                style={{ height: `${height}px` }}
                            />
                        ))}
                    </div>
                )}

                {/* Summary */}
                <div className="px-6 py-5 bg-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/60 text-sm">{taskName} • {workerCount} người</p>
                            <p className="text-3xl font-black text-white">{formatCurrency(totalCost)}</p>
                        </div>
                        {stage !== 'ready' && (
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Volume2 className="w-6 h-6 text-emerald-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                    {stage === 'ready' && (
                        <>
                            <button
                                onClick={handleStartRecording}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
                            >
                                <Mic className="w-6 h-6" />
                                BẮT ĐẦU GHI ÂM (5 giây)
                            </button>
                            <button
                                onClick={handleSkip}
                                className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold"
                            >
                                Bỏ qua, không ghi âm
                            </button>
                        </>
                    )}

                    {stage === 'recording' && (
                        <div className="h-14 flex items-center justify-center text-white/60">
                            Đang ghi âm xác nhận từ thợ...
                        </div>
                    )}

                    {stage === 'done' && (
                        <>
                            <button
                                onClick={handleConfirm}
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

                    {stage === 'ready' && (
                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-white/40 text-sm"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerManagerScreen;
