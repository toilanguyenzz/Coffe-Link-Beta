/**
 * AgentDashboard.tsx
 * Main dashboard for Agent (Đại lý thu mua) with 4 tabs
 * Tabs: Trang chủ | Thu mua | Sổ nợ | Kho hàng
 */

import React, { useState, useEffect } from 'react';
import { Home, ShoppingCart, Book, Warehouse } from 'lucide-react';
import AgentHomeDashboard from '../../components/agent/AgentHomeDashboard';
import PurchaseFlow from '../../components/agent/PurchaseFlow';
import DebtLedger from '../../components/agent/DebtLedger';
import InventoryDashboard from '../../components/agent/InventoryDashboard';
import { useAuth } from '../../contexts/DemoAuthContext';

type AgentTab = 'home' | 'purchase' | 'debt' | 'inventory';

const AgentDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<AgentTab>('home');

    // Tab configuration
    const tabs = [
        { id: 'home' as AgentTab, label: 'Trang chủ', icon: Home },
        { id: 'purchase' as AgentTab, label: 'Thu mua', icon: ShoppingCart },
        { id: 'debt' as AgentTab, label: 'Sổ nợ', icon: Book },
        { id: 'inventory' as AgentTab, label: 'Kho hàng', icon: Warehouse },
    ];

    const agentName = userProfile?.displayName || 'Đại lý';

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* DARK GRADIENT BACKGROUND */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, #0c1f15 0%, #132a1c 50%, #0a1a0f 100%)',
                    }}
                />
                {/* Decorative glows */}
                <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-green-400/10 rounded-full blur-[80px]" />
            </div>

            {/* Max-width container */}
            <div className="max-w-md mx-auto min-h-screen relative z-10">
                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* HEADER */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="sticky top-0 z-20 px-4 py-4 backdrop-blur-lg bg-black/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-xl font-bold">ĐẠI LÝ THU MUA</h1>
                            <p className="text-emerald-400 text-sm">{agentName}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-lg">🏪</span>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* TAB CONTENT */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="px-4 pb-4">
                    {activeTab === 'home' && <AgentHomeDashboard />}
                    {activeTab === 'purchase' && <PurchaseFlow />}
                    {activeTab === 'debt' && <DebtLedger />}
                    {activeTab === 'inventory' && <InventoryDashboard />}
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* BOTTOM TAB BAR */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="fixed bottom-0 left-0 right-0 z-30">
                    <div
                        className="max-w-md mx-auto px-2 py-2 flex justify-around items-center"
                        style={{
                            background: 'linear-gradient(180deg, rgba(10, 26, 15, 0.95) 0%, rgba(10, 26, 15, 0.98) 100%)',
                            borderTop: '1px solid rgba(34, 197, 94, 0.2)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${isActive
                                            ? 'bg-emerald-500/20'
                                            : 'hover:bg-white/5'
                                        }`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${isActive ? 'text-emerald-400' : 'text-white/50'
                                            }`}
                                        strokeWidth={isActive ? 2 : 1.5}
                                    />
                                    <span
                                        className={`text-xs mt-1 font-medium ${isActive ? 'text-emerald-400' : 'text-white/50'
                                            }`}
                                    >
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
