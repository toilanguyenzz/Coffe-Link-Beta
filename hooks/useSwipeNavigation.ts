import React, { useState, useCallback } from 'react';

interface SwipeConfig {
    threshold?: number; // Minimum swipe distance in pixels
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

interface TouchHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * useSwipeNavigation - Hook for detecting horizontal swipe gestures
 * 
 * @param config - Configuration object with threshold and callbacks
 * @returns Touch event handlers to attach to swipeable container
 */
export const useSwipeNavigation = (config: SwipeConfig): TouchHandlers => {
    const { threshold = 50, onSwipeLeft, onSwipeRight } = config;
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!touchStart) return;

        const touchEndX = e.changedTouches[0].clientX;
        setTouchEnd(touchEndX);

        const distance = touchStart - touchEndX;
        const isLeftSwipe = distance > threshold;
        const isRightSwipe = distance < -threshold;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        } else if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    }, [touchStart, threshold, onSwipeLeft, onSwipeRight]);

    return { onTouchStart, onTouchEnd };
};

export default useSwipeNavigation;
