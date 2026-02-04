/**
 * CommunityAlertButton.tsx
 * 
 * Nút "BÁO MƯA NGAY" - Tính năng Waze cho nông dân
 * Khi bấm, gửi cảnh báo cho nông dân trong bán kính 5km
 */

import React, { useState } from 'react';
import { Megaphone, Check, CloudRain, Loader2 } from 'lucide-react';
import { reportAlert, type AlertType } from '../../services/CommunityAlertService';

interface CommunityAlertButtonProps {
    userLat: number;
    userLng: number;
    userName: string;
    userId: string;
    onAlertSent?: () => void;
}

const CommunityAlertButton: React.FC<CommunityAlertButtonProps> = ({
    userLat,
    userLng,
    userName,
    userId,
    onAlertSent,
}) => {
    const [isReporting, setIsReporting] = useState(false);
    const [justReported, setJustReported] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const alertOptions: { type: AlertType; label: string; emoji: string; color: string }[] = [
        { type: 'rain', label: 'Mưa', emoji: '🌧️', color: '#3b82f6' },
        { type: 'storm', label: 'Bão/Giông', emoji: '⛈️', color: '#8b5cf6' },
        { type: 'hail', label: 'Mưa đá', emoji: '🧊', color: '#06b6d4' },
    ];

    const handleReport = async (type: AlertType) => {
        setIsReporting(true);
        setShowOptions(false);

        try {
            await reportAlert(type, userLat, userLng, userName, userId);

            setJustReported(true);
            onAlertSent?.();

            // Reset after 3 seconds
            setTimeout(() => {
                setJustReported(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to report alert:', error);
        } finally {
            setIsReporting(false);
        }
    };

    const handleMainButtonClick = () => {
        if (justReported || isReporting) return;
        setShowOptions(!showOptions);
    };

    return (
        <div className="relative">
            {/* Main Button */}
            <button
                onClick={handleMainButtonClick}
                disabled={isReporting || justReported}
                className={`
                    relative w-full py-4 px-6 rounded-2xl font-bold text-lg
                    flex items-center justify-center gap-3
                    transition-all duration-300 active:scale-95
                    ${justReported
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white'
                    }
                `}
                style={{
                    boxShadow: justReported
                        ? '0 0 30px rgba(34, 197, 94, 0.5)'
                        : '0 0 30px rgba(239, 68, 68, 0.4)',
                }}
            >
                {/* Animated rings when idle */}
                {!justReported && !isReporting && (
                    <>
                        <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-red-500" />
                        <span className="absolute inset-0 rounded-2xl animate-pulse opacity-30 bg-orange-500" />
                    </>
                )}

                {isReporting ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Đang gửi...</span>
                    </>
                ) : justReported ? (
                    <>
                        <Check className="w-6 h-6" />
                        <span>Đã báo cho bà con!</span>
                    </>
                ) : (
                    <>
                        <Megaphone className="w-6 h-6" />
                        <span>BÁO THỜI TIẾT NGAY</span>
                    </>
                )}
            </button>

            {/* Alert Type Options */}
            {showOptions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 flex gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    {alertOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => handleReport(option.type)}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-white flex flex-col items-center gap-1 transition-transform active:scale-95"
                            style={{
                                background: `${option.color}dd`,
                                border: `2px solid ${option.color}`,
                            }}
                        >
                            <span className="text-xl">{option.emoji}</span>
                            <span className="text-xs">{option.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Success ripple effect */}
            {justReported && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-full rounded-2xl bg-green-400 animate-ping opacity-30" />
                </div>
            )}
        </div>
    );
};

export default CommunityAlertButton;
