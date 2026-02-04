/**
 * DauDauDialog.tsx
 * 
 * Modern HORIZONTAL speech bubble for Đậu Đậu mascot.
 * Features:
 * - Positioned to the LEFT of the mascot
 * - Horizontal layout (40-50% screen width)
 * - Glassmorphism design
 * - Tail pointing RIGHT toward the mascot
 * - Close (X) button
 * - Auto-dismiss after 6 seconds
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MascotMessage } from '../../services/MascotService';

interface DauDauDialogProps {
    message: MascotMessage | null;
    onDismiss?: () => void;
    /** If true, bubble stays until manually closed */
    persistent?: boolean;
}

const DauDauDialog: React.FC<DauDauDialogProps> = ({
    message,
    onDismiss,
    persistent = false,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Handle dismiss
    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss?.();
        }, 300);
    }, [onDismiss]);

    useEffect(() => {
        if (message) {
            // Enter animation
            setIsExiting(false);
            setTimeout(() => setIsVisible(true), 50);

            // Auto-dismiss after 6 seconds (unless persistent)
            if (!persistent) {
                const duration = message.duration || 6000;
                const exitTimer = setTimeout(() => {
                    handleDismiss();
                }, duration);

                return () => clearTimeout(exitTimer);
            }
        } else {
            setIsVisible(false);
        }
    }, [message, persistent, handleDismiss]);

    if (!message) return null;

    // Get accent color based on message type
    const getAccentColor = () => {
        switch (message.type) {
            case 'warning':
                return { accent: '#EF4444', bg: 'rgba(255, 250, 245, 0.95)' };
            case 'celebration':
                return { accent: '#10B981', bg: 'rgba(255, 252, 248, 0.95)' };
            case 'reminder':
                return { accent: '#F59E0B', bg: 'rgba(255, 253, 250, 0.95)' };
            case 'easter_egg':
                return { accent: '#8B5CF6', bg: 'rgba(255, 252, 255, 0.95)' };
            case 'secret_reward':
                return { accent: '#EAB308', bg: 'rgba(255, 253, 240, 0.98)' };
            default:
                return { accent: '#22C55E', bg: 'rgba(255, 255, 255, 0.95)' };
        }
    };

    const colors = getAccentColor();

    return (
        <div
            className={`
                absolute z-50
                transition-all duration-300 ease-out
                ${isVisible && !isExiting
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-4 scale-95'}
            `}
            style={{
                // Position to the LEFT of the mascot
                right: 'calc(100% + 8px)',
                top: '50%',
                transform: isVisible && !isExiting
                    ? 'translateY(-50%) translateX(0) scale(1)'
                    : 'translateY(-50%) translateX(16px) scale(0.95)',
                transformOrigin: 'right center',
                // Horizontal width: 40-50% screen or max 280px
                width: 'clamp(200px, 45vw, 280px)',
            }}
        >
            {/* Main bubble with glassmorphism - HORIZONTAL layout */}
            <div
                className="relative"
                style={{
                    background: colors.bg,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.12),
                        0 4px 16px rgba(0, 0, 0, 0.08),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                    `,
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
                    style={{
                        background: 'rgba(156, 163, 175, 0.9)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M1 1L9 9M9 1L1 9" />
                    </svg>
                </button>

                {/* Content - HORIZONTAL text layout */}
                <div className="px-4 py-3">
                    {/* Type indicator icons */}
                    {message.type === 'warning' && (
                        <span className="absolute -top-2 -left-2 text-base animate-pulse">⚠️</span>
                    )}
                    {message.type === 'celebration' && (
                        <span className="absolute -top-2 -left-2 text-base">🎉</span>
                    )}
                    {message.type === 'secret_reward' && (
                        <>
                            <span className="absolute -top-2 -left-2 text-base animate-bounce">🎁</span>
                            <span className="absolute -top-2 left-4 text-sm animate-pulse">✨</span>
                        </>
                    )}

                    {/* Message text - HORIZONTAL flow */}
                    <p
                        className="text-sm leading-relaxed font-medium"
                        style={{
                            color: '#374151',
                            // Ensure horizontal text flow
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                        }}
                    >
                        {message.text}
                    </p>
                </div>

                {/* Speech bubble tail - pointing RIGHT toward mascot */}
                <div
                    style={{
                        position: 'absolute',
                        right: -10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: `12px solid ${colors.bg.replace('0.95', '1').replace('0.98', '1')}`,
                        filter: 'drop-shadow(2px 0 2px rgba(0, 0, 0, 0.08))',
                    }}
                />

                {/* Tail border overlay for glass effect */}
                <div
                    style={{
                        position: 'absolute',
                        right: -8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderLeft: '10px solid rgba(255, 255, 255, 0.5)',
                    }}
                />
            </div>

            {/* Subtle accent glow behind bubble */}
            <div
                style={{
                    position: 'absolute',
                    inset: -12,
                    borderRadius: '28px',
                    background: `radial-gradient(ellipse at 70% 50%, ${colors.accent}15 0%, transparent 70%)`,
                    zIndex: -1,
                    animation: message.type === 'warning' ? 'pulse-glow 1s ease-in-out infinite' : 'none',
                }}
            />

            {/* CSS for animations */}
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default DauDauDialog;
