/**
 * InventoryDashboard.tsx
 * Kho hàng tab - Inventory management for Agent
 * Shows stock levels, EUDR breakdown, and sell to Coffee ID flow
 */

import React, { useState } from 'react';
import {
    Warehouse,
    Coffee,
    Leaf,
    Package,
    CheckCircle,
    AlertTriangle,
    Truck,
    Send,
    X,
    Scale,
    Calendar,
    User,
    ChevronRight
} from 'lucide-react';
import { CoffeeType, COFFEE_TYPE_LABELS, InventoryLot } from '../../types/AgentTypes';
import { formatFullCurrency } from '../../types/LedgerTypes';

// Mock inventory data
const MOCK_INVENTORY: InventoryLot[] = [
    {
        id: 'lot_1',
        agentId: 'agent_1',
        purchaseOrderId: 'po_1',
        farmerId: 'farmer_1',
        farmerName: 'Nguyễn Văn Hùng',
        coffeeType: 'BEAN',
        weight: 500,
        qualityGrade: 'A',
        eudrCompliant: true,
        status: 'IN_STOCK',
        createdAt: new Date(Date.now() - 86400000),
    },
    {
        id: 'lot_2',
        agentId: 'agent_1',
        purchaseOrderId: 'po_2',
        farmerId: 'farmer_2',
        farmerName: 'Trần Thị Lan',
        coffeeType: 'BEAN',
        weight: 300,
        qualityGrade: 'B',
        eudrCompliant: false,
        status: 'IN_STOCK',
        createdAt: new Date(Date.now() - 172800000),
    },
    {
        id: 'lot_3',
        agentId: 'agent_1',
        purchaseOrderId: 'po_3',
        farmerId: 'farmer_1',
        farmerName: 'Nguyễn Văn Hùng',
        coffeeType: 'HUSK',
        weight: 1000,
        qualityGrade: 'A',
        eudrCompliant: true,
        status: 'IN_STOCK',
        createdAt: new Date(Date.now() - 259200000),
    },
    {
        id: 'lot_4',
        agentId: 'agent_1',
        purchaseOrderId: 'po_4',
        farmerId: 'farmer_3',
        farmerName: 'Lê Văn Tâm',
        coffeeType: 'FRESH',
        weight: 200,
        qualityGrade: 'A',
        eudrCompliant: true,
        status: 'IN_STOCK',
        createdAt: new Date(Date.now() - 43200000),
    },
];

