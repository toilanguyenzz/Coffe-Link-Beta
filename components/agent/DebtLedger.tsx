/**
 * DebtLedger.tsx
 * Sổ Nợ tab - Debt management for Agent
 * Shows farmer balances and allows adding new debts
 */

import React, { useState } from 'react';
import {
    Book,
    Search,
    Plus,
    TrendingUp,
    TrendingDown,
    User,
    Phone,
    X,
    Send,
    MessageSquare,
    Filter,
    ChevronRight
} from 'lucide-react';
import {
    FarmerBalance,
    formatBalance,
    formatFullCurrency,
    DebtCategory,
    DEBT_CATEGORY_LABELS
} from '../../types/LedgerTypes';

// Mock farmer balances
const MOCK_BALANCES: FarmerBalance[] = [
    {
        farmerId: 'farmer_1',
        farmerName: 'Nguyễn Văn Hùng',
        farmerPhone: '0359123456',
        balance: 5000000,
        totalDebt: 8000000,
        totalCredit: 3000000,
        lastTransactionDate: new Date(Date.now() - 86400000),
        transactionCount: 15,
    },
    {
        farmerId: 'farmer_2',
        farmerName: 'Trần Thị Lan',
        farmerPhone: '0987654321',
        balance: -2000000,
        totalDebt: 1000000,
        totalCredit: 3000000,
        lastTransactionDate: new Date(Date.now() - 172800000),
        transactionCount: 8,
    },
    {
        farmerId: 'farmer_3',
        farmerName: 'Lê Văn Tâm',
        farmerPhone: '0912345678',
        balance: 0,
        totalDebt: 5000000,
        totalCredit: 5000000,
        lastTransactionDate: new Date(Date.now() - 604800000),
        transactionCount: 12,
    },
    {
        farmerId: 'farmer_4',
        farmerName: 'Phạm Thị Hoa',
        farmerPhone: '0778899001',
        balance: 3500000,
        totalDebt: 3500000,
        totalCredit: 0,
        lastTransactionDate: new Date(Date.now() - 259200000),
        transactionCount: 3,
    },
];

type FilterType = 'all' | 'debt' | 'credit' | 'zero';

