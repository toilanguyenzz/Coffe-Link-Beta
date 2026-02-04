/**
 * DauDauAnimated.tsx
 * 
 * Highly animated mascot component with lifelike animations.
 * Inspired by Akinator-style character interactions.
 * 
 * Features:
 * - Continuous idle breathing animation
 * - Periodic eye blink
 * - Reactive bounce on tap
 * - Mood-specific particle effects
 * - Smooth state transitions
 * - Wobble/sway motion
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MASCOT_IMAGES, MascotMood } from '../../services/MascotService';

// Size presets
const SIZE_PRESETS = {
    sm: 56,
    md: 80,
    lg: 120,
    xl: 160,
} as const;

type SizePreset = keyof typeof SIZE_PRESETS;

interface DauDauAnimatedProps {
    /** Current mood state */
    mood: MascotMood;
    /** Size preset or number in pixels */
    size?: SizePreset | number;
    /** Enable tap interactions */
    interactive?: boolean;
    /** Show particle effects */
    showEffects?: boolean;
    /** Tap callback */
    onTap?: () => void;
    /** Additional CSS class */
    className?: string;
}

// Particle configurations per mood
const MOOD_PARTICLES: Record<MascotMood, { emoji: string; count: number; animation: string }[]> = {
    happy: [
        { emoji: '💚', count: 2, animation: 'float-up' },
        { emoji: '✨', count: 3, animation: 'sparkle' },
    ],
    excited: [
        { emoji: '🎉', count: 2, animation: 'pop' },
        { emoji: '✨', count: 4, animation: 'sparkle' },
        { emoji: '⭐', count: 2, animation: 'orbit' },
    ],
    sad: [
        { emoji: '💧', count: 2, animation: 'drip' },
    ],
    panic: [
        { emoji: '⚠️', count: 1, animation: 'flash' },
        { emoji: '💦', count: 3, animation: 'sweat' },
    ],
    sleepy: [
        { emoji: 'Z', count: 3, animation: 'zzz' },
    ],
    dizzy: [
        { emoji: '⭐', count: 4, animation: 'orbit' },
        { emoji: '💫', count: 2, animation: 'spin' },
    ],
    idle: [
        { emoji: '✨', count: 1, animation: 'twinkle' },
    ],
};