const InventoryDashboard: React.FC = () => {
    const [inventory] = useState<InventoryLot[]>(MOCK_INVENTORY);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedLots, setSelectedLots] = useState<string[]>([]);

    // Calculate summaries
    const totalWeight = inventory.filter(l => l.status === 'IN_STOCK').reduce((sum, l) => sum + l.weight, 0);
    const eudrWeight = inventory.filter(l => l.status === 'IN_STOCK' && l.eudrCompliant).reduce((sum, l) => sum + l.weight, 0);
    const normalWeight = totalWeight - eudrWeight;

    // Group by coffee type
    const byType = inventory.filter(l => l.status === 'IN_STOCK').reduce((acc, lot) => {
        acc[lot.coffeeType] = (acc[lot.coffeeType] || 0) + lot.weight;
        return acc;
    }, {} as Record<CoffeeType, number>);

    // Get EUDR compliant lots only
    const eudrLots = inventory.filter(l => l.status === 'IN_STOCK' && l.eudrCompliant);
    const selectedTotalWeight = eudrLots.filter(l => selectedLots.includes(l.id)).reduce((sum, l) => sum + l.weight, 0);

    // Toggle lot selection
    const toggleLotSelection = (lotId: string) => {
        setSelectedLots(prev =>
            prev.includes(lotId)
                ? prev.filter(id => id !== lotId)
                : [...prev, lotId]
        );
    };

    // Handle sell
    const handleSell = () => {
        alert(`🚛 Đã tạo lệnh vận chuyển!\n\nTổng: ${selectedTotalWeight}kg\nCoffee ID sẽ liên hệ sắp xếp xe đến chở.`);
        setShowSellModal(false);
        setSelectedLots([]);
    };

    return (
        <div className="mt-4 space-y-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* TOTAL INVENTORY SUMMARY */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div
                className="p-5 rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Warehouse className="w-5 h-5 text-purple-400" />
                    <h2 className="text-white font-bold text-lg">Tổng tồn kho</h2>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black text-white">
                        {(totalWeight / 1000).toFixed(1)}
                    </span>
                    <span className="text-white/50 text-lg">tấn</span>
                </div>

                {/* EUDR Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-white/70 text-xs">Đạt EUDR</span>
                        </div>
                        <p className="text-green-400 font-bold">{(eudrWeight / 1000).toFixed(1)} tấn</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-white/70 text-xs">Hàng thường</span>
                        </div>
                        <p className="text-amber-400 font-bold">{(normalWeight / 1000).toFixed(1)} tấn</p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* BY COFFEE TYPE */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-3 gap-3">
                {(['BEAN', 'FRESH', 'HUSK'] as CoffeeType[]).map((type) => {
                    const weight = byType[type] || 0;
                    const icons = { BEAN: '☕', FRESH: '🍒', HUSK: '🫘' };
                    const colors = {
                        BEAN: 'rgba(139, 69, 19, 0.3)',
                        FRESH: 'rgba(220, 38, 38, 0.2)',
                        HUSK: 'rgba(161, 98, 7, 0.2)'
                    };

                    return (
                        <div
                            key={type}
                            className="p-4 rounded-xl text-center"
                            style={{ background: colors[type] }}
                        >
                            <span className="text-2xl">{icons[type]}</span>
                            <p className="text-white font-bold mt-1">{weight}kg</p>
                            <p className="text-white/50 text-xs">{COFFEE_TYPE_LABELS[type]}</p>
                        </div>
                    );
                })}
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* SELL TO COFFEE ID BUTTON */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {eudrWeight > 0 && (
                <button
                    onClick={() => setShowSellModal(true)}
                    className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                    }}
                >
                    <Truck className="w-5 h-5" />
                    XUẤT BÁN CHO COFFEE ID
                </button>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* INVENTORY LOTS LIST */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-white/60" />
                    Danh sách lô hàng
                </h3>

                <div className="space-y-3">
                    {inventory.filter(l => l.status === 'IN_STOCK').map((lot) => (
                        <div
                            key={lot.id}
                            className="p-4 rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                                border: lot.eudrCompliant
                                    ? '1px solid rgba(34, 197, 94, 0.3)'
                                    : '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {lot.eudrCompliant ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    )}
                                    <span className="text-white font-medium">
                                        {COFFEE_TYPE_LABELS[lot.coffeeType]}
                                    </span>
                                    <span
                                        className="px-2 py-0.5 rounded text-xs font-bold"
                                        style={{
                                            background: lot.qualityGrade === 'A' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 191, 36, 0.3)',
                                            color: lot.qualityGrade === 'A' ? '#22c55e' : '#fbbf24',
                                        }}
                                    >
                                        Hạng {lot.qualityGrade}
                                    </span>
                                </div>
                                <span className="text-white font-bold">{lot.weight}kg</span>
                            </div>

                            <div className="flex items-center gap-4 text-white/50 text-sm">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {lot.farmerName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(lot.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* SELL MODAL */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showSellModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowSellModal(false)}
                >
                    <div
                        className="w-full max-w-md bg-gray-900 rounded-t-3xl p-6 space-y-5 animate-slide-up max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Truck className="w-5 h-5 text-emerald-400" />
                                Xuất bán cho Coffee ID
                            </h3>
                            <button onClick={() => setShowSellModal(false)}>
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        <p className="text-white/60 text-sm">
                            Chọn các lô hàng EUDR để bán. Hồ sơ truy xuất nguồn gốc sẽ tự động chuyển sang Coffee ID.
                        </p>

                        {/* EUDR Lots Selection */}
                        <div className="space-y-2">
                            {eudrLots.map((lot) => (
                                <label
                                    key={lot.id}
                                    className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedLots.includes(lot.id)
                                            ? 'bg-emerald-500/20 border border-emerald-500/50'
                                            : 'bg-white/5 border border-white/10'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedLots.includes(lot.id)}
                                        onChange={() => toggleLotSelection(lot.id)}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">
                                                {COFFEE_TYPE_LABELS[lot.coffeeType]}
                                            </span>
                                            <span className="text-white/50 text-sm">
                                                từ {lot.farmerName}
                                            </span>
                                        </div>
                                        <p className="text-white/40 text-sm">Hạng {lot.qualityGrade}</p>
                                    </div>
                                    <span className="text-white font-bold">{lot.weight}kg</span>
                                </label>
                            ))}
                        </div>

                        {/* Summary */}
                        {selectedLots.length > 0 && (
                            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                                <div className="flex justify-between mb-2">
                                    <span className="text-white/70">Tổng khối lượng:</span>
                                    <span className="text-white font-bold">{selectedTotalWeight}kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/70">Giá dự kiến (100k/kg):</span>
                                    <span className="text-emerald-400 font-bold">
                                        {formatFullCurrency(selectedTotalWeight * 100000)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Traceability Note */}
                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-2">
                            <Leaf className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <p className="text-cyan-300 text-sm">
                                <strong>Truy xuất nguồn gốc:</strong> Toàn bộ hồ sơ vườn, GPS, EUDR sẽ tự động chuyển quyền sở hữu cho Coffee ID.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSell}
                            disabled={selectedLots.length === 0}
                            className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                            Tạo lệnh vận chuyển
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryDashboard;
