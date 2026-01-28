
import React from 'react';
import { Camera, ChevronRight } from 'lucide-react';

interface CompactSellBannerProps {
    onClick: () => void;
}

const CompactSellBanner: React.FC<CompactSellBannerProps> = ({ onClick }) => {
    return (
        <div className="px-4 mb-6">
            <button
                onClick={onClick}
                className="w-full relative overflow-hidden rounded-xl bg-[#1e4d3b] border border-[#2d6a50] group active:scale-[0.98] transition-all"
                style={{
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '20px 20px'
                    }}
                />

                <div className="relative flex items-center justify-between p-3 pl-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-white font-bold text-sm">Bác có phụ phẩm?</span>
                            <span className="text-orange-300 text-xs">Bấm để đăng bán ngay</span>
                        </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ChevronRight className="w-5 h-5 text-white/70" />
                    </div>
                </div>
            </button>
        </div>
    );
};

export default CompactSellBanner;
