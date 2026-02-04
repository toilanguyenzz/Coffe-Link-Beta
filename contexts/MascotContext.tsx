/**
 * MascotContext.tsx
 * 
 * React Context for managing the Đậu Đậu mascot state across the app.
 * Connects to DiaryContext for activity tracking and WeatherService for alerts.
 * 
 * The mascot's health depends on user activity - similar to Tamagotchi mechanics.
 * 
 * Features:
 * - Pet nurturing: Health degrades with inactivity, improves with diary logs
 * - Contextual messages: Different responses based on page/context
 * - Easter eggs: 5 taps = dizzy, 100 taps = secret voucher
 * - Night mode: Shows sleepy state after 22h
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useDiarySafe } from './DiaryContext';
import MascotService, {
    MascotMood,
    MascotCostume,
    VoucherReward,
    MascotMessage,
    MASCOT_IMAGES,
    calculateHealth,
    determineMood,
    calculateDaysInactive,
    saveMascotState,
    loadMascotState,
    getGreetingMessage,
    getSadMessage,
    getDizzyMessage,
    getSingleTapMessage,
    getSecretVoucherMessage,
    getNightModeMessage,
    getFullHappyMessage,
    generateSecretVoucher,
    isNightTime,
    getCostume,
} from '../services/MascotService';

// --- TYPES ---

interface MascotContextType {
    // State
    mood: MascotMood;
    health: number;
    currentMessage: MascotMessage | null;
    mascotImage: string;
    isVisible: boolean;
    isHidden: boolean; // user swiped to hide
    tapCount: number;
    totalTapCount: number; // lifetime taps
    costume: MascotCostume;
    secretVoucher: VoucherReward | null;
    isNightMode: boolean;

    // Actions
    showMessage: (message: MascotMessage) => void;
    hideMessage: () => void;
    handleTap: () => void;
    setMood: (mood: MascotMood) => void;
    toggleVisibility: () => void;
    hideMascot: () => void;
    showMascot: () => void;
    triggerGreeting: () => void;

    // Trigger specific messages
    triggerWeatherWarning: () => void;
    triggerPriceUp: () => void;
    triggerBannedChemical: () => void;
    triggerEudrSuccess: () => void;
    triggerPestWarning: () => void;
    triggerDealAlert: () => void;
    triggerLevelUp: () => void;
    triggerReward: () => void;
    triggerNightMode: () => void;
    triggerFullHappy: () => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

// --- PROVIDER ---

export const MascotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load saved state
    const savedState = loadMascotState();

    // Core state
    const [mood, setMoodState] = useState<MascotMood>(savedState.mood || 'happy');
    const [health, setHealth] = useState<number>(savedState.health || 100);
    const [currentMessage, setCurrentMessage] = useState<MascotMessage | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isHidden, setIsHidden] = useState(false);
    const [tapCount, setTapCount] = useState(0);
    const [totalTapCount, setTotalTapCount] = useState<number>(savedState.totalTapCount || 0);
    const [costume, setCostume] = useState<MascotCostume>(savedState.costume || 'default');
    const [secretVoucher, setSecretVoucher] = useState<VoucherReward | null>(savedState.secretVoucher || null);
    const [isNightMode, setIsNightMode] = useState<boolean>(isNightTime());
    const [lastInteractionDate, setLastInteractionDate] = useState<Date | null>(
        savedState.lastInteractionDate || null
    );

    // Refs for timers
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tapResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get diary context for activity tracking (safe version for when outside provider)
    const { logs: diaryLogs } = useDiarySafe();

    // Calculate days inactive
    const daysInactive = calculateDaysInactive(lastInteractionDate);

    // Update health and mood based on activity
    useEffect(() => {
        const newHealth = calculateHealth(daysInactive, diaryLogs.length);
        setHealth(newHealth);

        // Determine mood (without tap count for auto-updates)
        const newMood = determineMood(
            newHealth,
            daysInactive,
            false, // hasWeatherWarning - handled separately
            false, // hasBannedChemical - handled separately
            false, // priceIsUp - handled separately
            0 // tapCount - don't auto-trigger dizzy
        );

        // Only update if not in a triggered state
        if (mood !== 'dizzy' && mood !== 'panic' && mood !== 'excited') {
            setMoodState(newMood);
        }

        // Save state
        saveMascotState({
            mood: newMood,
            health: newHealth,
            lastInteractionDate: new Date(),
            daysInactive,
        });
    }, [diaryLogs.length, daysInactive]);

    // Update last interaction date on mount
    useEffect(() => {
        setLastInteractionDate(new Date());
        saveMascotState({ lastInteractionDate: new Date() });
    }, []);

    // Show greeting on first load (after a short delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (daysInactive >= 2) {
                showMessage(getSadMessage(daysInactive));
            } else {
                showMessage(getGreetingMessage());
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Computed mascot image
    const mascotImage = MASCOT_IMAGES[mood] || MASCOT_IMAGES.happy;

    // --- ACTIONS ---

    const showMessage = useCallback((message: MascotMessage) => {
        // Clear any existing timeout
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }

        // Show message  
        setCurrentMessage(message);
        setMoodState(message.mood);

        // Auto-hide after duration
        const duration = message.duration || 4000;
        messageTimeoutRef.current = setTimeout(() => {
            setCurrentMessage(null);
            // Reset mood after message (except for sad states which persist)
            if (message.mood !== 'sad') {
                setMoodState(health >= 70 ? 'happy' : 'idle');
            }
        }, duration);
    }, [health]);

    const hideMessage = useCallback(() => {
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        setCurrentMessage(null);
    }, []);

    const handleTap = useCallback(() => {
        // Clear tap reset timer
        if (tapResetTimeoutRef.current) {
            clearTimeout(tapResetTimeoutRef.current);
        }

        const newTapCount = tapCount + 1;
        const newTotalTapCount = totalTapCount + 1;
        setTapCount(newTapCount);
        setTotalTapCount(newTotalTapCount);

        // Save total tap count
        saveMascotState({ totalTapCount: newTotalTapCount });

        // SECRET EASTER EGG: 100 lifetime taps = voucher reward!
        if (newTotalTapCount === 100 && !secretVoucher) {
            const voucher = generateSecretVoucher();
            setSecretVoucher(voucher);
            saveMascotState({ secretVoucher: voucher });
            setMoodState('excited');
            showMessage(getSecretVoucherMessage());
            setTapCount(0);
            return;
        }

        // Easter egg: after 5 consecutive taps, show dizzy state
        if (newTapCount >= 5) {
            setMoodState('dizzy');
            showMessage(getDizzyMessage());

            // Reset after 3 seconds
            setTimeout(() => {
                setTapCount(0);
                setMoodState(health >= 70 ? 'happy' : 'idle');
            }, 3000);
        } else if (newTapCount === 1) {
            // Single tap: show giggle message with small chance
            if (Math.random() < 0.4) { // 40% chance to show message
                showMessage(getSingleTapMessage());
            }
            // Reset tap count after 2 seconds of no taps
            tapResetTimeoutRef.current = setTimeout(() => {
                setTapCount(0);
            }, 2000);
        } else {
            // Multiple taps but less than 5: reset timer
            tapResetTimeoutRef.current = setTimeout(() => {
                setTapCount(0);
            }, 2000);
        }

        // Update interaction time
        setLastInteractionDate(new Date());
        saveMascotState({ lastInteractionDate: new Date() });
    }, [tapCount, totalTapCount, health, secretVoucher, showMessage]);

    const setMood = useCallback((newMood: MascotMood) => {
        setMoodState(newMood);
    }, []);

    const toggleVisibility = useCallback(() => {
        setIsVisible(prev => !prev);
    }, []);

    const hideMascot = useCallback(() => {
        setIsHidden(true);
    }, []);

    const showMascot = useCallback(() => {
        setIsHidden(false);
    }, []);

    const triggerGreeting = useCallback(() => {
        showMessage(getGreetingMessage());
    }, [showMessage]);

    // Trigger specific messages
    const triggerWeatherWarning = useCallback(() => {
        showMessage(MascotService.getWeatherWarningMessage());
    }, [showMessage]);

    const triggerPriceUp = useCallback(() => {
        showMessage(MascotService.getPriceUpMessage());
    }, [showMessage]);

    const triggerBannedChemical = useCallback(() => {
        showMessage(MascotService.getBannedChemicalMessage());
    }, [showMessage]);

    const triggerEudrSuccess = useCallback(() => {
        showMessage(MascotService.getEudrSuccessMessage());
    }, [showMessage]);

    const triggerPestWarning = useCallback(() => {
        showMessage(MascotService.getPestWarningMessage());
    }, [showMessage]);

    const triggerDealAlert = useCallback(() => {
        showMessage(MascotService.getDealAlertMessage());
    }, [showMessage]);

    const triggerLevelUp = useCallback(() => {
        showMessage(MascotService.getLevelUpMessage());
    }, [showMessage]);

    const triggerReward = useCallback(() => {
        showMessage(MascotService.getRewardMessage());
    }, [showMessage]);

    const triggerNightMode = useCallback(() => {
        setIsNightMode(true);
        setCostume('pajamas');
        showMessage(getNightModeMessage());
    }, [showMessage]);

    const triggerFullHappy = useCallback(() => {
        showMessage(getFullHappyMessage());
    }, [showMessage]);

    // Check for night mode periodically
    useEffect(() => {
        const checkNightMode = () => {
            const night = isNightTime();
            setIsNightMode(night);
            if (night && mood !== 'sleepy' && mood !== 'dizzy' && mood !== 'panic') {
                setMoodState('sleepy');
                setCostume('pajamas');
            } else if (!night && costume === 'pajamas') {
                setCostume('default');
            }
        };

        // Check immediately and then every minute
        checkNightMode();
        const interval = setInterval(checkNightMode, 60000);
        return () => clearInterval(interval);
    }, [mood, costume]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            if (tapResetTimeoutRef.current) clearTimeout(tapResetTimeoutRef.current);
        };
    }, []);

    const value: MascotContextType = {
        mood,
        health,
        currentMessage,
        mascotImage,
        isVisible,
        isHidden,
        tapCount,
        totalTapCount,
        costume,
        secretVoucher,
        isNightMode,
        showMessage,
        hideMessage,
        handleTap,
        setMood,
        toggleVisibility,
        hideMascot,
        showMascot,
        triggerGreeting,
        triggerWeatherWarning,
        triggerPriceUp,
        triggerBannedChemical,
        triggerEudrSuccess,
        triggerPestWarning,
        triggerDealAlert,
        triggerLevelUp,
        triggerReward,
        triggerNightMode,
        triggerFullHappy,
    };

    return (
        <MascotContext.Provider value={value}>
            {children}
        </MascotContext.Provider>
    );
};

// --- HOOK ---

export const useMascot = (): MascotContextType => {
    const context = useContext(MascotContext);
    if (!context) {
        throw new Error('useMascot must be used within a MascotProvider');
    }
    return context;
};

// Safe version - returns null when context not available
export const useMascotSafe = (): MascotContextType | null => {
    return useContext(MascotContext);
};

export default MascotContext;

