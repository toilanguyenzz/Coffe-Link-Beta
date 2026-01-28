/**
 * WeatherForecast.tsx - 7-Day Weather Forecast for Farmers
 * Provides detailed weather forecast with farming advice
 */

import React from 'react';
import { X, CloudRain, Sun, Cloud, Wind, Droplets } from 'lucide-react';

interface WeatherForecastProps {
    onClose: () => void;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ onClose }) => {
    const forecast = [
        { day: 'T2', date: '27/01', icon: CloudRain, temp: '24°', rain: '80%', wind: '15km/h', condition: 'Mưa vừa', color: 'from-blue-400 to-cyan-500' },
        { day: 'T3', date: '28/01', icon: CloudRain, temp: '23°', rain: '90%', wind: '18km/h', condition: 'Mưa to', color: 'from-blue-500 to-indigo-500' },
        { day: 'T4', date: '29/01', icon: Cloud, temp: '25°', rain: '60%', wind: '12km/h', condition: 'Nhiều mây', color: 'from-gray-400 to-slate-500' },
        { day: 'T5', date: '30/01', icon: Cloud, temp: '26°', rain: '40%', wind: '10km/h', condition: 'Ít mây', color: 'from-gray-300 to-gray-400' },
        { day: 'T6', date: '31/01', icon: Sun, temp: '28°', rain: '20%', wind: '8km/h', condition: 'Nắng nhẹ', color: 'from-yellow-400 to-orange-400' },
        { day: 'T7', date: '01/02', icon: Sun, temp: '29°', rain: '10%', wind: '7km/h', condition: 'Nắng đẹp', color: 'from-orange-400 to-red-400' },
        { day: 'CN', date: '02/02', icon: Sun, temp: '30°', rain: '15%', wind: '9km/h', condition: 'Nắng gắt', color: 'from-red-400 to-pink-400' },
    ];

    const farmingAdvice = [
        {
            title: '🌧️ Cảnh báo mưa (T2-T3)',
            content: 'Không phun thuốc bảo vệ thực vật. Kiểm tra hệ thống thoát nước. Chuẩn bị che chắn cho cây non.',
            type: 'warning'
        },
        {
            title: '☀️ Thời tiết tốt (T5-CN)',
            content: 'Thời điểm tốt để phun thuốc, bón phân. Sử dụng nước tiết kiệm vào buổi chiều.',
            type: 'success'
        },
        {
            title: '💧 Quản lý nước',
            content: 'Tưới nhỏ giọt vào sáng sớm. Tránh tưới vào giờ nắng gắt (11h-15h).',
            type: 'info'
        }
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-cyan-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
                    <div>
                        <h2 className="text-white text-2xl font-bold">Dự Báo Thời Tiết</h2>
                        <p className="text-white/80 text-sm mt-0.5">7 ngày tới - Gia Lai</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Forecast Cards */}
                <div className="p-6 space-y-3">
                    {forecast.map((day, idx) => {
                        const IconComponent = day.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Day */}
                                    <div className="text-center min-w-[50px]">
                                        <div className="text-gray-900 font-bold text-lg">{day.day}</div>
                                        <div className="text-gray-500 text-xs">{day.date}</div>
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${day.color} flex items-center justify-center`}>
                                        <IconComponent className="w-7 h-7 text-white" strokeWidth={2.5} />
                                    </div>

                                    {/* Condition */}
                                    <div className="flex-1">
                                        <div className="text-gray-900 font-semibold">{day.condition}</div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Droplets className="w-3 h-3" />
                                                {day.rain}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Wind className="w-3 h-3" />
                                                {day.wind}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Temperature */}
                                    <div className="text-3xl font-bold text-gray-900">
                                        {day.temp}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Farming Advice */}
                <div className="px-6 pb-6 space-y-3">
                    <h3 className="text-gray-900 text-lg font-bold mb-3">Lời Khuyên Canh Tác</h3>

                    {farmingAdvice.map((advice, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl p-4 ${advice.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                                    advice.type === 'success' ? 'bg-green-50 border border-green-200' :
                                        'bg-blue-50 border border-blue-200'
                                }`}
                        >
                            <div className="font-bold text-gray-900 mb-1">{advice.title}</div>
                            <div className="text-gray-700 text-sm">{advice.content}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherForecast;