const DebtLedger: React.FC = () => {
    const [balances] = useState<FarmerBalance[]>(MOCK_BALANCES);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Add debt modal state
    const [selectedFarmer, setSelectedFarmer] = useState<FarmerBalance | null>(null);
    const [debtCategory, setDebtCategory] = useState<DebtCategory>('FERTILIZER');
    const [debtAmount, setDebtAmount] = useState('');
    const [debtNote, setDebtNote] = useState('');
    const [sendNotification, setSendNotification] = useState(true);

    // Calculate totals
    const totalReceivable = balances.reduce((sum, b) => sum + Math.max(0, b.balance), 0);
    const totalPayable = balances.reduce((sum, b) => sum + Math.abs(Math.min(0, b.balance)), 0);

    // Filter balances
    const filteredBalances = balances
        .filter(b => {
            if (filter === 'debt') return b.balance > 0;
            if (filter === 'credit') return b.balance < 0;
            if (filter === 'zero') return b.balance === 0;
            return true;
        })
        .filter(b =>
            b.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.farmerPhone?.includes(searchQuery)
        );

    // Handle add debt
    const handleAddDebt = () => {
        if (!selectedFarmer || !debtAmount) return;

        alert(`✅ Đã ghi nợ ${formatFullCurrency(parseInt(debtAmount))} cho ${selectedFarmer.farmerName}\n${sendNotification ? '📱 Đã gửi thông báo Zalo/SMS' : ''}`);

        setShowAddModal(false);
        setSelectedFarmer(null);
        setDebtAmount('');
        setDebtNote('');
    };

    return (
        <div className="mt-4 space-y-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* SUMMARY CARDS */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-3">
                <div
                    className="p-4 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-white/60 text-xs">Phải thu</span>
                    </div>
                    <p className="text-red-400 text-xl font-bold">{formatFullCurrency(totalReceivable)}</p>
                </div>

                <div
                    className="p-4 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        <span className="text-white/60 text-xs">Phải trả</span>
                    </div>
                    <p className="text-green-400 text-xl font-bold">{formatFullCurrency(totalPayable)}</p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* SEARCH & FILTER */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm nông dân..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-emerald-400"
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 rounded-xl bg-emerald-500 text-white flex items-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Ghi nợ
                </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                    { id: 'all' as FilterType, label: 'Tất cả' },
                    { id: 'debt' as FilterType, label: 'Còn nợ' },
                    { id: 'credit' as FilterType, label: 'Dư tiền' },
                    { id: 'zero' as FilterType, label: 'Hết nợ' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 text-white/60'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* FARMER LIST */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-3">
                {filteredBalances.map((farmer) => {
                    const { text: balanceText, color: balanceColor } = formatBalance(farmer.balance);

                    return (
                        <div
                            key={farmer.farmerId}
                            className="p-4 rounded-xl transition-all active:scale-[0.99]"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{farmer.farmerName}</h4>
                                        <div className="flex items-center gap-1 text-white/40 text-sm">
                                            <Phone className="w-3 h-3" />
                                            {farmer.farmerPhone}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p
                                        className="font-bold text-lg"
                                        style={{ color: balanceColor }}
                                    >
                                        {balanceText}
                                    </p>
                                    <p className="text-white/40 text-xs">
                                        {farmer.transactionCount} giao dịch
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => {
                                        setSelectedFarmer(farmer);
                                        setShowAddModal(true);
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-white/10 text-white/80 text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ghi nợ
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-center gap-1">
                                    Chi tiết
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredBalances.length === 0 && (
                    <div className="text-center py-12">
                        <Book className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50">Không tìm thấy nông dân nào</p>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ADD DEBT MODAL */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="w-full max-w-md bg-gray-900 rounded-t-3xl p-6 space-y-5 animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">Ghi nợ mới</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-full hover:bg-white/10"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Select Farmer */}
                        {!selectedFarmer ? (
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Chọn nông dân</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {balances.map((farmer) => (
                                        <button
                                            key={farmer.farmerId}
                                            onClick={() => setSelectedFarmer(farmer)}
                                            className="w-full p-3 rounded-xl bg-white/10 text-left flex items-center justify-between hover:bg-white/15"
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-emerald-400" />
                                                <span className="text-white">{farmer.farmerName}</span>
                                            </div>
                                            <span className="text-white/40 text-sm">{farmer.farmerPhone}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Selected Farmer */}
                                <div className="p-3 rounded-xl bg-emerald-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-emerald-400" />
                                        <span className="text-white font-medium">{selectedFarmer.farmerName}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFarmer(null)}
                                        className="text-white/40 text-sm"
                                    >
                                        Đổi
                                    </button>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Loại nợ</label>
                                    <div className="flex gap-2">
                                        {(['FERTILIZER', 'CASH', 'PESTICIDE', 'OTHER'] as DebtCategory[]).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setDebtCategory(cat)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${debtCategory === cat
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-white/10 text-white/60'
                                                    }`}
                                            >
                                                {DEBT_CATEGORY_LABELS[cat]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Số tiền (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={debtAmount}
                                        onChange={(e) => setDebtAmount(e.target.value)}
                                        placeholder="VD: 5000000"
                                        className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-xl font-bold placeholder:text-white/30 outline-none focus:border-emerald-400"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Ghi chú (tùy chọn)</label>
                                    <input
                                        type="text"
                                        value={debtNote}
                                        onChange={(e) => setDebtNote(e.target.value)}
                                        placeholder="VD: 5 bao phân NPK"
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none"
                                    />
                                </div>

                                {/* Notification Toggle */}
                                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sendNotification}
                                        onChange={(e) => setSendNotification(e.target.checked)}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">Gửi thông báo</p>
                                        <p className="text-white/40 text-sm">Thông báo qua Zalo/SMS cho nông dân</p>
                                    </div>
                                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                                </label>

                                {/* Submit Button */}
                                <button
                                    onClick={handleAddDebt}
                                    disabled={!debtAmount}
                                    className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                    Ghi nợ
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtLedger;
