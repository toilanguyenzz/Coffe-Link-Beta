/**
 * AdvanceLog.tsx - Screen 1: Sổ Ứng Tiền
 * Quản lý tiền ứng cho thợ - Save to LocalStorage
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    X,
    Wallet,
    User,
    Phone,
    Camera,
    CheckCircle,
    Trash2,
    Calculator,
    AlertCircle
} from 'lucide-react';
import * as LaborManager from '../../services/LaborManagerService';

const AdvanceLog: React.FC = () => {
    const navigate = useNavigate();

    // ========== STATE ==========
    const [workers, setWorkers] = useState<LaborManager.Worker[]>([]);
    const [advances, setAdvances] = useState<LaborManager.Advance[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<LaborManager.Worker | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentJob, setCurrentJob] = useState<LaborManager.LaborJob | null>(null);

    // Modal state
    const [amount, setAmount] = useState<number>(0);
    const [reason, setReason] = useState<LaborManager.Advance['reason']>('phone_card');
    const [saving, setSaving] = useState(false);

    // ========== LOAD DATA ==========
    useEffect(() => {
        // Load current job
        let job = LaborManager.getCurrentJob();

        // Create demo job if none exists
        if (!job) {
            job = LaborManager.createJob({
                farmerId: 'demo_farmer',
                farmerName: 'Anh Minh',
                title: 'Hái cà phê vụ 2026',
                jobType: 'contract',
                pricePerUnit: 800,
                unit: 'kg',
                slopeFactor: 1.0,
                qualityFactor: 1.0,
                workersNeeded: 5,
                totalQuantity: 0,
                startDate: new Date().toISOString().split('T')[0],
                location: { name: 'Vườn Chư Pah' }
            });
        }
        setCurrentJob(job);

        // Load workers (from job or mock)
        if (job.workers.length > 0) {
            setWorkers(job.workers);
        } else {
            // Add mock workers to job
            const mockWorkers = LaborManager.getMockWorkers();
            mockWorkers.forEach(w => LaborManager.addWorkerToJob(w));
            setWorkers(mockWorkers);
        }

        // Load advances
        const jobAdvances = LaborManager.getAdvances(job.id);
        setAdvances(jobAdvances);
    }, []);

    // ========== COMPUTED ==========
    const totalAdvances = useMemo(() => {
        return advances.reduce((sum, a) => sum + a.amount, 0);
    }, [advances]);

    const getWorkerAdvances = (workerId: string) => {
        return advances
            .filter(a => a.workerId === workerId)
            .reduce((sum, a) => sum + a.amount, 0);
    };

    // ========== HANDLERS ==========
    const handleOpenModal = (worker: LaborManager.Worker) => {
        setSelectedWorker(worker);
        setAmount(0);
        setReason('phone_card');
        setShowModal(true);
    };

    const handleSaveAdvance = async () => {
        if (!selectedWorker || !currentJob || amount <= 0) return;

        setSaving(true);

        // Simulate async save
        await new Promise(resolve => setTimeout(resolve, 300));

        const reasonInfo = LaborManager.ADVANCE_REASONS.find(r => r.value === reason);
        const newAdvance = LaborManager.addAdvance({
            workerId: selectedWorker.id,
            workerName: selectedWorker.name,
            amount,
            reason,
            reasonLabel: reasonInfo?.label || 'Khác',
            jobId: currentJob.id
        });

        setAdvances(prev => [...prev, newAdvance]);
        setSaving(false);
        setShowModal(false);
    };

    const handleDeleteAdvance = (advanceId: string) => {
        if (window.confirm('Xóa khoản ứng này?')) {
            LaborManager.removeAdvance(advanceId);
            setAdvances(prev => prev.filter(a => a.id !== advanceId));
        }
    };

    // ========== QUICK AMOUNTS ==========
    const quickAmounts = [100000, 200000, 500000, 1000000];

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-8">
            {/* Header */}
            <div className="px-5 pt-12 pb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-black text-white">Sổ Ứng Tiền</h1>
                        <p className="text-sm text-white/60">{currentJob?.title || 'Đang tải...'}</p>
                    </div>
                    <button
                        onClick={() => navigate('/labor/calculator')}
                        className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    >
                        <Calculator className="w-5 h-5 text-emerald-400" />
                    </button>
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">Tổng tiền đã ứng</p>
                            <p className="text-3xl font-black text-red-400">
                                {totalAdvances.toLocaleString()}đ
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                        {advances.length} lần ứng • {workers.length} thợ
                    </p>
                </div>
            </div>

            {/* Workers List */}
            <div className="px-5 space-y-3">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wide">Danh sách thợ</h3>

                {workers.map((worker) => {
                    const workerTotal = getWorkerAdvances(worker.id);
                    const workerAdvances = advances.filter(a => a.workerId === worker.id);

                    return (
                        <div
                            key={worker.id}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                                    {worker.name.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <p className="font-bold text-white">{worker.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-white/50">
                                        <span>⭐ {worker.rating}</span>
                                        <span>•</span>
                                        <span>{worker.totalJobs} việc</span>
                                    </div>
                                </div>

                                {/* Advance Amount */}
                                <div className="text-right">
                                    {workerTotal > 0 ? (
                                        <p className="text-lg font-black text-red-400">
                                            -{workerTotal.toLocaleString()}đ
                                        </p>
                                    ) : (
                                        <p className="text-sm text-white/40">Chưa ứng</p>
                                    )}
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={() => handleOpenModal(worker)}
                                    className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                                >
                                    <Plus className="w-5 h-5 text-emerald-400" />
                                </button>
                            </div>

                            {/* Advance History */}
                            {workerAdvances.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                    {workerAdvances.map((adv) => {
                                        const reasonInfo = LaborManager.ADVANCE_REASONS.find(r => r.value === adv.reason);
                                        return (
                                            <div key={adv.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span>{reasonInfo?.emoji}</span>
                                                    <span className="text-white/70">{reasonInfo?.label}</span>
                                                    <span className="text-white/40 text-xs">
                                                        {new Date(adv.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-400 font-bold">-{adv.amount.toLocaleString()}đ</span>
                                                    <button
                                                        onClick={() => handleDeleteAdvance(adv.id)}
                                                        className="p-1 rounded hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400/60" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Navigate to Calculator */}
            <div className="fixed bottom-6 left-5 right-5">
                <button
                    onClick={() => navigate('/labor/calculator')}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                    <Calculator className="w-5 h-5" />
                    Tính Tiền Công
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ADD ADVANCE MODAL */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {showModal && selectedWorker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom">
                        {/* Modal Header */}
                        <div className="bg-slate-800 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                    {selectedWorker.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white">Ứng tiền cho {selectedWorker.name}</p>
                                    <p className="text-xs text-white/50">Lưu vào sổ ngay lập tức</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Amount Input */}
                            <div>
                                <label className="text-sm font-bold text-white/60 uppercase tracking-wide block mb-2">
                                    Số tiền
                                </label>
                                <input
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                    placeholder="Nhập số tiền..."
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-2xl font-bold text-white text-center outline-none focus:border-emerald-500"
                                />

                                {/* Quick Amounts */}
                                <div className="flex gap-2 mt-3">
                                    {quickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setAmount(amt)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${amount === amt
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                        >
                                            {(amt / 1000).toFixed(0)}k
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason Selection */}
                            <div>
                                <label className="text-sm font-bold text-white/60 uppercase tracking-wide block mb-2">
                                    Lý do ứng
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {LaborManager.ADVANCE_REASONS.map((r) => (
                                        <button
                                            key={r.value}
                                            onClick={() => setReason(r.value as LaborManager.Advance['reason'])}
                                            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${reason === r.value
                                                ? 'bg-emerald-500/20 border-emerald-500'
                                                : 'bg-white/5 border-transparent hover:border-white/20'
                                                }`}
                                        >
                                            <span className="text-xl">{r.emoji}</span>
                                            <span className={`text-sm font-bold ${reason === r.value ? 'text-emerald-400' : 'text-white/70'}`}>
                                                {r.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Photo Evidence (Optional) */}
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center gap-2 text-white/50 hover:border-white/40">
                                <Camera className="w-5 h-5" />
                                <span className="text-sm font-medium">Chụp ảnh biên nhận (tùy chọn)</span>
                            </button>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveAdvance}
                                disabled={amount <= 0 || saving}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${amount > 0 && !saving
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                                    }`}
                            >
                                {saving ? (
                                    <>Đang lưu...</>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Lưu Ngay ({amount.toLocaleString()}đ)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvanceLog;
