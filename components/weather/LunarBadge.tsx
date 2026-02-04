/**
 * LunarBadge.tsx
 * 
 * Hiển thị ngày Âm Lịch và lời khuyên theo pha trăng
 * Badge nhỏ gọn, thường đặt ở góc màn hình
 */

import React from 'react';
import { Moon } from 'lucide-react';
import { getLunarDate, getMoonPhase, getMoonPhaseAdvice, formatLunarDate } from '../../services/LunarCalendarService';

interface LunarBadgeProps {
    showAdvice?: boolean;
    compact?: boolean;
}

const LunarBadge: React.FC<LunarBadgeProps> = ({ showAdvice = false, compact = false }) => {
    const lunarDate = getLunarDate();
    const moonPhase = getMoonPhase(lunarDate.day);
    const advice = getMoonPhaseAdvice(lunarDate.day);
    const primaryAdvice = advice[0];

    if (compact) {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <span className="text-base">{moonPhase.icon}</span>
                <span className="text-white text-xs font-medium">
                    {lunarDate.day} Â.L
                </span>
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl p-4"
            style={{
                background: 'rgba(30, 30, 60, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    <span className="text-2xl">{moonPhase.icon}</span>
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{formatLunarDate(lunarDate)}</p>
                    <p className="text-white/60 text-xs">{moonPhase.phaseName}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-white/40 text-[10px] uppercase font-bold">Độ sáng</p>
                    <p className="text-yellow-400 font-bold">{moonPhase.illumination}%</p>
                </div>
            </div>

            {/* Advice */}
            {showAdvice && primaryAdvice && (
                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: primaryAdvice.priority === 'high'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : primaryAdvice.priority === 'medium'
                                ? 'rgba(251, 191, 36, 0.2)'
                                : 'rgba(34, 197, 94, 0.2)',
                        border: `1px solid ${primaryAdvice.priority === 'high'
                            ? 'rgba(239, 68, 68, 0.3)'
                            : primaryAdvice.priority === 'medium'
                                ? 'rgba(251, 191, 36, 0.3)'
                                : 'rgba(34, 197, 94, 0.3)'}`,
                    }}
                >
                    <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{primaryAdvice.emoji}</span>
                        <div>
                            <p className="text-white font-bold text-xs mb-0.5">{primaryAdvice.title}</p>
                            <p className="text-white/70 text-xs leading-relaxed">{primaryAdvice.advice}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LunarBadge;
