/**
 * CommunityWeatherHub.tsx
 * 
 * DESIGN MATCH: "Cute 3D Character" mockup
 */

import React, { useState } from 'react';
import {
    Sun,
    Cloud,
    Moon,
    Droplets,
    Thermometer,
    Wind,
    CloudRain,
    CloudLightning,
    CloudSun
} from 'lucide-react';

interface CommunityWeatherHubProps {
    farmerName: string;
    farmerId: string;
    location?: string;
}

const CommunityWeatherHub: React.FC<CommunityWeatherHubProps> = ({
    farmerName,
    location = 'Chư Păh, Gia Lai',
}) => {
    // Mock Data matching the image exactly
    const TIMELINE_DATA = [
        { time: '3h', icon: 'sun', temp: 28, desc: 'Nắng đẹp' },
        { time: '4h', icon: 'cloud-sun', temp: 27, desc: 'Có mây' },
        { time: '5h', icon: 'cloud', temp: 26, desc: 'Âm u' },
        { time: '6h', icon: 'moon-cloud', temp: 25, desc: 'Hoàng hôn' },
    ];

    const FORECAST_DATA = [
        {
            day: 'Thứ 2',
            date: '2/9 DL - 20/7 ÂL',
            icon: 'sun',
            high: 29,
            low: 22,
            advice: 'Nắng gắt - Nên phơi cà phê',
            color: 'text-green-600',
        },
        {
            day: 'Thứ 3',
            date: '3/9 DL - 21/7 ÂL',
            icon: 'rain',
            high: 25,
            low: 20,
            advice: 'Mưa nhẹ - Cẩn thận nấm bệnh',
            color: 'text-green-600', // Image shows green text even for rain advice
        },
        {
            day: 'Thứ 4',
            date: '4/9 DL - 22/7 ÂL',
            icon: 'cloud-sun',
            high: 27,
            low: 21,
            advice: 'Nắng tốt - Tưới nước nhẹ',
            color: 'text-green-600',
        },
        {
            day: 'Thứ 5',
            date: '5/9 DL - 23/7 ÂL',
            icon: 'storm',
            high: 24,
            low: 19,
            advice: 'Mưa lớn - Hạn chế ngoài trời',
            color: 'text-green-600',
        },
        {
            day: 'Thứ 6',
            date: '6/9 DL - 24/7 ÂL',
            icon: 'sun',
            high: 30,
            low: 23,
            advice: 'Nắng gắt - Thu hoạch tốt',
            color: 'text-green-600',
        },
    ];

    const getWeatherIcon = (type: string, className = "w-6 h-6") => {
        switch (type) {
            case 'sun': return <Sun className={`${className} text-yellow-500 fill-yellow-500`} />;
            case 'cloud-sun': return <CloudSun className={`${className} text-yellow-500`} />;
            case 'cloud': return <Cloud className={`${className} text-gray-400 fill-gray-100`} />;
            case 'moon-cloud': return <Moon className={`${className} text-yellow-400`} />; // Approximating 'Hoàng hôn'
            case 'rain': return <CloudRain className={`${className} text-blue-400`} />;
            case 'storm': return <CloudLightning className={`${className} text-purple-500`} />;
            default: return <Sun className={className} />;
        }
    };

    return (
        <div className="space-y-4 pb-10">
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* 1. HEADER CARD (Glassmorphism + Character) */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div
                className="rounded-[30px] p-5 relative overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                }}
            >
                {/* Header Top */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-gray-900 font-bold text-lg">
                            Chào bác (Demo)! 👋
                        </h2>
                        <p className="text-gray-600 font-semibold text-sm">Chư Păh, Gia Lai</p>
                    </div>
                    <Sun className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                </div>

                {/* Main Content: Character + Temp */}
                <div className="flex items-center justify-between px-2 -mt-2">
                    {/* Cute 3D Character */}
                    <div className="relative w-40 h-40 -ml-4">
                        <img
                            src="/images/weather/cute_leaf.png"
                            alt="Cute Leaf"
                            className="w-full h-full object-contain drop-shadow-xl animate-bounce-slow"
                        />
                    </div>

                    {/* Temperature Big */}
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[64px] font-black text-gray-900 leading-none -mt-4">
                            28°C
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 bg-yellow-100/50 px-3 py-1 rounded-full">
                            <span className="text-gray-800 font-medium text-sm">Trời đẹp lắm bác ơi!</span>
                            <span className="text-xl">🌞</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* 2. STATS ROW (Pills) */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div className="flex gap-3 justify-between">
                {/* Humidity */}
                <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center gap-1 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                        <Droplets className="w-5 h-5 text-blue-500 fill-blue-500" />
                    </div>
                    <span className="text-gray-900 font-bold text-lg leading-none">65%</span>
                    <span className="text-gray-500 text-xs font-semibold">Độ ẩm</span>
                </div>

                {/* Temp */}
                <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center gap-1 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
                        <Thermometer className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-gray-900 font-bold text-lg leading-none">28°C</span>
                    <span className="text-gray-500 text-xs font-semibold">Nhiệt độ</span>
                </div>

                {/* Wind */}
                <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center gap-1 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-1">
                        <Wind className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-900 font-bold text-lg leading-none">8 km/h</span>
                    <span className="text-gray-500 text-xs font-semibold">Gió</span>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* 3. TIMELINE CARD */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div
                className="rounded-[24px] p-4"
                style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
            >
                <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider mb-3 ml-1">
                    TIMELINE HÔM NAY
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {TIMELINE_DATA.map((item, index) => (
                        <div key={index} className="bg-white/50 rounded-2xl py-3 flex flex-col items-center gap-1 shadow-sm">
                            <span className="text-gray-500 text-sm font-semibold">{item.time}</span>
                            <div className="my-1 scale-110">
                                {getWeatherIcon(item.icon)}
                            </div>
                            <span className="text-gray-900 font-bold text-lg leading-none">{item.temp}°</span>
                            <span className="text-gray-600 text-[10px] font-medium text-center px-1">{item.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* 4. 5-DAY FORECAST CARD */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div
                className="rounded-[24px] overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-end">
                    <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wider">
                        DỰ BÁO 5 NGÀY
                    </h3>
                    <span className="text-gray-500 text-xs">Cập nhật: 10 phút trước</span>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100/50">
                    {FORECAST_DATA.map((day, index) => (
                        <div key={index} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors">
                            {/* Left: Date */}
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-bold text-sm">{day.day}</span>
                                <span className="text-gray-500 text-[10px]">{day.date}</span>
                            </div>

                            {/* Center: Icon + Advice */}
                            <div className="flex-1 flex flex-col items-center px-2 text-center">
                                {getWeatherIcon(day.icon, "w-8 h-8 mb-1")}
                                {/* Image implies green text advice for all scenarios effectively, or specific per scenario */}
                                <span className={`text-[10px] font-bold ${day.color}`}>
                                    {day.advice}
                                </span>
                            </div>

                            {/* Right: Temp Range */}
                            <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                                <span>{day.high}°</span>
                                <span className="text-gray-400 font-normal">{day.low}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS Animation Styles */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CommunityWeatherHub;
