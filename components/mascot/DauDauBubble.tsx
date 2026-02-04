/**
 * DauDauBubble.tsx
 * 
 * Floating mascot bubble that appears on all screens.
 * Features:
 * - Fixed position at bottom-right (above BottomNav)
 * - Can be swiped/dragged to edge to hide
 * - Shows speech bubble with contextual messages
 * - Tap interactions for Easter eggs
 * - Smooth animations and transitions
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMascotSafe } from '../../contexts/MascotContext';
import DauDauAnimated from './DauDauAnimated';
import DauDauDialog from './DauDauDialog';

interface DauDauBubbleProps {
    /** Override default position */
    position?: { bottom: number; right: number };
}

// Inner component that contains all the hooks and logic
const DauDauBubbleInner: React.FC<DauDauBubbleProps & {
    mood: string;
    health: number;
    currentMessage: any;
    handleTap: () => void;
    hideMessage: () => void;
    isHidden: boolean;
    hideMascot: () => void;
    showMascot: () => void;
    costume: string;
    isNightMode: boolean;
    totalTapCount: number;
}> = ({
    position,
    mood,
    health,
    currentMessage,
    handleTap,
    hideMessage,
    isHidden,
    hideMascot,
    showMascot,
    costume,
    isNightMode,
    totalTapCount,
}) => {
        // Drag state - all hooks are called unconditionally here
        const [isDragging, setIsDragging] = useState(false);
        const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
        const [finalPosition, setFinalPosition] = useState({ x: 0, y: 0 });
        const bubbleRef = useRef<HTMLDivElement>(null);
        const startPosRef = useRef({ x: 0, y: 0 });

        // Default position (bottom-right, anchored above BottomNav in thumb zone)
        const defaultPos = position || { bottom: 80, right: 12 };

        // Handle touch/mouse start
        const handleDragStart = useCallback((clientX: number, clientY: number) => {
            if (!bubbleRef.current) return;
            setIsDragging(true);
            startPosRef.current = { x: clientX, y: clientY };
        }, []);

        // Handle touch/mouse move
        const handleDragMove = useCallback((clientX: number, clientY: number) => {
            if (!isDragging) return;

            const deltaX = clientX - startPosRef.current.x;
            const deltaY = clientY - startPosRef.current.y;

            setDragOffset({ x: deltaX, y: deltaY });
        }, [isDragging]);

        // Handle touch/mouse end
        const handleDragEnd = useCallback(() => {
            if (!isDragging) return;
            setIsDragging(false);

            // Check if dragged far enough to hide
            const screenWidth = window.innerWidth;
            const threshold = screenWidth * 0.3;

            if (Math.abs(dragOffset.x) > threshold) {
                // Hide to edge
                const targetX = dragOffset.x > 0 ? screenWidth * 0.8 : -screenWidth * 0.8;
                setFinalPosition({ x: targetX, y: 0 });
                hideMascot();
            } else {
                // Snap back
                setDragOffset({ x: 0, y: 0 });
                setFinalPosition({ x: 0, y: 0 });
            }
        }, [isDragging, dragOffset.x, hideMascot]);

        // Touch event handlers
        const onTouchStart = (e: React.TouchEvent) => {
            handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        };

        const onTouchMove = (e: React.TouchEvent) => {
            handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        };

        const onTouchEnd = () => {
            handleDragEnd();
        };

        // Mouse event handlers (for desktop testing)
        const onMouseDown = (e: React.MouseEvent) => {
            handleDragStart(e.clientX, e.clientY);
        };

        useEffect(() => {
            const handleMouseMove = (e: MouseEvent) => {
                handleDragMove(e.clientX, e.clientY);
            };

            const handleMouseUp = () => {
                handleDragEnd();
            };

            if (isDragging) {
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            }

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }, [isDragging, handleDragMove, handleDragEnd]);

        // Handle tap (without drag)
        const handleClick = () => {
            if (!isDragging && Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
                handleTap();
            }
        };

        // Show mascot when tapping the hidden state
        const handleShowMascot = () => {
            setFinalPosition({ x: 0, y: 0 });
            setDragOffset({ x: 0, y: 0 });
            showMascot();
        };

        // Calculate transform
        const transform = isDragging
            ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
            : `translate(${finalPosition.x}px, ${finalPosition.y}px)`;

        return (
            <>
                {/* Hidden state - small tab on edge */}
                {isHidden && (
                    <div
                        className="fixed z-[950] cursor-pointer transition-all duration-300 hover:opacity-100 opacity-60"
                        style={{
                            bottom: defaultPos.bottom,
                            right: finalPosition.x > 0 ? -20 : undefined,
                            left: finalPosition.x < 0 ? -20 : undefined,
                        }}
                        onClick={handleShowMascot}
                    >
                        <div
                            className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white"
                            style={{
                                background: 'linear-gradient(135deg, #4ADE80 0%, #16A34A 100%)',
                            }}
                        >
                            <img
                                src="/mascot/daudau_happy.png"
                                alt="Đậu Đậu"
                                className="w-full h-full object-cover scale-150"
                            />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>
                )}

                {/* Main floating bubble */}
                {!isHidden && (
                    <div
                        ref={bubbleRef}
                        className={`
                        fixed z-[950] cursor-grab select-none
                        transition-transform duration-300 ease-out
                        ${isDragging ? 'cursor-grabbing' : ''}
                    `}
                        style={{
                            bottom: defaultPos.bottom,
                            right: defaultPos.right,
                            transform,
                            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                        }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onMouseDown={onMouseDown}
                        onClick={handleClick}
                    >
                        {/* Speech bubble - positioned above mascot */}
                        <DauDauDialog
                            message={currentMessage}
                            onDismiss={hideMessage}
                        />

                        {/* Mascot Animated Character - larger for thumb zone visibility */}
                        <DauDauAnimated
                            mood={mood as any}
                            size="lg"
                            interactive={false}
                        />

                        {/* Health indicator - Wider for larger sprite */}
                        <div
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-2 rounded-full bg-gray-200/80 overflow-hidden backdrop-blur-sm shadow-sm"
                            title={`Sức khỏe Đậu Đậu: ${health}%`}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${health}%`,
                                    background: health < 30
                                        ? 'linear-gradient(90deg, #F87171, #EF4444)'
                                        : health < 60
                                            ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                            : 'linear-gradient(90deg, #4ADE80, #22C55E)',
                                }}
                            />
                        </div>

                        {/* Night mode indicator */}
                        {isNightMode && (
                            <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-indigo-900 flex items-center justify-center shadow-md">
                                <span className="text-xs">🌙</span>
                            </div>
                        )}

                        {/* Costume indicator (shows if wearing special costume) */}
                        {costume !== 'default' && costume !== 'pajamas' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md">
                                <span className="text-xs">
                                    {costume === 'raincoat' && '🌧️'}
                                    {costume === 'helmet' && '⚠️'}
                                    {costume === 'sunglasses' && '😎'}
                                    {costume === 'coffee_cup' && '☕'}
                                </span>
                            </div>
                        )}

                        {/* Secret tap counter (shows progress to 100) */}
                        {totalTapCount > 0 && totalTapCount < 100 && totalTapCount % 10 === 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-100 px-2 py-0.5 rounded text-[10px] text-purple-700 whitespace-nowrap opacity-80">
                                {totalTapCount}/100 🎁
                            </div>
                        )}

                        {/* Drag hint (shows briefly on first render) */}
                        <div
                            className="absolute -left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 animate-pulse pointer-events-none"
                            style={{ animation: 'fadeInOut 3s ease-in-out' }}
                        >
                            ⟺
                        </div>
                    </div>
                )}

                {/* Additional CSS */}
                <style>{`
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; }
                    20%, 80% { opacity: 0.5; }
                }
            `}</style>
            </>
        );
    };

// Main wrapper component that handles context checking
const DauDauBubble: React.FC<DauDauBubbleProps> = ({ position }) => {
    // Use safe hook that returns null if context not available
    const mascotContext = useMascotSafe();

    // Don't render anything if context is not available yet
    if (!mascotContext) {
        return null;
    }

    return (
        <DauDauBubbleInner
            position={position}
            mood={mascotContext.mood}
            health={mascotContext.health}
            currentMessage={mascotContext.currentMessage}
            handleTap={mascotContext.handleTap}
            hideMessage={mascotContext.hideMessage}
            isHidden={mascotContext.isHidden}
            hideMascot={mascotContext.hideMascot}
            showMascot={mascotContext.showMascot}
            costume={mascotContext.costume}
            isNightMode={mascotContext.isNightMode}
            totalTapCount={mascotContext.totalTapCount}
        />
    );
};

export default DauDauBubble;
