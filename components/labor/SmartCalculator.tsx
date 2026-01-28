/**
 * SmartCalculator.tsx - Screen 2: Máy Tính Thông Minh
 * Tính tiền công với hệ số dốc, trừ tiền ứng tự động
 * Logic: Total = (Price * Quantity * Slope) - Advances
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator,
    ChevronLeft,
    Mountain,
    Users,
    Minus,
    Plus,
    ArrowRight,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Info
} from 'lucide-react';
import * as LaborManager from '../../services/LaborManagerService';

interface SmartCalculatorProps {
    jobId?: string;
    onComplete?: (result: CalculationResult) => void;
}

interface CalculationResult {
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

const SmartCalculator: React.FC<SmartCalculatorProps> = ({ jobId, onComplete }) => {
    const navigate = useNavigate();

    // ========== STATE ==========
    const [jobType, setJobType] = useState<'contract' | 'daily'>('daily');
    const [quantity, setQuantity] = useState<number>(0);
    const [pricePerUnit, setPricePerUnit] = useState<number>(250000);
    const [slopeFactor, setSlopeFactor] = useState<number>(1.0);
    const [qualityFactor, setQualityFactor] = useState<number>(1.0);
    const [bonus, setBonus] = useState<number>(0);
    const [currentJob, setCurrentJob] = useState<LaborManager.LaborJob | null>(null);
    const [advances, setAdvances] = useState<LaborManager.Advance[]>([]);

    // ========== LOAD DATA ==========
    useEffect(() => {
        // Load current job
        const job = LaborManager.getCurrentJob();
        if (job) {
            setCurrentJob(job);
            setJobType(job.jobType);
            setPricePerUnit(job.pricePerUnit);
            setSlopeFactor(job.slopeFactor);
            setQualityFactor(job.qualityFactor);
        }

        // Load advances
        const jobAdvances = LaborManager.getAdvances(jobId || job?.id);
        setAdvances(jobAdvances);

        // Set default price based on job type
        if (!job) {
            const suggested = LaborManager.getSuggestedPrice('chu_pah');
            setPricePerUnit(jobType === 'daily' ? suggested.daily : suggested.contract);
        }
    }, [jobId]);

    // Update price when job type changes
    useEffect(() => {
        const suggested = LaborManager.getSuggestedPrice('chu_pah');
        setPricePerUnit(jobType === 'daily' ? suggested.daily : suggested.contract);
    }, [jobType]);

    // ========== CALCULATIONS ==========
    const totalAdvances = useMemo(() => {
        return advances.reduce((sum, a) => sum + a.amount, 0);
    }, [advances]);

    const calculation = useMemo(() => {
        return LaborManager.calculatePayment({
            jobType,
            quantity,
            pricePerUnit,
            slopeFactor,
            qualityFactor,
            totalAdvances,
            bonus
        });
    }, [jobType, quantity, pricePerUnit, slopeFactor, qualityFactor, totalAdvances, bonus]);

    // ========== HANDLERS ==========
    const handleQuantityChange = (delta: number) => {
        const newValue = Math.max(0, quantity + delta);
        setQuantity(newValue);
    };

    const handleContinue = () => {
        const result: CalculationResult = {
            jobType,
            quantity,
            pricePerUnit,
            slopeFactor,
            qualityFactor,
            grossAmount: calculation.grossAmount,
            totalAdvances,
            netAmount: calculation.netAmount,
            breakdown: calculation.breakdown
        };

        if (onComplete) {
            onComplete(result);
        } else {
            // Navigate to receipt screen with data
            navigate('/labor/receipt', { state: result });
        }
    };

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-8">
            {/* Header */}
            <div className="px-5 pt-12 pb-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white">Máy Tính Thông Minh</h1>
                        <p className="text-sm text-white/60">Tính tiền công chính xác</p>
                    </div>
                </div>
            </div>

            <div className="px-5 space-y-6">
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION A: JOB TYPE TOGGLE */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Calculator className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-white/80 uppercase tracking-wide">Loại hình</span>
                    </div>

                    <div className="flex gap-3">
                        {[
                            { id: 'daily', label: 'Công Nhật', emoji: '📅', desc: 'Tính theo ngày' },
                            { id: 'contract', label: 'Khoán Sản Phẩm', emoji: '⚖️', desc: 'Tính theo kg' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setJobType(type.id as 'contract' | 'daily')}
                                className={`flex-1 p-4 rounded-2xl border-2 transition-all ${jobType === type.id
                                        ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                        : 'bg-white/5 border-transparent hover:border-white/20'
                                    }`}
                            >
                                <span className="text-2xl mb-2 block">{type.emoji}</span>
                                <p className={`text-sm font-bold ${jobType === type.id ? 'text-emerald-400' : 'text-white'}`}>
                                    {type.label}
                                </p>
                                <p className="text-xs text-white/50 mt-1">{type.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION B: QUANTITY INPUT */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-white/80 uppercase tracking-wide">
                            {jobType === 'daily' ? 'Số ngày làm' : 'Số lượng (kg)'}
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">
                            {pricePerUnit.toLocaleString()}đ/{jobType === 'daily' ? 'ngày' : 'kg'}
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={() => handleQuantityChange(jobType === 'daily' ? -1 : -10)}
                            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Minus className="w-6 h-6 text-white" />
                        </button>

                        <div className="text-center min-w-[120px]">
                            <input
                                type="number"
                                value={quantity || ''}
                                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full text-5xl font-black text-white text-center bg-transparent outline-none"
                                placeholder="0"
                            />
                            <p className="text-sm text-white/50 mt-1">
                                {jobType === 'daily' ? 'ngày' : 'kg'}
                            </p>
                        </div>

                        <button
                            onClick={() => handleQuantityChange(jobType === 'daily' ? 1 : 10)}
                            className="w-14 h-14 rounded-2xl bg-emerald-500/30 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Plus className="w-6 h-6 text-emerald-400" />
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION C: SMART VARIABLES */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-bold text-white/80 uppercase tracking-wide">Biến số thông minh</span>
                    </div>

                    {/* Slope Factor */}
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Mountain className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Hệ số địa hình</p>
                                <p className="text-xs text-white/50">
                                    {slopeFactor > 1.0 ? 'Đất dốc +10%' : 'Đất bằng phẳng'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[
                                { value: 1.0, label: 'Bằng', color: 'bg-slate-600' },
                                { value: 1.1, label: 'Dốc +10%', color: 'bg-amber-500' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSlopeFactor(option.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${slopeFactor === option.value
                                            ? `${option.color} text-white shadow-lg`
                                            : 'bg-white/10 text-white/60'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality Factor */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Chất lượng hái</p>
                                <p className="text-xs text-white/50">
                                    {qualityFactor < 1.0 ? `Trừ ${((1 - qualityFactor) * 100).toFixed(0)}%` : 'Hái sạch, chuẩn'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[
                                { value: 1.0, label: 'Sạch', color: 'bg-emerald-500' },
                                { value: 0.95, label: '-5%', color: 'bg-orange-500' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setQualityFactor(option.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${qualityFactor === option.value
                                            ? `${option.color} text-white shadow-lg`
                                            : 'bg-white/10 text-white/60'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION D: ADVANCES DEDUCTION */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {totalAdvances > 0 && (
                    <div className="bg-red-500/10 backdrop-blur-xl rounded-3xl p-5 border border-red-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-400">Tiền đã ứng</p>
                                    <p className="text-xs text-white/50">{advances.length} lần ứng</p>
                                </div>
                            </div>
                            <p className="text-2xl font-black text-red-400">
                                -{totalAdvances.toLocaleString()}đ
                            </p>
                        </div>

                        {/* Advance details */}
                        <div className="mt-4 space-y-2">
                            {advances.slice(0, 3).map((adv) => (
                                <div key={adv.id} className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">
                                        {LaborManager.ADVANCE_REASONS.find(r => r.value === adv.reason)?.emoji} {adv.reasonLabel}
                                    </span>
                                    <span className="text-red-300">-{adv.amount.toLocaleString()}đ</span>
                                </div>
                            ))}
                            {advances.length > 3 && (
                                <p className="text-xs text-white/40 text-center">+{advances.length - 3} khoản khác</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SECTION E: CALCULATION RESULT */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30">
                    {/* Breakdown */}
                    <div className="space-y-2 mb-6">
                        {calculation.breakdown.map((line, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-white/70">{line.split(':')[0] || line.split('=')[0]}</span>
                                <span className={`font-bold ${line.includes('-') && !line.includes('=') ? 'text-red-400' :
                                        line.includes('+') ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                    {line.split(':')[1] || line.split('=')[1] || ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-dashed border-white/20 my-4" />

                    {/* Net Amount */}
                    <div className="text-center">
                        <p className="text-sm font-bold text-white/60 uppercase tracking-wide mb-2">
                            💰 THỰC LĨNH
                        </p>
                        <p className={`text-5xl font-black ${calculation.netAmount >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {calculation.netAmount.toLocaleString()}
                            <span className="text-2xl">đ</span>
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* ACTION BUTTONS */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={() => navigate('/labor/advances')}
                        className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        Sổ Ứng Tiền
                    </button>

                    <button
                        onClick={handleContinue}
                        disabled={quantity === 0}
                        className={`flex-[2] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${quantity > 0
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                    >
                        Xuất Hóa Đơn
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartCalculator;
