/**
 * ActionableWeatherCard.tsx
 * Card thời tiết đơn giản - bấm vào mở rộng xem 3 ngày + cảnh báo
 */

import React, { useState, useEffect } from 'react';
import {
    CloudRain,
    Wind,
    Sun,
    CloudSun,
    Droplets,
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Umbrella,
    Thermometer,
    Calendar
} from 'lucide-react';

// Dự báo 3 ngày
interface DayForecast {
    day: string;
    date: string;
    tempMin: number;
    tempMax: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    rainChance: number;
    humidity: number;
    windSpeed: number;
    warning?: string;
    advice?: string;
}

// Mock 3-day forecast - Chư Păh, Gia Lai Demo
const mock3DayForecast: DayForecast[] = [
    {
        day: 'Hôm nay',
        date: '22/01',
        tempMin: 18,
        tempMax: 26,
        condition: 'sunny',
        rainChance: 10,
        humidity: 55,
        windSpeed: 5,
        advice: '✅ Thời tiết lý tưởng để kiểm tra EUDR!'
    },
    {
        day: 'Ngày mai',
        date: '18/01',
        tempMin: 20,
        tempMax: 30,
        condition: 'sunny',
        rainChance: 15,
        humidity: 60,
        windSpeed: 5,
        advice: '✅ Điều kiện tốt để phun thuốc'
    },
    {
        day: 'Ngày kia',
        date: '19/01',
        tempMin: 18,
        tempMax: 26,
        condition: 'rainy',
        rainChance: 85,
        humidity: 85,
        windSpeed: 15,
        warning: '⛈️ Mưa to + gió mạnh',
        advice: '❌ KHÔNG phun thuốc, thuốc sẽ trôi hết!'
    }
];

// Current weather - Chư Păh, Gia Lai Demo
const currentWeather = {
    temp: 26,
    humidity: 55,
    windSpeed: 5,
    rainIn: 6,
    condition: 'sunny' as const,
    location: 'Chư Păh, Gia Lai'
};

function getWeatherIcon(condition: DayForecast['condition'], className = 'w-6 h-6') {
    switch (condition) {
        case 'sunny': return <Sun className={`${className} text-yellow-400`} />;
        case 'cloudy': return <CloudSun className={`${className} text-gray-300`} />;
        case 'rainy': return <CloudRain className={`${className} text-blue-400`} />;
        case 'stormy': return <CloudRain className={`${className} text-purple-400`} />;
    }
}

const ActionableWeatherCard: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Main advice
    const mainAdvice = currentWeather.rainIn <= 3
        ? { type: 'success', title: 'Thời điểm vàng để bón phân', desc: `Mưa đến trong ${currentWeather.rainIn}h → Phân tan nhanh` }
        : currentWeather.windSpeed > 10
            ? { type: 'danger', title: 'Không nên phun thuốc', desc: `Gió ${currentWeather.windSpeed}km/h → Thuốc bay phí` }
            : { type: 'success', title: 'Thời tiết tốt', desc: 'Điều kiện thuận lợi làm vườn' };

    const bgColor = mainAdvice.type === 'success' ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600';

    return (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            {/* Main Card - Always Visible */}
            <div className={`relative bg-gradient-to-br ${bgColor}`}>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                <div className="relative z-10 p-5">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-white">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            {mainAdvice.type === 'success' ? 'LÀM ĐƯỢC' : 'DỪNG LẠI'}
                        </span>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            {getWeatherIcon(currentWeather.condition, 'w-6 h-6 text-white')}
                        </div>
                    </div>

                    {/* Main Advice */}
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{mainAdvice.title}</h3>
                            <p className="text-white/80 text-sm">{mainAdvice.desc}</p>
                        </div>
                    </div>

                    {/* Current Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-white/20 text-white/70 text-sm">
                        <span className="flex items-center gap-1">
                            <Thermometer className="w-4 h-4" /> {currentWeather.temp}°C
                        </span>
                        <span className="flex items-center gap-1">
                            <Droplets className="w-4 h-4" /> {currentWeather.humidity}%
                        </span>
                        <span className="flex items-center gap-1">
                            <Wind className="w-4 h-4" /> {currentWeather.windSpeed}km/h
                        </span>
                        <span className="ml-auto text-xs">
                            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Expand Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full mt-4 py-2 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        Xem 3 ngày tới
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded: 3-Day Forecast */}
            {isExpanded && (
                <div className="bg-slate-800/90 backdrop-blur-xl animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="divide-y divide-white/10">
                        {mock3DayForecast.map((day, idx) => (
                            <div key={idx} className="p-4">
                                {/* Day Header */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        {getWeatherIcon(day.condition)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold">{day.day}</p>
                                        <p className="text-gray-400 text-xs">{day.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{day.tempMax}°/{day.tempMin}°</p>
                                        <p className={`text-xs flex items-center gap-1 justify-end ${day.rainChance > 50 ? 'text-blue-400' : 'text-gray-400'}`}>
                                            <Umbrella className="w-3 h-3" /> {day.rainChance}%
                                        </p>
                                    </div>
                                </div>

                                {/* Weather Details */}
                                <div className="flex gap-4 text-xs text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Droplets className="w-3 h-3" /> {day.humidity}%
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Wind className="w-3 h-3" /> {day.windSpeed}km/h
                                    </span>
                                </div>

                                {/* Warning */}
                                {day.warning && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg mb-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                        <span className="text-amber-300 text-sm font-medium">{day.warning}</span>
                                    </div>
                                )}

                                {/* Advice */}
                                {day.advice && (
                                    <div className={`px-3 py-2 rounded-lg text-sm font-medium ${day.warning
                                        ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                                        }`}>
                                        💡 {day.advice}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Early Warning Summary */}
                    <div className="p-4 bg-amber-900/30 border-t border-amber-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <span className="text-amber-400 font-bold text-sm">⚠️ Cảnh báo sớm</span>
                        </div>
                        <ul className="space-y-1 text-sm text-amber-200">
                            <li>• <b>Chiều nay:</b> Mưa nhẹ - bón phân buổi sáng</li>
                            <li>• <b>Ngày kia:</b> Mưa to gió lớn - tránh phun thuốc</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionableWeatherCard;
