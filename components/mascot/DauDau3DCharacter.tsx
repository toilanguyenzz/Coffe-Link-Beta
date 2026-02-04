/**
 * DauDau3DCharacter.tsx
 * 
 * Standalone 3D character component for Đậu Đậu mascot.
 * Can be used independently anywhere in the app with responsive sizing.
 * 
 * Features:
 * - True 3D perspective with depth layers
 * - Responsive sizing (sm, md, lg, xl, full)
 * - Interactive hover/tap effects
 * - Mood-based animations and visual effects
 * - Standalone or embedded mode
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MASCOT_IMAGES, MascotMood } from '../../services/MascotService';

// Size presets
const SIZE_PRESETS = {
    sm: 48,
    md: 72,
    lg: 96,
    xl: 128,
    full: '100%',
} as const;

type SizePreset = keyof typeof SIZE_PRESETS;

interface DauDau3DCharacterProps {
    /** Current mood state */
    mood: MascotMood;
    /** Size - preset name or number in pixels */
    size?: SizePreset | number;
    /** Enable tap/hover interactions */
    interactive?: boolean;
    /** Show mood effects (sparkles, Z's, stars) */
    showEffects?: boolean;
    /** Show ground shadow */
    showShadow?: boolean;
    /** Show aura glow */
    showAura?: boolean;
    /** Tap callback */
    onTap?: () => void;
    /** Additional CSS class */
    className?: string;
    /** Enable floating animation */
    animate?: boolean;
}

