import React from 'react';
import {
    Sun,
    CloudRain,
    AlertTriangle,
    CheckCircle2,
    Thermometer,
    Droplets,
    Wind,
    ChevronRight,
    Zap,
    Sparkles
} from 'lucide-react';

interface FarmingIndexCardProps {
    onOpenStrategy: () => void;
    // Weather data props (sẽ fetch từ API sau)
    temperature?: number;
    humidity?: number;
    rainProbability?: number;
    windSpeed?: number;
}

interface FarmingIndexResult {
    score: number;
    isGreenLight: boolean;
    label: string;
    sublabel: string;
    recommendation: string;
}

// Logic tính Farming Index
const calculateFarmingIndex = (
    rainProbability: number,
    temperature: number,
    humidity: number,
    windSpeed: number
): FarmingIndexResult => {
    // Điểm cơ bản
    let score = 100;

    // Mưa là yếu tố quan trọng nhất (-40 điểm nếu mưa > 60%)
    if (rainProbability >= 80) score -= 50;
    else if (rainProbability >= 60) score -= 35;
    else if (rainProbability >= 40) score -= 20;
    else if (rainProbability >= 20) score -= 10;

    // Nhiệt độ quá cao hoặc thấp (-20 điểm)
    if (temperature > 35 || temperature < 15) score -= 20;
    else if (temperature > 32 || temperature < 18) score -= 10;

    // Độ ẩm không lý tưởng (-15 điểm)
    if (humidity > 90 || humidity < 30) score -= 15;
    else if (humidity > 80 || humidity < 40) score -= 8;

    // Gió mạnh (-15 điểm)
    if (windSpeed > 30) score -= 15;
    else if (windSpeed > 20) score -= 8;

    score = Math.max(0, Math.min(100, score));

    const isGreenLight = score >= 55;

    return {
        score,
        isGreenLight,
        label: isGreenLight ? 'Thời tiết ủng hộ' : 'Rủi ro cao',
        sublabel: isGreenLight
            ? 'Điều kiện tốt để canh tác'
            : 'Nên hoãn các công việc ngoài trời',
        recommendation: isGreenLight
            ? 'Mang phân đi bón ngay, trời đẹp lắm!'
            : 'Ở nhà thôi, đừng làm gì tốn tiền hôm nay.'
    };
};

const FarmingIndexCard: React.FC<FarmingIndexCardProps> = ({
    onOpenStrategy,
    temperature = 28,
    humidity = 72,
    rainProbability = 25,
    windSpeed = 8
}) => {
    const farmingIndex = calculateFarmingIndex(rainProbability, temperature, humidity, windSpeed);
    const isGreen = farmingIndex.isGreenLight;

    return (
        <button
            onClick={onOpenStrategy}
            className={`relative w-full overflow-hidden rounded-[2rem] p-6 text-left shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group ${isGreen
                    ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600'
                    : 'bg-gradient-to-br from-red-500 via-rose-500 to-orange-600'
                }`}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl animate-pulse ${isGreen ? 'bg-yellow-300' : 'bg-orange-300'
                    }`} style={{ transform: 'translate(30%, -30%)' }} />
                <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl animate-pulse ${isGreen ? 'bg-cyan-300' : 'bg-red-300'
                    }`} style={{ transform: 'translate(-30%, 30%)', animationDelay: '1s' }} />
            </div>

            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-soft-light" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-xl border shadow-lg ${isGreen
                                ? 'bg-white/20 border-white/30 text-white'
                                : 'bg-black/20 border-white/20 text-white'
                            }`}>
                            {isGreen ? (
                                <>
                                    <div className="h-3 w-3 rounded-full bg-green-300 animate-pulse shadow-lg shadow-green-400/50" />
                                    <span>GO - ĐI LÀM</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-3 w-3 rounded-full bg-red-300 animate-pulse shadow-lg shadow-red-400/50" />
                                    <span>STOP - NGHỈ</span>
                                </>
                            )}
                        </div>

                        {/* Main Label */}
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-white drop-shadow-lg">
                            {farmingIndex.label}
                        </h2>
                        <p className="text-sm text-white/80 mt-1 font-medium">
                            {farmingIndex.sublabel}
                        </p>
                    </div>

                    {/* Large Icon */}
                    <div className={`h-20 w-20 flex items-center justify-center rounded-3xl backdrop-blur-xl shadow-2xl ${isGreen ? 'bg-white/20' : 'bg-black/20'
                        }`}>
                        {isGreen ? (
                            <Sun className="h-12 w-12 text-yellow-300 drop-shadow-lg animate-pulse" />
                        ) : (
                            <CloudRain className="h-12 w-12 text-white drop-shadow-lg" />
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-2 text-white/90">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-sm font-bold">{temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm font-bold">{humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                        <Wind className="h-4 w-4" />
                        <span className="text-sm font-bold">{windSpeed} km/h</span>
                    </div>
                </div>

                {/* Recommendation Box */}
                <div className={`rounded-2xl p-4 backdrop-blur-xl border ${isGreen
                        ? 'bg-black/20 border-white/10'
                        : 'bg-black/30 border-white/10'
                    }`}>
                    <div className="flex gap-3">
                        {isGreen ? (
                            <CheckCircle2 className="h-5 w-5 text-green-300 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-300 shrink-0 mt-0.5 animate-pulse" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white leading-tight">
                                {farmingIndex.recommendation}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Footer */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                        <Sparkles className="h-3 w-3" />
                        <span>Chỉ số canh tác: {farmingIndex.score}/100</span>
                    </div>
                    <div className="flex items-center gap-1 text-white font-bold text-sm group-hover:gap-2 transition-all">
                        <span>Xem lịch 3 ngày</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isGreen
                    ? 'bg-gradient-to-t from-white/10 to-transparent'
                    : 'bg-gradient-to-t from-white/5 to-transparent'
                }`} />
        </button>
    );
};

export default FarmingIndexCard;
