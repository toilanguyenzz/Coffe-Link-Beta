/**
 * NewSession.tsx - Create New Work Session
 * Simple form: Worker count + Unit price
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Users,
    DollarSign,
    Minus,
    Plus,
    Check
} from 'lucide-react';
import * as LaborService from '../../services/SimpleLaborService';

const QUICK_PRICES = [200000, 250000, 280000, 300000];

const NewSession: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [workerCount, setWorkerCount] = useState(5);
    const [unitPrice, setUnitPrice] = useState(250000);

    // Handlers
    const handleWorkerChange = (delta: number) => {
        setWorkerCount(Math.max(1, Math.min(50, workerCount + delta)));
    };

    const handleCreate = () => {
        LaborService.createNewSession(workerCount, unitPrice);
        navigate('/labor-lite');
    };

    const total = workerCount * unitPrice;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            {/* Header */}
            <div className="px-6 pt-14 pb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/labor-lite')}
                        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white">Tạo đội hình</h1>
                        <p className="text-white/60">Hôm nay {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-6">
                {/* Worker Count */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Số thợ hôm nay</p>
                            <p className="text-sm text-white/50">Bao nhiêu người làm?</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={() => handleWorkerChange(-1)}
                            className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Minus className="w-8 h-8 text-white" />
                        </button>

                        <div className="text-center min-w-[100px]">
                            <p className="text-7xl font-black text-white">{workerCount}</p>
                            <p className="text-white/40 mt-1">người</p>
                        </div>

                        <button
                            onClick={() => handleWorkerChange(1)}
                            className="w-16 h-16 rounded-2xl bg-emerald-500/30 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Plus className="w-8 h-8 text-emerald-400" />
                        </button>
                    </div>
                </div>

                {/* Unit Price */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Đơn giá</p>
                            <p className="text-sm text-white/50">Mỗi người được bao nhiêu?</p>
                        </div>
                    </div>

                    {/* Quick Prices */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {QUICK_PRICES.map((price) => (
                            <button
                                key={price}
                                onClick={() => setUnitPrice(price)}
                                className={`py-3 rounded-xl font-bold text-sm transition-all ${unitPrice === price
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                {(price / 1000).toFixed(0)}k
                            </button>
                        ))}
                    </div>

                    {/* Custom Price Input */}
                    <input
                        type="number"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(Math.max(100000, parseInt(e.target.value) || 250000))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-2xl font-bold text-white text-center outline-none focus:border-amber-500"
                    />
                </div>

                {/* Total Preview */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 text-center">
                    <p className="text-white/60 text-sm mb-2">Dự tính tổng</p>
                    <p className="text-4xl font-black text-white">
                        {workerCount} × {LaborService.formatMoney(unitPrice)} =
                    </p>
                    <p className="text-5xl font-black text-emerald-400 mt-2">
                        {LaborService.formatMoney(total)}
                    </p>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    className="w-full py-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform"
                >
                    <Check className="w-7 h-7" />
                    BẮT ĐẦU NGÀY LÀM VIỆC
                </button>
            </div>
        </div>
    );
};

export default NewSession;