const DauDau3DCharacter: React.FC<DauDau3DCharacterProps> = ({
    mood,
    size = 'md',
    interactive = true,
    showEffects = true,
    showShadow = true,
    showAura = true,
    onTap,
    className = '',
    animate = true,
}) => {
    const [tapScale, setTapScale] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate size
    const computedSize = useMemo(() => {
        if (typeof size === 'number') return size;
        return SIZE_PRESETS[size];
    }, [size]);

    const numericSize = typeof computedSize === 'number' ? computedSize : 128;

    // Preload image
    useEffect(() => {
        const img = new Image();
        img.src = MASCOT_IMAGES[mood];
        img.onload = () => setIsLoaded(true);
    }, [mood]);

    // Handle tap with bounce
    const handleTap = () => {
        if (!interactive) return;

        setTapScale(0.85);
        setTimeout(() => setTapScale(1.12), 100);
        setTimeout(() => setTapScale(0.95), 180);
        setTimeout(() => setTapScale(1), 260);
        onTap?.();
    };

    // Get animation class based on mood
    const getAnimationClass = (): string => {
        if (!animate) return '';

        switch (mood) {
            case 'happy': return 'daudau3d-float';
            case 'sad': return 'daudau3d-droop';
            case 'panic': return 'daudau3d-shake';
            case 'sleepy': return 'daudau3d-sway';
            case 'excited': return 'daudau3d-jump';
            case 'dizzy': return 'daudau3d-spin';
            default: return 'daudau3d-idle';
        }
    };

    // Get aura color based on mood
    const getAuraColor = () => {
        const colors: Record<MascotMood, string> = {
            happy: 'rgba(34, 197, 94, 0.6)',
            excited: 'rgba(251, 191, 36, 0.7)',
            sad: 'rgba(107, 114, 128, 0.4)',
            panic: 'rgba(239, 68, 68, 0.7)',
            sleepy: 'rgba(99, 102, 241, 0.5)',
            dizzy: 'rgba(168, 85, 247, 0.6)',
            idle: 'rgba(34, 197, 94, 0.4)',
        };
        return colors[mood] || colors.idle;
    };

    // Get body glow intensity
    const getGlowIntensity = () => {
        if (mood === 'panic' || mood === 'excited') return 1;
        if (mood === 'happy') return 0.8;
        return 0.5;
    };

    return (
        <div
            ref={containerRef}
            className={`daudau3d-container ${className}`}
            style={{
                width: computedSize,
                height: computedSize,
                perspective: '300px',
                perspectiveOrigin: 'center 60%',
            }}
            onClick={handleTap}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 3D Scene */}
            <div
                className={`daudau3d-scene ${getAnimationClass()}`}
                style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: `scale(${tapScale}) ${isHovered && interactive ? 'translateZ(10px)' : ''}`,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Dynamic Shadow on Ground */}
                {showShadow && (
                    <div
                        className="daudau3d-shadow"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            width: numericSize * 0.65,
                            height: numericSize * 0.12,
                            transform: 'translateX(-50%) rotateX(90deg) translateZ(-2px)',
                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(3px)',
                        }}
                    />
                )}

                {/* Aura/Glow Layer */}
                {showAura && (
                    <div
                        className="daudau3d-aura"
                        style={{
                            position: 'absolute',
                            inset: -numericSize * 0.15,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${getAuraColor()} 0%, transparent 70%)`,
                            opacity: getGlowIntensity(),
                            filter: 'blur(12px)',
                            animation: mood === 'panic'
                                ? 'aura-pulse 0.5s ease-in-out infinite'
                                : 'aura-breathe 3s ease-in-out infinite',
                            transform: 'translateZ(-20px)',
                        }}
                    />
                )}

                {/* Main Character Body */}
                <div
                    className="daudau3d-body"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Character Image */}
                    <img
                        src={MASCOT_IMAGES[mood]}
                        alt={`Đậu Đậu - ${mood}`}
                        className={`daudau3d-image ${isLoaded ? 'loaded' : ''}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.25)) 
                                     drop-shadow(0 2px 4px rgba(0,0,0,0.15))`,
                            transition: 'filter 0.3s ease, opacity 0.4s ease',
                            opacity: isLoaded ? 1 : 0,
                            transform: 'translateZ(10px)',
                        }}
                        draggable={false}
                    />
                </div>

                {/* Mood Effects */}
                {showEffects && (
                    <>
                        {/* Panic indicator */}
                        {mood === 'panic' && (
                            <div
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce"
                                style={{
                                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.9)',
                                    transform: 'translateZ(20px)',
                                }}
                            >
                                <span className="text-white text-sm font-bold">!</span>
                            </div>
                        )}

                        {/* Dizzy stars */}
                        {mood === 'dizzy' && (
                            <div
                                className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2"
                                style={{ transform: 'translateZ(25px)' }}
                            >
                                {[...Array(3)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="text-yellow-400"
                                        style={{
                                            fontSize: Math.max(14, numericSize * 0.2),
                                            animation: `orbit-star 1.2s linear infinite`,
                                            animationDelay: `${i * 0.4}s`,
                                            textShadow: '0 0 8px rgba(250, 204, 21, 0.8)',
                                        }}
                                    >
                                        ⭐
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Sleepy Z's */}
                        {mood === 'sleepy' && (
                            <div
                                className="absolute -top-3 -right-2"
                                style={{ transform: 'translateZ(25px)' }}
                            >
                                <span
                                    className="text-indigo-400 font-bold"
                                    style={{
                                        fontSize: Math.max(18, numericSize * 0.25),
                                        animation: 'float-z 2.5s ease-in-out infinite',
                                        textShadow: '0 0 10px rgba(99, 102, 241, 0.6)',
                                    }}
                                >
                                    Z
                                </span>
                                <span
                                    className="absolute -top-4 left-4 text-indigo-300 font-bold"
                                    style={{
                                        fontSize: Math.max(12, numericSize * 0.15),
                                        animation: 'float-z 2.5s ease-in-out infinite',
                                        animationDelay: '0.7s',
                                    }}
                                >
                                    z
                                </span>
                            </div>
                        )}

                        {/* Excited sparkles */}
                        {mood === 'excited' && (
                            <>
                                <span
                                    className="absolute -top-2 -left-2"
                                    style={{
                                        fontSize: Math.max(16, numericSize * 0.22),
                                        animation: 'sparkle-pop 0.6s ease-out infinite',
                                        transform: 'translateZ(25px)',
                                    }}
                                >
                                    ✨
                                </span>
                                <span
                                    className="absolute -top-2 -right-2"
                                    style={{
                                        fontSize: Math.max(16, numericSize * 0.22),
                                        animation: 'sparkle-pop 0.6s ease-out infinite',
                                        animationDelay: '0.3s',
                                        transform: 'translateZ(25px)',
                                    }}
                                >
                                    ✨
                                </span>
                                <span
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                                    style={{
                                        fontSize: Math.max(14, numericSize * 0.18),
                                        animation: 'sparkle-pop 0.6s ease-out infinite',
                                        animationDelay: '0.15s',
                                        transform: 'translateZ(25px)',
                                    }}
                                >
                                    🎉
                                </span>
                            </>
                        )}

                        {/* Happy hearts */}
                        {mood === 'happy' && (
                            <span
                                className="absolute -top-2 -right-1 text-green-400"
                                style={{
                                    fontSize: Math.max(14, numericSize * 0.18),
                                    animation: 'float-heart 2.5s ease-out infinite',
                                    transform: 'translateZ(25px)',
                                }}
                            >
                                💚
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* 3D CSS Animations */}
            <style>{`
                .daudau3d-container {
                    cursor: ${interactive ? 'pointer' : 'default'};
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                .daudau3d-scene {
                    position: relative;
                    will-change: transform;
                }

                .daudau3d-image.loaded {
                    animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* 3D Float - Happy */
                @keyframes daudau3d-float-anim {
                    0%, 100% { 
                        transform: translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0); 
                    }
                    25% { 
                        transform: translateY(-8px) rotateX(-4deg) rotateY(3deg) translateZ(5px); 
                    }
                    50% { 
                        transform: translateY(-14px) rotateX(0deg) rotateY(0deg) translateZ(8px); 
                    }
                    75% { 
                        transform: translateY(-8px) rotateX(4deg) rotateY(-3deg) translateZ(5px); 
                    }
                }
                .daudau3d-float { animation: daudau3d-float-anim 2.8s ease-in-out infinite; }

                /* 3D Droop - Sad */
                @keyframes daudau3d-droop-anim {
                    0%, 100% { 
                        transform: translateY(0) rotateX(12deg) rotateZ(-3deg); 
                    }
                    50% { 
                        transform: translateY(5px) rotateX(18deg) rotateZ(3deg); 
                    }
                }
                .daudau3d-droop { animation: daudau3d-droop-anim 3.5s ease-in-out infinite; }

                /* 3D Shake - Panic */
                @keyframes daudau3d-shake-anim {
                    0%, 100% { transform: translateX(0) rotateY(0deg) translateZ(0); }
                    10% { transform: translateX(-5px) rotateY(-8deg) translateZ(3px); }
                    20% { transform: translateX(5px) rotateY(8deg) translateZ(3px); }
                    30% { transform: translateX(-5px) rotateY(-8deg) translateZ(3px); }
                    40% { transform: translateX(5px) rotateY(8deg) translateZ(3px); }
                    50% { transform: translateX(-3px) rotateY(-4deg) translateZ(2px); }
                    60% { transform: translateX(3px) rotateY(4deg) translateZ(2px); }
                    70% { transform: translateX(-3px) rotateY(-4deg) translateZ(2px); }
                    80% { transform: translateX(3px) rotateY(4deg) translateZ(2px); }
                    90% { transform: translateX(-1px) rotateY(-2deg) translateZ(1px); }
                }
                .daudau3d-shake { animation: daudau3d-shake-anim 0.5s ease-in-out infinite; }

                /* 3D Sway - Sleepy */
                @keyframes daudau3d-sway-anim {
                    0%, 100% { 
                        transform: rotateZ(-6deg) rotateX(8deg) translateY(0); 
                    }
                    50% { 
                        transform: rotateZ(6deg) rotateX(-5deg) translateY(3px); 
                    }
                }
                .daudau3d-sway { animation: daudau3d-sway-anim 4s ease-in-out infinite; }

                /* 3D Jump - Excited */
                @keyframes daudau3d-jump-anim {
                    0%, 100% { 
                        transform: translateY(0) scale(1) rotateX(0deg) translateZ(0); 
                    }
                    15% { 
                        transform: translateY(3px) scale(0.92) rotateX(8deg) translateZ(-5px); 
                    }
                    35% { 
                        transform: translateY(-20px) scale(1.08) rotateX(-15deg) translateZ(15px); 
                    }
                    55% { 
                        transform: translateY(-10px) scale(1.04) rotateX(-8deg) translateZ(8px); 
                    }
                    75% { 
                        transform: translateY(-3px) scale(1) rotateX(0deg) translateZ(2px); 
                    }
                }
                .daudau3d-jump { animation: daudau3d-jump-anim 0.8s ease-out infinite; }

                /* 3D Spin - Dizzy */
                @keyframes daudau3d-spin-anim {
                    0% { transform: rotateY(0deg) rotateZ(0deg) translateZ(5px); }
                    25% { transform: rotateY(90deg) rotateZ(8deg) translateZ(10px); }
                    50% { transform: rotateY(180deg) rotateZ(0deg) translateZ(5px); }
                    75% { transform: rotateY(270deg) rotateZ(-8deg) translateZ(10px); }
                    100% { transform: rotateY(360deg) rotateZ(0deg) translateZ(5px); }
                }
                .daudau3d-spin { animation: daudau3d-spin-anim 2.2s linear infinite; }

                /* 3D Idle */
                @keyframes daudau3d-idle-anim {
                    0%, 100% { 
                        transform: translateY(0) rotateX(0deg) translateZ(0); 
                    }
                    50% { 
                        transform: translateY(-5px) rotateX(-3deg) translateZ(4px); 
                    }
                }
                .daudau3d-idle { animation: daudau3d-idle-anim 4.5s ease-in-out infinite; }

                /* Aura animations */
                @keyframes aura-breathe {
                    0%, 100% { transform: scale(1) translateZ(-20px); opacity: 0.5; }
                    50% { transform: scale(1.15) translateZ(-20px); opacity: 0.8; }
                }
                @keyframes aura-pulse {
                    0%, 100% { transform: scale(1) translateZ(-20px); opacity: 0.9; }
                    50% { transform: scale(1.25) translateZ(-20px); opacity: 0.4; }
                }

                /* Supporting animations */
                @keyframes pop-in {
                    0% { transform: scale(0.5) translateZ(10px); opacity: 0; }
                    100% { transform: scale(1) translateZ(10px); opacity: 1; }
                }

                @keyframes orbit-star {
                    0% { transform: rotate(0deg) translateX(10px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
                }

                @keyframes float-z {
                    0%, 100% { 
                        transform: translateY(0) scale(1); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateY(-16px) scale(1.3); 
                        opacity: 0.5; 
                    }
                }

                @keyframes sparkle-pop {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg) translateZ(25px); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: scale(1.5) rotate(180deg) translateZ(25px); 
                        opacity: 0.6; 
                    }
                }

                @keyframes float-heart {
                    0% { 
                        transform: translateY(0) scale(0) translateZ(25px); 
                        opacity: 1; 
                    }
                    40% { 
                        transform: translateY(-12px) scale(1) translateZ(25px); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(-35px) scale(0.6) translateZ(25px); 
                        opacity: 0; 
                    }
                }

                /* Shadow sync for floating modes */
                .daudau3d-float .daudau3d-shadow {
                    animation: shadow-sync-float 2.8s ease-in-out infinite;
                }
                @keyframes shadow-sync-float {
                    0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(1) rotateX(90deg) translateZ(-2px); }
                    50% { opacity: 0.2; transform: translateX(-50%) scale(0.7) rotateX(90deg) translateZ(-2px); }
                }

                .daudau3d-jump .daudau3d-shadow {
                    animation: shadow-sync-jump 0.8s ease-out infinite;
                }
                @keyframes shadow-sync-jump {
                    0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(1) rotateX(90deg) translateZ(-2px); }
                    35% { opacity: 0.1; transform: translateX(-50%) scale(0.4) rotateX(90deg) translateZ(-2px); }
                    55% { opacity: 0.15; transform: translateX(-50%) scale(0.6) rotateX(90deg) translateZ(-2px); }
                }
            `}</style>
        </div>
    );
};

export default DauDau3DCharacter;
