import React, { useState } from 'react';
import {
    X,
    Sun,
    Cloud,
    CloudRain,
    CloudLightning,
    Thermometer,
    CheckCircle2,
    XCircle,
    Lightbulb,
    Bell,
    Calendar,
    ChevronRight,
    Sparkles,
    Clock,
    Umbrella,
    Leaf
} from 'lucide-react';

interface StrategyBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScheduleReminder: (date: Date, message: string) => void;
}

interface DayForecast {
    date: Date;
    dayLabel: string;
    dateLabel: string;
    morning: {
        weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
        temp: number;
        label: string;
    };
    afternoon: {
        weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
        temp: number;
        label: string;
    };
    recommendations: {
        type: 'do' | 'dont' | 'ai';
        text: string;
    }[];
    canSchedule?: boolean;
    scheduleAction?: string;
}

const getWeatherIcon = (weather: string, size: string = 'h-6 w-6') => {
    switch (weather) {
        case 'sunny':
            return <Sun className={`${size} text-yellow-400`} />;
        case 'cloudy':
            return <Cloud className={`${size} text-gray-400`} />;
        case 'rainy':
            return <CloudRain className={`${size} text-blue-400`} />;
        case 'stormy':
            return <CloudLightning className={`${size} text-purple-400`} />;
        default:
            return <Sun className={`${size} text-yellow-400`} />;
    }
};

