/**
 * DauDauSprite.tsx
 * 
 * Renders the Đậu Đậu mascot character with 3D CSS animations.
 * Features:
 * - Perspective-based 3D effects
 * - Smooth floating/bobbing motion
 * - Dynamic shadows that follow movement
 * - Mood-specific animations with smooth transitions
 */

import React, { useState, useEffect, useRef } from 'react';
import { MASCOT_IMAGES, MascotMood } from '../../services/MascotService';

interface DauDauSpriteProps {
    mood: MascotMood;
    size?: number;
    onClick?: () => void;
    className?: string;
    showShadow?: boolean;
}

const DauDauSprite: React.FC<DauDauSpriteProps> = ({
    mood,
    size = 72, // Increased from 64 for better visibility
    onClick,
    className = '',
    showShadow = true,
}) => {
    const [tapScale, setTapScale] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle image load
    useEffect(() => {
        const img = new Image();
        img.src = MASCOT_IMAGES[mood];
        img.onload = () => setIsLoaded(true);
    }, [mood]);

    // Handle tap animation with bounce effect
    const handleClick = () => {
        setTapScale(0.85);
        setTimeout(() => setTapScale(1.1), 100);
        setTimeout(() => setTapScale(1), 200);
        onClick?.();
    };

    // Get 3D animation class based on mood
    const get3DAnimationClass = (): string => {
        switch (mood) {
            case 'happy':
                return 'daudau-3d-float';
            case 'sad':
                return 'daudau-3d-droop';
            case 'panic':
                return 'daudau-3d-shake';
            case 'sleepy':
                return 'daudau-3d-sway';
            case 'excited':
                return 'daudau-3d-jump';
            case 'dizzy':
                return 'daudau-3d-spin';
            default:
                return 'daudau-3d-idle';
        }
    };

    // Get glow/aura color based on mood
    const getAuraStyle = () => {
        const colors: Record<MascotMood, string> = {
            happy: 'rgba(34, 197, 94, 0.5)',
            excited: 'rgba(251, 191, 36, 0.6)',
            sad: 'rgba(107, 114, 128, 0.4)',
            panic: 'rgba(239, 68, 68, 0.6)',
            sleepy: 'rgba(99, 102, 241, 0.4)',
            dizzy: 'rgba(168, 85, 247, 0.5)',
            idle: 'rgba(34, 197, 94, 0.3)',
        };
        return colors[mood] || colors.idle;
    };

    return (
        <div
            ref={containerRef}
            className={`daudau-3d-container ${className}`}
            style={{
                width: size,
                height: size,
                perspective: '200px',
                perspectiveOrigin: 'center center',
            }}
            onClick={handleClick}
        >
            {/* 3D Transform wrapper */}
            <div
                className={`daudau-3d-wrapper ${get3DAnimationClass()}`}
                style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: `scale(${tapScale})`,
                    transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Dynamic 3D Shadow */}
                {showShadow && (
                    <div
                        className="daudau-shadow"
                        style={{
                            position: 'absolute',
                            bottom: -4,
                            left: '50%',
                            width: size * 0.7,
                            height: size * 0.15,
                            transform: 'translateX(-50%)',
                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(2px)',
                        }}
                    />
                )}

                {/* Aura/Glow effect */}
                <div
                    className="daudau-aura"
                    style={{
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${getAuraStyle()} 0%, transparent 70%)`,
                        opacity: mood === 'panic' || mood === 'excited' ? 0.9 : 0.6,
                        filter: 'blur(8px)',
                        animation: mood === 'panic' ? 'pulse-aura 0.5s ease-in-out infinite' : 'breathe-aura 3s ease-in-out infinite',
                    }}
                />

                {/* Main character with 3D transform */}
                <div
                    className="daudau-character"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <img
                        src={MASCOT_IMAGES[mood]}
                        alt={`Đậu Đậu - ${mood}`}
                        className={`daudau-image ${isLoaded ? 'loaded' : ''}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                            transition: 'filter 0.3s ease, opacity 0.3s ease',
                            opacity: isLoaded ? 1 : 0,
                        }}
                        draggable={false}
                    />
                </div>

                {/* Panic warning indicator */}
                {mood === 'panic' && (
                    <div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-20 animate-bounce"
                        style={{
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
                        }}
                    >
                        <span className="text-white text-xs font-bold">!</span>
                    </div>
                )}

                {/* Dizzy stars */}
                {mood === 'dizzy' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {[...Array(3)].map((_, i) => (
                            <span
                                key={i}
                                className="text-yellow-400 drop-shadow-lg"
                                style={{
                                    fontSize: '14px',
                                    animation: `orbit-star 1.2s linear infinite`,
                                    animationDelay: `${i * 0.4}s`,
                                }}
                            >
                                ⭐
                            </span>
                        ))}
                    </div>
                )}

                {/* Z's for sleepy */}
                {mood === 'sleepy' && (
                    <div className="absolute -top-2 -right-1">
                        <span
                            className="text-indigo-400 font-bold text-lg drop-shadow-md"
                            style={{
                                animation: 'float-z 2.5s ease-in-out infinite',
                            }}
                        >
                            Z
                        </span>
                        <span
                            className="text-indigo-300 font-bold text-sm absolute -top-3 left-3 drop-shadow-md"
                            style={{
                                animation: 'float-z 2.5s ease-in-out infinite',
                                animationDelay: '0.7s',
                            }}
                        >
                            z
                        </span>
                    </div>
                )}

                {/* Sparkles for excited */}
                {mood === 'excited' && (
                    <>
                        <span
                            className="absolute -top-2 -left-2 drop-shadow-lg"
                            style={{
                                fontSize: '16px',
                                animation: 'sparkle-pop 0.6s ease-out infinite'
                            }}
                        >
                            ✨
                        </span>
                        <span
                            className="absolute -top-2 -right-2 drop-shadow-lg"
                            style={{
                                fontSize: '16px',
                                animation: 'sparkle-pop 0.6s ease-out infinite',
                                animationDelay: '0.3s'
                            }}
                        >
                            ✨
                        </span>
                        <span
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 drop-shadow-lg"
                            style={{
                                fontSize: '12px',
                                animation: 'sparkle-pop 0.6s ease-out infinite',
                                animationDelay: '0.15s'
                            }}
                        >
                            🎉
                        </span>
                    </>
                )}

                {/* Happy hearts */}
                {mood === 'happy' && Math.random() > 0.5 && (
                    <span
                        className="absolute -top-2 -right-1 text-pink-400"
                        style={{
                            fontSize: '14px',
                            animation: 'float-heart 2s ease-out forwards',
                        }}
                    >
                        💚
                    </span>
                )}
            </div>

            {/* 3D CSS Animations */}
            <style>{`
                /* Base container styles */
                .daudau-3d-container {
                    cursor: pointer;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                .daudau-3d-wrapper {
                    position: relative;
                    will-change: transform;
                }

                .daudau-image.loaded {
                    animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* 3D Float animation - Happy */
                @keyframes daudau-float {
                    0%, 100% { 
                        transform: translateY(0) rotateX(0deg) rotateY(0deg); 
                    }
                    25% { 
                        transform: translateY(-6px) rotateX(-3deg) rotateY(2deg); 
                    }
                    50% { 
                        transform: translateY(-10px) rotateX(0deg) rotateY(0deg); 
                    }
                    75% { 
                        transform: translateY(-6px) rotateX(3deg) rotateY(-2deg); 
                    }
                }
                .daudau-3d-float { animation: daudau-float 2.5s ease-in-out infinite; }

                /* 3D Droop animation - Sad */
                @keyframes daudau-droop {
                    0%, 100% { 
                        transform: translateY(0) rotateX(10deg) rotateZ(-2deg); 
                    }
                    50% { 
                        transform: translateY(3px) rotateX(15deg) rotateZ(2deg); 
                    }
                }
                .daudau-3d-droop { animation: daudau-droop 3s ease-in-out infinite; }

                /* 3D Shake animation - Panic */
                @keyframes daudau-shake {
                    0%, 100% { transform: translateX(0) rotateY(0deg); }
                    10% { transform: translateX(-4px) rotateY(-5deg); }
                    20% { transform: translateX(4px) rotateY(5deg); }
                    30% { transform: translateX(-4px) rotateY(-5deg); }
                    40% { transform: translateX(4px) rotateY(5deg); }
                    50% { transform: translateX(-2px) rotateY(-3deg); }
                    60% { transform: translateX(2px) rotateY(3deg); }
                    70% { transform: translateX(-2px) rotateY(-3deg); }
                    80% { transform: translateX(2px) rotateY(3deg); }
                    90% { transform: translateX(-1px) rotateY(-1deg); }
                }
                .daudau-3d-shake { animation: daudau-shake 0.6s ease-in-out infinite; }

                /* 3D Sway animation - Sleepy */
                @keyframes daudau-sway {
                    0%, 100% { 
                        transform: rotateZ(-5deg) rotateX(5deg) translateY(0); 
                    }
                    50% { 
                        transform: rotateZ(5deg) rotateX(-5deg) translateY(2px); 
                    }
                }
                .daudau-3d-sway { animation: daudau-sway 3.5s ease-in-out infinite; }

                /* 3D Jump animation - Excited */
                @keyframes daudau-jump {
                    0%, 100% { 
                        transform: translateY(0) scale(1) rotateX(0deg); 
                    }
                    20% { 
                        transform: translateY(2px) scale(0.95) rotateX(5deg); 
                    }
                    40% { 
                        transform: translateY(-15px) scale(1.05) rotateX(-10deg); 
                    }
                    60% { 
                        transform: translateY(-8px) scale(1.02) rotateX(-5deg); 
                    }
                    80% { 
                        transform: translateY(-2px) scale(1) rotateX(0deg); 
                    }
                }
                .daudau-3d-jump { animation: daudau-jump 0.7s ease-out infinite; }

                /* 3D Spin animation - Dizzy */
                @keyframes daudau-spin {
                    0% { transform: rotateY(0deg) rotateZ(0deg); }
                    25% { transform: rotateY(90deg) rotateZ(5deg); }
                    50% { transform: rotateY(180deg) rotateZ(0deg); }
                    75% { transform: rotateY(270deg) rotateZ(-5deg); }
                    100% { transform: rotateY(360deg) rotateZ(0deg); }
                }
                .daudau-3d-spin { animation: daudau-spin 2s linear infinite; }

                /* 3D Idle animation */
                @keyframes daudau-idle {
                    0%, 100% { 
                        transform: translateY(0) rotateX(0deg); 
                    }
                    50% { 
                        transform: translateY(-4px) rotateX(-2deg); 
                    }
                }
                .daudau-3d-idle { animation: daudau-idle 4s ease-in-out infinite; }

                /* Aura animations */
                @keyframes breathe-aura {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
                @keyframes pulse-aura {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0.4; }
                }

                /* Supporting animations */
                @keyframes pop-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @keyframes orbit-star {
                    0% { transform: rotate(0deg) translateX(8px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(8px) rotate(-360deg); }
                }

                @keyframes float-z {
                    0%, 100% { 
                        transform: translateY(0) scale(1); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateY(-12px) scale(1.2); 
                        opacity: 0.6; 
                    }
                }

                @keyframes sparkle-pop {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: scale(1.4) rotate(180deg); 
                        opacity: 0.7; 
                    }
                }

                @keyframes float-heart {
                    0% { 
                        transform: translateY(0) scale(0); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateY(-15px) scale(1); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(-30px) scale(0.5); 
                        opacity: 0; 
                    }
                }

                /* Shadow animation sync */
                .daudau-3d-float .daudau-shadow {
                    animation: shadow-float 2.5s ease-in-out infinite;
                }
                @keyframes shadow-float {
                    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
                    50% { transform: translateX(-50%) scale(0.8); opacity: 0.2; }
                }

                .daudau-3d-jump .daudau-shadow {
                    animation: shadow-jump 0.7s ease-out infinite;
                }
                @keyframes shadow-jump {
                    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
                    40% { transform: translateX(-50%) scale(0.5); opacity: 0.15; }
                    60% { transform: translateX(-50%) scale(0.7); opacity: 0.2; }
                }
            `}</style>
        </div>
    );
};

export default DauDauSprite;
