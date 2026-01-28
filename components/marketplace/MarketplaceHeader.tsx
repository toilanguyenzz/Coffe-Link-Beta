/**
 * MarketplaceHeader.tsx
 * Header component for the "Chợ" marketplace tab
 * Features greeting and two prominent action buttons
 */

import React from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';

interface MarketplaceHeaderProps {
    userName: string;
    onSellClick: () => void;
    onBuyClick: () => void;
}

const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
    userName,
    onSellClick,
    onBuyClick,
}) => {
    // Get first name only for greeting
    const firstName = userName?.split(' ').pop() || 'Bác';

    return (
        <div className="relative overflow-hidden">
            {/* Gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, #0f3d1f 0%, #0a2e16 50%, #061a0d 100%)',
                }}
            />

            {/* Decorative glow effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/15 rounded-full blur-[50px]" />

            {/* Content */}
            <div className="relative px-5 pt-6 pb-5">
                {/* Greeting */}
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h1 className="text-white text-lg font-medium">
                        Chào bác <span className="font-bold text-amber-400">{firstName}</span>, bác muốn MUA hay BÁN hôm nay?
                    </h1>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-3">
                    {/* ĐĂNG BÁN Button - Orange/Coral */}
                    <button
                        onClick={onSellClick}
                        className="flex-1 relative overflow-hidden rounded-2xl py-4 px-5 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                    >
                        {/* Shine effect */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                            }}
                        />

                        <div className="relative flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-bold text-lg block leading-tight">ĐĂNG BÁN</span>
                                <span className="text-white/70 text-xs">Bán phụ phẩm</span>
                            </div>
                        </div>
                    </button>

                    {/* TÌM MUA Button - Green/Teal */}
                    <button
                        onClick={onBuyClick}
                        className="flex-1 relative overflow-hidden rounded-2xl py-4 px-5 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                    >
                        {/* Shine effect */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                            }}
                        />

                        <div className="relative flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Search className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-bold text-lg block leading-tight">TÌM MUA</span>
                                <span className="text-white/70 text-xs">Mua phụ phẩm</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceHeader;
