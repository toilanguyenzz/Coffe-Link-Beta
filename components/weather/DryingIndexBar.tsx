/**
 * DryingIndexBar.tsx
 * 
 * Thanh "Chỉ số phơi sấy" - Harvest Optimizer
 * Hiển thị số ngày nắng liên tiếp và lời khuyên thu hoạch
 */

import React from 'react';
import { Sun, CloudRain, AlertTriangle, Sparkles } from 'lucide-react';
import { getDryingIndex, getHarvestAdvice, type DryingIndex, type HarvestAdvice } from '../../services/WeatherService';

interface DryingIndexBarProps {
    rainProbability: number;
    daysWithRain: number;
    compact?: boolean;
}

const DryingIndexBar: React.FC<DryingIndexBarProps> = ({
    rainProbability,
    daysWithRain,
    compact = false,
}) => {
    // Calculate drying index from forecast data
    const dryingIndex: DryingIndex = getDryingIndex({
        willRainIn3Days: rainProbability > 30,
        rainProbability,
        expectedRainfall: 0,
        daysWithRain,
    });

    const harvestAdvice: HarvestAdvice = getHarvestAdvice(dryingIndex);

    // Status colors
    const statusColors: Record<DryingIndex['status'], { bg: string; border: string; text: string; glow: string }> = {
        golden: {
            bg: 'rgba(234, 179, 8, 0.2)',
            border: 'rgba(234, 179, 8, 0.6)',
            text: '#fbbf24',
            glow: '0 0 20px rgba(234, 179, 8, 0.5)',
        },
        good: {
            bg: 'rgba(34, 197, 94, 0.2)',
            border: 'rgba(34, 197, 94, 0.6)',
            text: '#22c55e',
            glow: '0 0 15px rgba(34, 197, 94, 0.4)',
        },
        risky: {
            bg: 'rgba(251, 146, 60, 0.2)',
            border: 'rgba(251, 146, 60, 0.6)',
            text: '#fb923c',
            glow: '0 0 15px rgba(251, 146, 60, 0.4)',
        },
        danger: {
            bg: 'rgba(239, 68, 68, 0.2)',
            border: 'rgba(239, 68, 68, 0.6)',
            text: '#ef4444',
            glow: '0 0 20px rgba(239, 68, 68, 0.5)',
        },
    };

    const colors = statusColors[dryingIndex.status];

    if (compact) {
        return (
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                }}
            >
                <Sun className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-white text-xs font-medium">
                    {dryingIndex.consecutiveSunnyDays} ngày nắng
                </span>
                <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: colors.bg, color: colors.text }}
                >
                    {dryingIndex.statusLabel}
                </span>
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl p-4 overflow-hidden relative"
            style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${colors.border}`,
                boxShadow: colors.glow,
            }}
        >
            {/* Animated sparkles for golden status */}
            {dryingIndex.status === 'golden' && (
                <div className="absolute top-2 right-2 animate-pulse">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {dryingIndex.status === 'danger' ? (
                        <CloudRain className="w-5 h-5" style={{ color: colors.text }} />
                    ) : (
                        <Sun className="w-5 h-5" style={{ color: colors.text }} />
                    )}
                    <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                        Chỉ Số Phơi Sấy
                    </span>
                </div>
                <span
                    className="text-sm font-black px-3 py-1 rounded-full"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                    {dryingIndex.statusLabel}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-black/30 rounded-full mb-3 overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{
                        width: `${dryingIndex.indexScore}%`,
                        background: `linear-gradient(90deg, ${colors.text}, ${colors.text}aa)`,
                        boxShadow: `0 0 10px ${colors.text}`,
                    }}
                />
                {/* Sun icons representing sunny days */}
                <div className="absolute inset-0 flex items-center justify-around px-2">
                    {[0, 1, 2].map((day) => (
                        <Sun
                            key={day}
                            className={`w-2.5 h-2.5 transition-opacity ${day < dryingIndex.consecutiveSunnyDays
                                ? 'text-yellow-400 opacity-100'
                                : 'text-white/20 opacity-50'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Advice Card */}
            <div
                className="p-3 rounded-xl flex items-start gap-3"
                style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                }}
            >
                <span className="text-2xl flex-shrink-0">{harvestAdvice.emoji}</span>
                <div>
                    <p className="font-bold text-sm mb-0.5" style={{ color: colors.text }}>
                        {harvestAdvice.title}
                    </p>
                    <p className="text-white/70 text-xs leading-relaxed">
                        {harvestAdvice.message}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-white/50">
                <span>☀️ {dryingIndex.consecutiveSunnyDays} ngày nắng</span>
                <span>💧 {rainProbability}% khả năng mưa</span>
            </div>
        </div>
    );
};

export default DryingIndexBar;
