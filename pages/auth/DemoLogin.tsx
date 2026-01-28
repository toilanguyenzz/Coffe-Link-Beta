/**
 * DemoLogin.tsx - Trang đăng nhập cho Demo Mode
 * Đơn giản, nhanh, 3 buttons để chọn role
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import { Sprout, Crown, Store, Zap, Smartphone } from 'lucide-react';

const DemoLogin: React.FC = () => {
    const navigate = useNavigate();
    const { demoLoginAsFarmer, demoLoginAsHubLeader, demoLoginAsAgent } = useDemoAuth();

    const handleFarmerLogin = () => {
        demoLoginAsFarmer();
        navigate('/');
    };

    const handleHubLeaderLogin = () => {
        demoLoginAsHubLeader();
        navigate('/hub-leader');
    };

    const handleAgentLogin = () => {
        demoLoginAsAgent();
        navigate('/merchant/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center px-4 py-8">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] bg-green-500/20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] rounded-full blur-[120px] bg-emerald-400/10"></div>

            <div className="relative w-full max-w-md">
                {/* Demo badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full shadow-lg">
                        <Zap size={14} className="fill-current" />
                        <span className="text-xs font-black uppercase tracking-wider">Demo Mode</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 px-8 pt-14 pb-10 text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Smartphone className="h-32 w-32 rotate-12 -translate-y-6 translate-x-6" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <Sprout className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-black">Agri-OS MVP</h1>
                            <p className="text-green-100 text-sm mt-1">Chọn vai trò để trải nghiệm demo</p>
                        </div>
                    </div>

                    {/* Role buttons */}
                    <div className="p-6 space-y-4">
                        {/* Farmer */}
                        <button
                            onClick={handleFarmerLogin}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all group"
                        >
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Sprout className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-gray-900 text-lg">Nông Dân</h3>
                                <p className="text-sm text-gray-500">Anh Minh - Chư Pah, Gia Lai</p>
                            </div>
                            <div className="text-green-600 font-bold text-sm">→</div>
                        </button>

                        {/* Hub Leader */}
                        <button
                            onClick={handleHubLeaderLogin}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all group"
                        >
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Crown className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-gray-900 text-lg">Trưởng Trạm</h3>
                                <p className="text-sm text-gray-500">Chú Hùng - Trạm Chư Pah</p>
                            </div>
                            <div className="text-purple-600 font-bold text-sm">→</div>
                        </button>

                        {/* Agent (Đại lý thu mua) */}
                        <button
                            onClick={handleAgentLogin}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg transition-all group"
                        >
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Store className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-gray-900 text-lg">Đại Lý Thu Mua</h3>
                                <p className="text-sm text-gray-500">Đại lý Anh Hùng - Chư Sê</p>
                            </div>
                            <div className="text-cyan-600 font-bold text-sm">→</div>
                        </button>
                    </div>

                    {/* Features list */}
                    <div className="px-6 pb-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                Tính năng trong Demo
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Giá Trượt
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> EUDR Check
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Sổ Nợ Đại Lý
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Chợ Phụ Phẩm
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 px-6 py-4 text-center">
                        <p className="text-xs text-gray-500">
                            Dữ liệu demo được lưu trên thiết bị này
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoLogin;