const getWeatherBg = (weather: string) => {
    switch (weather) {
        case 'sunny':
            return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
        case 'cloudy':
            return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
        case 'rainy':
            return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
        case 'stormy':
            return 'from-purple-500/20 to-indigo-500/20 border-purple-500/30';
        default:
            return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
};

// Mock data cho 3 ngày tới
const getMockForecast = (): DayForecast[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const getDayName = (date: Date) => {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    const formatDate = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    return [
        {
            date: today,
            dayLabel: 'HÔM NAY',
            dateLabel: `${getDayName(today)}, ${formatDate(today)}`,
            morning: {
                weather: 'sunny',
                temp: 26,
                label: 'Nắng ráo'
            },
            afternoon: {
                weather: 'stormy',
                temp: 29,
                label: 'Mưa dông'
            },
            recommendations: [
                { type: 'do', text: 'SÁNG: Phun thuốc sâu (thuốc bám dính tốt)' },
                { type: 'dont', text: 'CHIỀU: Cấm bón phân (trôi hết tiền)' }
            ]
        },
        {
            date: tomorrow,
            dayLabel: 'NGÀY MAI',
            dateLabel: `${getDayName(tomorrow)}, ${formatDate(tomorrow)}`,
            morning: {
                weather: 'rainy',
                temp: 24,
                label: 'Mưa dầm'
            },
            afternoon: {
                weather: 'rainy',
                temp: 23,
                label: 'Mưa dầm'
            },
            recommendations: [
                { type: 'ai', text: 'Bác nên hoãn lịch bón phân sang ngày kia. Ngày mai chỉ nên đi thăm vườn khơi rãnh thoát nước.' }
            ]
        },
        {
            date: dayAfter,
            dayLabel: 'NGÀY KIA',
            dateLabel: `${getDayName(dayAfter)}, ${formatDate(dayAfter)}`,
            morning: {
                weather: 'sunny',
                temp: 30,
                label: 'Nắng gắt'
            },
            afternoon: {
                weather: 'sunny',
                temp: 32,
                label: 'Nắng gắt'
            },
            recommendations: [
                { type: 'ai', text: 'Đất vừa mưa xong gặp nắng gắt dễ nứt nẻ/sốc nhiệt. Nên tủ gốc giữ ẩm trước, rồi bón phân vào lúc 7-8h sáng.' }
            ],
            canSchedule: true,
            scheduleAction: 'Lên Lịch Bón Phân'
        }
    ];
};

const StrategyBoardModal: React.FC<StrategyBoardModalProps> = ({
    isOpen,
    onClose,
    onScheduleReminder
}) => {
    const [scheduledDay, setScheduledDay] = useState<number | null>(null);
    const forecast = getMockForecast();

    if (!isOpen) return null;

    const handleSchedule = (day: DayForecast, index: number) => {
        const reminderDate = new Date(day.date);
        reminderDate.setHours(7, 0, 0, 0); // 7h sáng

        onScheduleReminder(
            reminderDate,
            `Bác ơi, hôm nay trời đẹp rồi, mang bao NPK ra bón nhé! 🌱`
        );
        setScheduledDay(index);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] rounded-t-[2.5rem] shadow-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
                    {/* Handle */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/20" />

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Bảng Chiến Thuật</h2>
                                <p className="text-xs text-gray-400 font-medium">Kịch bản 3 ngày tới</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-6 py-4 space-y-4">
                    {forecast.map((day, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl border overflow-hidden transition-all duration-500 ${index === 0
                                    ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            {/* Day Header */}
                            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${index === 0 ? 'text-emerald-400' : 'text-gray-400'
                                        }`}>
                                        {day.dayLabel}
                                    </span>
                                    <p className="text-sm font-bold text-white mt-0.5">{day.dateLabel}</p>
                                </div>
                                {index === 0 && (
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                                        Hôm nay
                                    </span>
                                )}
                            </div>

                            {/* Weather Slots */}
                            <div className="p-4 space-y-3">
                                {/* Morning & Afternoon */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Morning */}
                                    <div className={`rounded-xl p-3 bg-gradient-to-br ${getWeatherBg(day.morning.weather)} border`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Sáng</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getWeatherIcon(day.morning.weather, 'h-8 w-8')}
                                            <div>
                                                <p className="text-lg font-black text-white">{day.morning.temp}°C</p>
                                                <p className="text-[10px] text-gray-300">{day.morning.label}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Afternoon */}
                                    <div className={`rounded-xl p-3 bg-gradient-to-br ${getWeatherBg(day.afternoon.weather)} border`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Chiều</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getWeatherIcon(day.afternoon.weather, 'h-8 w-8')}
                                            <div>
                                                <p className="text-lg font-black text-white">{day.afternoon.temp}°C</p>
                                                <p className="text-[10px] text-gray-300">{day.afternoon.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="space-y-2">
                                    {day.recommendations.map((rec, recIndex) => (
                                        <div
                                            key={recIndex}
                                            className={`rounded-xl p-3 flex gap-3 ${rec.type === 'do'
                                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                    : rec.type === 'dont'
                                                        ? 'bg-red-500/10 border border-red-500/20'
                                                        : 'bg-violet-500/10 border border-violet-500/20'
                                                }`}
                                        >
                                            {rec.type === 'do' && (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                            )}
                                            {rec.type === 'dont' && (
                                                <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                            )}
                                            {rec.type === 'ai' && (
                                                <Lightbulb className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                {rec.type === 'ai' && (
                                                    <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">
                                                        💡 Lời khuyên AI
                                                    </span>
                                                )}
                                                <p className={`text-sm font-medium leading-relaxed ${rec.type === 'do' ? 'text-emerald-100' :
                                                        rec.type === 'dont' ? 'text-red-100' : 'text-violet-100'
                                                    }`}>
                                                    {rec.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Schedule Button */}
                                {day.canSchedule && (
                                    <button
                                        onClick={() => handleSchedule(day, index)}
                                        disabled={scheduledDay === index}
                                        className={`w-full mt-3 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${scheduledDay === index
                                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        {scheduledDay === index ? (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span>Đã Lên Lịch Nhắc 7h Sáng</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="h-5 w-5" />
                                                <span>{day.scheduleAction}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pro Tip */}
                    <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
                        <div className="flex gap-3">
                            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
                                    Mẹo hay
                                </p>
                                <p className="text-sm text-amber-100/80">
                                    Bón phân vào sáng sớm (6-8h) khi trời mát, phân ngấm tốt hơn và không bị bốc hơi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategyBoardModal;
