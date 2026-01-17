import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CloudRain, Clock, MapPin, Umbrella } from 'lucide-react';

interface WeatherAlertBannerProps {
    isVisible?: boolean;
    onDismiss?: () => void;
    // Mock props - sẽ connect với Weather API thật sau
    minutesUntilRain?: number;
    alertType?: 'rain' | 'storm' | 'heat' | 'frost';
}

const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
    isVisible: propVisible,
    onDismiss,
    minutesUntilRain = 30,
    alertType = 'rain'
}) => {
    const [isVisible, setIsVisible] = useState(propVisible ?? false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Simulate random weather alert for demo
    useEffect(() => {
        // Demo: Show alert randomly (10% chance every 30 seconds)
        const checkForAlert = () => {
            if (!isDismissed && Math.random() < 0.1) {
                setIsVisible(true);
            }
        };

        const interval = setInterval(checkForAlert, 30000);
        return () => clearInterval(interval);
    }, [isDismissed]);

    // Update từ props
    useEffect(() => {
        if (propVisible !== undefined) {
            setIsVisible(propVisible);
        }
    }, [propVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        onDismiss?.();
        // Reset sau 5 phút
        setTimeout(() => setIsDismissed(false), 5 * 60 * 1000);
    };

    if (!isVisible) return null;

    const getAlertConfig = () => {
        switch (alertType) {
            case 'storm':
                return {
                    gradient: 'from-purple-600 via-indigo-600 to-violet-700',
                    icon: AlertTriangle,
                    title: 'CẢNH BÁO GIÔNG SÉT!',
                    message: `Giông sét đang tiến vào khu vực vườn. Tránh xa cây cao và nơi trống.`,
                    shadow: 'shadow-purple-500/30'
                };
            case 'heat':
                return {
                    gradient: 'from-orange-500 via-red-500 to-rose-600',
                    icon: AlertTriangle,
                    title: 'CẢNH BÁO NẮNG NÓNG!',
                    message: `Nhiệt độ sẽ lên 38°C trong 2 giờ tới. Cần tưới nước giữ ẩm cho cây.`,
                    shadow: 'shadow-orange-500/30'
                };
            case 'frost':
                return {
                    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
                    icon: AlertTriangle,
                    title: 'CẢNH BÁO SƯƠNG GIÁ!',
                    message: `Nhiệt độ sẽ xuống 10°C đêm nay. Che phủ cây non ngay.`,
                    shadow: 'shadow-cyan-500/30'
                };
            default:
                return {
                    gradient: 'from-red-500 via-rose-500 to-orange-600',
                    icon: CloudRain,
                    title: 'CẢNH BÁO MƯA GẤP!',
                    message: `Mưa to sẽ tới vườn bác trong ${minutesUntilRain} phút nữa. Nếu đang phơi cà phê, hãy thu gom hoặc che chắn ngay!`,
                    shadow: 'shadow-red-500/30'
                };
        }
    };

    const config = getAlertConfig();
    const Icon = config.icon;

    return (
        <div className={`fixed top-0 left-0 right-0 z-[3000] animate-in slide-in-from-top fade-in duration-500`}>
            <div className={`bg-gradient-to-r ${config.gradient} shadow-2xl ${config.shadow}`}>
                {/* Animated danger stripes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                        }}
                    />
                </div>

                {/* Pulsing glow */}
                <div className="absolute inset-0 bg-white/10 animate-pulse" />

                <div className="relative px-4 py-4 max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                        {/* Alert Icon */}
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
                            <Icon className="h-6 w-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest animate-pulse">
                                    🚨 {config.title}
                                </span>
                            </div>
                            <p className="text-white font-bold text-sm leading-relaxed">
                                {config.message}
                            </p>

                            {/* Meta info */}
                            <div className="flex items-center gap-3 mt-2 text-white/70 text-[10px] font-medium">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Vừa cập nhật</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>Khu vườn của bạn</span>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-2.5 rounded-xl bg-white text-red-600 text-xs font-black uppercase tracking-wide hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Umbrella className="h-4 w-4" />
                            Đã che chắn xong
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="py-2.5 px-4 rounded-xl bg-black/20 text-white text-xs font-bold uppercase tracking-wide hover:bg-black/30 transition-colors"
                        >
                            Bỏ qua
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherAlertBanner;