const DauDauAnimated: React.FC<DauDauAnimatedProps> = ({
    mood,
    size = 'md',
    interactive = true,
    showEffects = true,
    onTap,
    className = '',
}) => {
    const [isBlinking, setIsBlinking] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);
    const [tapCount, setTapCount] = useState(0);
    const [showWow, setShowWow] = useState(false);

    // Compute size
    const computedSize = useMemo(() => {
        if (typeof size === 'number') return size;
        return SIZE_PRESETS[size];
    }, [size]);

    // Blink periodically
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            // Don't blink if sleepy (eyes already closed) or dizzy
            if (mood !== 'sleepy' && mood !== 'dizzy') {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(blinkInterval);
    }, [mood]);

    // Handle tap with bounce effect
    const handleTap = useCallback(() => {
        if (!interactive) return;

        setIsBouncing(true);
        setTapCount(prev => prev + 1);

        // Special effect every 5 taps
        if ((tapCount + 1) % 5 === 0) {
            setShowWow(true);
            setTimeout(() => setShowWow(false), 1000);
        }

        setTimeout(() => setIsBouncing(false), 400);
        onTap?.();
    }, [interactive, tapCount, onTap]);

    // Get mood-specific animation class
    const getMoodAnimation = (): string => {
        switch (mood) {
            case 'happy': return 'anim-happy-bounce';
            case 'sad': return 'anim-sad-droop';
            case 'panic': return 'anim-panic-shake';
            case 'sleepy': return 'anim-sleepy-sway';
            case 'excited': return 'anim-excited-jump';
            case 'dizzy': return 'anim-dizzy-wobble';
            default: return 'anim-idle-breathe';
        }
    };

    // Get mood-specific glow color
    const getMoodGlow = (): string => {
        switch (mood) {
            case 'happy': return 'rgba(34, 197, 94, 0.5)';
            case 'excited': return 'rgba(251, 191, 36, 0.6)';
            case 'sad': return 'rgba(107, 114, 128, 0.3)';
            case 'panic': return 'rgba(239, 68, 68, 0.6)';
            case 'sleepy': return 'rgba(99, 102, 241, 0.4)';
            case 'dizzy': return 'rgba(168, 85, 247, 0.5)';
            default: return 'rgba(34, 197, 94, 0.3)';
        }
    };

    return (
        <div
            className={`daudau-animated-container ${className}`}
            style={{
                width: computedSize,
                height: computedSize,
                position: 'relative',
            }}
            onClick={handleTap}
        >
            {/* Ambient glow */}
            <div
                className="daudau-glow"
                style={{
                    position: 'absolute',
                    inset: -computedSize * 0.2,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${getMoodGlow()} 0%, transparent 70%)`,
                    animation: mood === 'panic' ? 'glow-pulse 0.5s infinite' : 'glow-breathe 3s ease-in-out infinite',
                    pointerEvents: 'none',
                }}
            />

            {/* Grounding Shadow - ellipse under feet */}
            <div
                className="daudau-shadow"
                style={{
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: computedSize * 0.8,
                    height: computedSize * 0.2,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
                    filter: 'blur(3px)',
                    animation: getMoodAnimation().includes('jump') ? 'shadow-sync 0.6s ease-out infinite' : 'shadow-breathe 3s ease-in-out infinite',
                }}
            />

            {/* Main character body */}
            <div
                className={`daudau-body ${getMoodAnimation()} ${isBouncing ? 'anim-tap-bounce' : ''}`}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformOrigin: 'center bottom',
                }}
            >
                {/* Character image with warm sunny filter */}
                <img
                    src={MASCOT_IMAGES[mood]}
                    alt={`Đậu Đậu - ${mood}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        // Warm sunny filter + drop shadow for grounding
                        filter: `
                            drop-shadow(0 6px 16px rgba(0,0,0,0.3))
                            drop-shadow(0 2px 4px rgba(0,0,0,0.2))
                            brightness(1.05)
                            saturate(1.1)
                            sepia(0.08)
                        `,
                        transition: 'filter 0.3s ease',
                    }}
                    draggable={false}
                />

                {/* Blink overlay - simulates closing eyes */}
                {isBlinking && mood !== 'sleepy' && mood !== 'dizzy' && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '28%',
                            left: '20%',
                            right: '20%',
                            height: '15%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            width: computedSize * 0.18,
                            height: '100%',
                            background: 'linear-gradient(to bottom, #5D4037 0%, #4E342E 100%)',
                            borderRadius: '50%',
                            transform: 'scaleY(0.3)',
                        }} />
                        <div style={{
                            width: computedSize * 0.18,
                            height: '100%',
                            background: 'linear-gradient(to bottom, #5D4037 0%, #4E342E 100%)',
                            borderRadius: '50%',
                            transform: 'scaleY(0.3)',
                        }} />
                    </div>
                )}
            </div>

            {/* Particle effects */}
            {showEffects && MOOD_PARTICLES[mood]?.map((particle, pIdx) => (
                <React.Fragment key={pIdx}>
                    {[...Array(particle.count)].map((_, i) => (
                        <span
                            key={`${pIdx}-${i}`}
                            className={`daudau-particle particle-${particle.animation}`}
                            style={{
                                position: 'absolute',
                                fontSize: Math.max(12, computedSize * 0.2),
                                animationDelay: `${i * 0.3}s`,
                                left: `${20 + (i * 25)}%`,
                                top: particle.animation === 'zzz' ? '-10%' : '0%',
                                pointerEvents: 'none',
                            }}
                        >
                            {particle.emoji}
                        </span>
                    ))}
                </React.Fragment>
            ))}

            {/* Tap reaction - WOW effect */}
            {showWow && (
                <div
                    className="daudau-wow"
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: Math.max(16, computedSize * 0.25),
                        animation: 'wow-pop 1s ease-out forwards',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    ✨ WOW! ✨
                </div>
            )}

            {/* Tap ripple effect */}
            {isBouncing && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '3px solid rgba(255, 255, 255, 0.5)',
                        animation: 'ripple-out 0.4s ease-out forwards',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* CSS Animations */}
            <style>{`
                .daudau-animated-container {
                    cursor: ${interactive ? 'pointer' : 'default'};
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                /* === IDLE BREATHING === */
                @keyframes idle-breathe {
                    0%, 100% { 
                        transform: translateY(0) scale(1); 
                    }
                    50% { 
                        transform: translateY(-4px) scale(1.02); 
                    }
                }
                .anim-idle-breathe {
                    animation: idle-breathe 3s ease-in-out infinite;
                }

                /* === HAPPY BOUNCE === */
                @keyframes happy-bounce {
                    0%, 100% { 
                        transform: translateY(0) rotate(0deg); 
                    }
                    25% { 
                        transform: translateY(-8px) rotate(-3deg); 
                    }
                    50% { 
                        transform: translateY(-12px) rotate(0deg); 
                    }
                    75% { 
                        transform: translateY(-8px) rotate(3deg); 
                    }
                }
                .anim-happy-bounce {
                    animation: happy-bounce 1.5s ease-in-out infinite;
                }

                /* === SAD DROOP === */
                @keyframes sad-droop {
                    0%, 100% { 
                        transform: translateY(0) rotate(-2deg) scale(0.98); 
                    }
                    50% { 
                        transform: translateY(3px) rotate(2deg) scale(0.95); 
                    }
                }
                .anim-sad-droop {
                    animation: sad-droop 4s ease-in-out infinite;
                }

                /* === PANIC SHAKE === */
                @keyframes panic-shake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    10% { transform: translateX(-4px) rotate(-3deg); }
                    20% { transform: translateX(4px) rotate(3deg); }
                    30% { transform: translateX(-4px) rotate(-3deg); }
                    40% { transform: translateX(4px) rotate(3deg); }
                    50% { transform: translateX(-3px) rotate(-2deg); }
                    60% { transform: translateX(3px) rotate(2deg); }
                    70% { transform: translateX(-2px) rotate(-1deg); }
                    80% { transform: translateX(2px) rotate(1deg); }
                    90% { transform: translateX(-1px) rotate(0deg); }
                }
                .anim-panic-shake {
                    animation: panic-shake 0.5s linear infinite;
                }

                /* === SLEEPY SWAY === */
                @keyframes sleepy-sway {
                    0%, 100% { 
                        transform: rotate(-5deg) translateY(0); 
                    }
                    50% { 
                        transform: rotate(5deg) translateY(2px); 
                    }
                }
                .anim-sleepy-sway {
                    animation: sleepy-sway 4s ease-in-out infinite;
                }

                /* === EXCITED JUMP === */
                @keyframes excited-jump {
                    0%, 100% { 
                        transform: translateY(0) scale(1) rotate(0deg); 
                    }
                    20% { 
                        transform: translateY(3px) scale(0.95, 1.05) rotate(0deg); 
                    }
                    40% { 
                        transform: translateY(-20px) scale(1.05, 0.95) rotate(-5deg); 
                    }
                    60% { 
                        transform: translateY(-10px) scale(1) rotate(5deg); 
                    }
                    80% { 
                        transform: translateY(-5px) scale(1) rotate(-2deg); 
                    }
                }
                .anim-excited-jump {
                    animation: excited-jump 0.7s ease-out infinite;
                }

                /* === DIZZY WOBBLE === */
                @keyframes dizzy-wobble {
                    0% { transform: rotate(0deg) translateX(0); }
                    25% { transform: rotate(8deg) translateX(4px); }
                    50% { transform: rotate(-8deg) translateX(-4px); }
                    75% { transform: rotate(5deg) translateX(2px); }
                    100% { transform: rotate(0deg) translateX(0); }
                }
                .anim-dizzy-wobble {
                    animation: dizzy-wobble 1.5s ease-in-out infinite;
                }

                /* === TAP BOUNCE === */
                @keyframes tap-bounce {
                    0% { transform: scale(1); }
                    25% { transform: scale(0.85); }
                    50% { transform: scale(1.15); }
                    75% { transform: scale(0.95); }
                    100% { transform: scale(1); }
                }
                .anim-tap-bounce {
                    animation: tap-bounce 0.4s ease-out !important;
                }

                /* === GLOW EFFECTS === */
                @keyframes glow-breathe {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.9; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.2); }
                }

                /* === SHADOW EFFECTS === */
                @keyframes shadow-sync {
                    0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
                    40% { opacity: 0.15; transform: translateX(-50%) scale(0.5); }
                }
                @keyframes shadow-breathe {
                    0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
                    50% { opacity: 0.35; transform: translateX(-50%) scale(1.05); }
                }

                /* === PARTICLE ANIMATIONS === */
                @keyframes float-up {
                    0% { 
                        opacity: 1; 
                        transform: translateY(0) scale(0.5); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: translateY(-20px) scale(1); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-40px) scale(0.8); 
                    }
                }
                .particle-float-up {
                    animation: float-up 2s ease-out infinite;
                }

                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
                }
                .particle-sparkle {
                    animation: sparkle 1.5s ease-in-out infinite;
                }

                @keyframes pop {
                    0% { opacity: 0; transform: scale(0) translateY(0); }
                    50% { opacity: 1; transform: scale(1.3) translateY(-15px); }
                    100% { opacity: 0; transform: scale(0.8) translateY(-30px); }
                }
                .particle-pop {
                    animation: pop 1s ease-out infinite;
                }

                @keyframes drip {
                    0% { opacity: 0; transform: translateY(-10px); }
                    20% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(30px); }
                }
                .particle-drip {
                    animation: drip 2s ease-in infinite;
                }

                @keyframes flash {
                    0%, 50%, 100% { opacity: 1; transform: scale(1); }
                    25%, 75% { opacity: 0.3; transform: scale(0.9); }
                }
                .particle-flash {
                    animation: flash 0.5s ease-in-out infinite;
                }

                @keyframes sweat {
                    0% { opacity: 0; transform: translateY(0) translateX(0); }
                    30% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(20px) translateX(5px); }
                }
                .particle-sweat {
                    animation: sweat 1s ease-in infinite;
                }

                @keyframes zzz {
                    0% { 
                        opacity: 0; 
                        transform: translateY(0) translateX(0) scale(0.5); 
                    }
                    30% { 
                        opacity: 1; 
                        transform: translateY(-10px) translateX(5px) scale(1); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-30px) translateX(15px) scale(1.2); 
                    }
                }
                .particle-zzz {
                    animation: zzz 2.5s ease-out infinite;
                    font-weight: bold;
                    color: #6366F1;
                    text-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
                }

                @keyframes orbit {
                    0% { 
                        transform: rotate(0deg) translateX(15px) rotate(0deg); 
                    }
                    100% { 
                        transform: rotate(360deg) translateX(15px) rotate(-360deg); 
                    }
                }
                .particle-orbit {
                    animation: orbit 1.5s linear infinite;
                    top: -5% !important;
                    left: 50% !important;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); opacity: 1; }
                    100% { transform: rotate(360deg); opacity: 0.5; }
                }
                .particle-spin {
                    animation: spin 2s linear infinite;
                }

                @keyframes twinkle {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.8; }
                }
                .particle-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                    top: -15% !important;
                    left: 70% !important;
                }

                /* === WOW POP === */
                @keyframes wow-pop {
                    0% { 
                        opacity: 0; 
                        transform: translateX(-50%) scale(0) translateY(0); 
                    }
                    30% { 
                        opacity: 1; 
                        transform: translateX(-50%) scale(1.3) translateY(-10px); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateX(-50%) scale(0.8) translateY(-30px); 
                    }
                }

                /* === RIPPLE === */
                @keyframes ripple-out {
                    0% { 
                        transform: scale(0.8); 
                        opacity: 0.8; 
                    }
                    100% { 
                        transform: scale(1.5); 
                        opacity: 0; 
                    }
                }
            `}</style>
        </div>
    );
};

export default DauDauAnimated;
