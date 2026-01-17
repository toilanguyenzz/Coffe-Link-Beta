import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Sparkles, Trees, MapPin, ChevronRight } from 'lucide-react';

interface FarmSummaryCardProps {
    areaHa: number;
    treeCount: number;
    coffeeType: 'robusta' | 'arabica' | 'chari';
    hasRedBook: boolean;
    farmImage?: string; // Base64 or URL
    onConsultClick?: () => void;
}

const COFFEE_TYPE_NAMES: Record<string, string> = {
    robusta: 'Cà Phê Robusta',
    arabica: 'Cà Phê Arabica',
    chari: 'Cà Phê Chari',
};

const FarmSummaryCard: React.FC<FarmSummaryCardProps> = ({
    areaHa,
    treeCount,
    coffeeType,
    hasRedBook,
    farmImage,
    onConsultClick,
}) => {
    const navigate = useNavigate();

    const handleConsultClick = () => {
        if (onConsultClick) {
            onConsultClick();
        } else {
            navigate('/consult');
        }
    };

    return (
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                background: 'linear-gradient(180deg, #0A1F1C 0%, #000000 100%)',
                border: hasRedBook ? '2px solid #00FF94' : '2px solid #F59E0B',
                boxShadow: hasRedBook
                    ? '0 0 30px rgba(0, 255, 148, 0.2)'
                    : '0 0 30px rgba(245, 158, 11, 0.2)',
            }}
        >
            {/* Farm Image Header */}
            {farmImage && (
                <div className="relative h-32 w-full overflow-hidden">
                    <img
                        src={farmImage}
                        alt="Farm satellite view"
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
                        }}
                    />
                </div>
            )}

            {/* Badge - EUDR Status */}
            <div
                className={`absolute ${farmImage ? 'top-3' : 'top-4'} right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md ${hasRedBook
                        ? 'bg-[#00FF94]/20 border border-[#00FF94]/50 text-[#00FF94]'
                        : 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                    }`}
            >
                {hasRedBook ? (
                    <>
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase">EUDR Verified</span>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase">Self-Declared</span>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#00FF94]" />
                        <span className="text-lg font-black text-white">
                            {areaHa.toFixed(2)} Ha
                        </span>
                    </div>
                    <div className="w-px h-5 bg-white/20" />
                    <div className="flex items-center gap-2">
                        <Trees className="h-4 w-4 text-[#00FF94]" />
                        <span className="text-lg font-black text-white">
                            {treeCount.toLocaleString('vi-VN')} Cây
                        </span>
                    </div>
                </div>

                {/* Coffee Type */}
                <p className="text-sm text-white/60 mb-4">
                    {COFFEE_TYPE_NAMES[coffeeType] || 'Cà phê'}
                </p>

                {/* CTA Button */}
                <button
                    onClick={handleConsultClick}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:scale-[1.02]"
                    style={{
                        background: 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)',
                        color: '#000',
                        boxShadow: '0 0 20px rgba(0, 255, 148, 0.4)',
                    }}
                >
                    <Sparkles className="h-4 w-4" />
                    Hỏi AI Tư Vấn Ngay
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default FarmSummaryCard;
