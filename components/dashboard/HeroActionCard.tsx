/**
 * HeroActionCard.tsx - The "Star" of the Dashboard
 * A massive, immersive card that delivers AI-powered farming advice
 */

import React from 'react';
import { Droplets, Sun, Wind, Pencil, Leaf, CloudRain, Snowflake, CloudSun } from 'lucide-react';

interface HeroActionCardProps {
    farmerName: string;
    onAction: () => void;
    // Weather data
    soilMoisture?: number;
    temperature?: number;
    weatherCondition?: 'sunny' | 'cloudy' | 'rainy' | 'cold';
    windSpeed?: number;
    // AI-generated content
    seasonBadge?: string;
    mainMessage?: string;
    subMessage?: string;
    actionLabel?: string;
}

// Background images for different conditions
const BACKGROUNDS = {
    sunny: 'https://images.unsplash.com/photo-1524350876685-274059332603?w=1200&auto=format&fit=crop',
    cloudy: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1200&auto=format&fit=crop',
    rainy: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1200&auto=format&fit=crop',
    cold: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200&auto=format&fit=crop',
};

const WeatherIcon: React.FC<{ condition: string; className?: string }> = ({ condition, className }) => {
    switch (condition) {
        case 'sunny': return <Sun className={className} />;
        case 'cloudy': return <CloudSun className={className} />;
        case 'rainy': return <CloudRain className={className} />;
        case 'cold': return <Snowflake className={className} />;
        default: return <Sun className={className} />;
    }
};

const HeroActionCard: React.FC<HeroActionCardProps> = ({
    onAction,
    soilMoisture = 60,
    temperature = 28,
    weatherCondition = 'sunny',
    windSpeed = 12,
    seasonBadge = 'Mùa Chăm Sóc',
    mainMessage = 'ĐẤT ĐANG "NGON"\nBÓN PHÂN ĐƯỢC NGAY!',
    subMessage = 'Điều kiện lý tưởng để bón phân NPK',
    actionLabel = 'Ghi Nhật Ký Bón Phân',
}) => {
    // Determine advice color based on conditions
    const isGoodCondition = soilMoisture >= 40 && soilMoisture <= 80 && weatherCondition !== 'rainy';

    return (
        <div className="relative mx-4 rounded-[32px] overflow-hidden shadow-2xl min-h-[420px] flex flex-col">
            {/* Background Image with Parallax-like effect */}
            <div className="absolute inset-0">
                <img
                    src={BACKGROUNDS[weatherCondition]}
                    alt="Farm background"
                    className="w-full h-full object-cover scale-110 transform"
                />
                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative flex-1 flex flex-col p-6 pt-5">

                {/* Season Badge */}
                <div className="flex items-center gap-2 mb-auto">
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                        <Leaf className="w-4 h-4 text-green-300" />
                        <span className="text-white text-sm font-semibold">{seasonBadge}</span>
                    </div>
                </div>

                {/* Main Message - The Star */}
                <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
                    <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isGoodCondition
                                ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                                : 'bg-gradient-to-br from-amber-400 to-orange-600'
                            } shadow-lg`}
                    >
                        <Leaf className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight mb-3 drop-shadow-lg whitespace-pre-line">
                        {mainMessage}
                    </h1>

                    <p className="text-white/80 text-base font-medium max-w-xs">
                        {subMessage}
                    </p>
                </div>

                {/* Weather Stats Row */}
                <div className="flex items-center justify-center gap-4 mb-5">
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <Droplets className="w-5 h-5 text-blue-300" />
                        <div>
                            <span className="text-white text-lg font-bold">{soilMoisture}%</span>
                            <span className="text-white/60 text-xs block">Độ ẩm đất</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <WeatherIcon condition={weatherCondition} className="w-5 h-5 text-yellow-300" />
                        <div>
                            <span className="text-white text-lg font-bold">{temperature}°C</span>
                            <span className="text-white/60 text-xs block">Nhiệt độ</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <Wind className="w-5 h-5 text-cyan-300" />
                        <div>
                            <span className="text-white text-lg font-bold">{windSpeed}</span>
                            <span className="text-white/60 text-xs block">km/h</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button - The Action */}
                <button
                    onClick={onAction}
                    className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 
                     text-white text-lg font-bold py-4 px-6 rounded-2xl
                     shadow-lg shadow-green-500/30
                     active:scale-[0.98] transition-all duration-200
                     flex items-center justify-center gap-3
                     border border-green-400/30"
                >
                    <Pencil className="w-5 h-5" />
                    <span>{actionLabel}</span>
                </button>
            </div>
        </div>
    );
};

export default HeroActionCard;
