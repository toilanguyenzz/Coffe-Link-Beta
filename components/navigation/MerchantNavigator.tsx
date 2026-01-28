import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Book, Warehouse, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/DemoAuthContext';

const MerchantNavigator: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userProfile, logout } = useAuth();
    const agentName = userProfile?.displayName || 'Đại lý';

    const isActive = (path: string) => location.pathname === path;

    const tabs = [
        { id: '/merchant/dashboard', label: 'Tổng Quan', icon: Home },
        { id: '/merchant/purchase', label: 'Thu mua', icon: ShoppingCart },
        { id: '/merchant/ledger', label: 'Sổ nợ', icon: Book },
        { id: '/merchant/inventory', label: 'Kho hàng', icon: Warehouse },
    ];

    const handleLogout = async () => {
        if (confirm('Bác có chắc muốn đăng xuất khỏi Đại Lý?')) {
            await logout();
            // No need to navigate manually, RoleBasedRoutes will redirect to /login when userProfile becomes null
        }
    };

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden bg-black">
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
                <div className="sticky top-0 z-20 px-4 py-4 backdrop-blur-lg bg-black/20 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-xl font-bold">ĐẠI LÝ THU MUA</h1>
                            <p className="text-emerald-400 text-sm">{agentName}</p>
                        </div>
                        <div className="flex items-center gap-2">

                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-white/70" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-lg">🏪</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* TAB CONTENT (ROUTER OUTLET) */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="px-4 pb-4">
                    <Outlet />
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
                            const active = isActive(tab.id);
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(tab.id)}
                                    className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${active
                                        ? 'bg-emerald-500/20'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${active ? 'text-emerald-400' : 'text-white/50'
                                            }`}
                                        strokeWidth={active ? 2 : 1.5}
                                    />
                                    <span
                                        className={`text-xs mt-1 font-medium ${active ? 'text-emerald-400' : 'text-white/50'
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

export default MerchantNavigator;
