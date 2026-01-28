/**
 * GreenPointsContext.tsx
 * 
 * Context provider for Green Credit Points system
 * Manages points state, transactions, and rewards across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import GreenCreditService, {
    GreenPointsBalance,
    PointTransaction,
    Reward
} from '../services/GreenCreditService';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface GreenPointsContextType {
    // State
    balance: GreenPointsBalance;
    history: PointTransaction[];
    loading: boolean;

    // Actions
    addPoints: (amount: number, reason: string) => void;
    deductPoints: (amount: number, reason: string) => void;
    claimReward: (rewardId: string) => { success: boolean; message: string };
    undoTransaction: (transactionId: string) => { success: boolean; message: string };
    refresh: () => void;

    // Recent transaction (for celebrations)
    lastTransaction: PointTransaction | null;
    clearLastTransaction: () => void;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const GreenPointsContext = createContext<GreenPointsContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export const useGreenPoints = () => {
    const context = useContext(GreenPointsContext);
    if (!context) {
        // Return a fallback instead of throwing - for graceful degradation
        console.warn('useGreenPoints called outside GreenPointsProvider, using fallback');
        return {
            balance: { points: 1000, rank: 'Bạc' as const, nextRankPoints: 1500, rewardsAvailable: [] },
            history: [],
            loading: false,
            addPoints: () => { },
            deductPoints: () => { },
            claimReward: () => ({ success: false, message: 'Provider not available' }),
            undoTransaction: () => ({ success: false, message: 'Provider not available' }),
            refresh: () => { },
            lastTransaction: null,
            clearLastTransaction: () => { }
        };
    }
    return context;
};

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

interface GreenPointsProviderProps {
    children: ReactNode;
}

export const GreenPointsProvider: React.FC<GreenPointsProviderProps> = ({ children }) => {
    const [balance, setBalance] = useState<GreenPointsBalance>({
        points: 1000,
        rank: 'Bạc',
        nextRankPoints: 1500,
        rewardsAvailable: []
    });
    const [history, setHistory] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastTransaction, setLastTransaction] = useState<PointTransaction | null>(null);

    // Load initial data
    const refresh = useCallback(() => {
        setLoading(true);
        try {
            const currentBalance = GreenCreditService.getGreenPointsBalance();
            const currentHistory = GreenCreditService.getPointHistory();
            setBalance(currentBalance);
            setHistory(currentHistory);
        } catch (error) {
            console.error('Error loading green points:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Add points
    const addPoints = useCallback((amount: number, reason: string) => {
        const transaction = GreenCreditService.addGreenPoints(amount, reason);
        setLastTransaction(transaction);
        refresh();
    }, [refresh]);

    // Deduct points
    const deductPoints = useCallback((amount: number, reason: string) => {
        const transaction = GreenCreditService.deductGreenPoints(amount, reason);
        setLastTransaction(transaction);
        refresh();
    }, [refresh]);

    // Claim reward
    const claimReward = useCallback((rewardId: string) => {
        const result = GreenCreditService.claimReward(rewardId);
        if (result.success) {
            refresh();
        }
        return result;
    }, [refresh]);

    // Undo transaction
    const undoTransaction = useCallback((transactionId: string) => {
        const result = GreenCreditService.undoTransaction(transactionId);
        if (result.success) {
            refresh();
        }
        return result;
    }, [refresh]);

    // Clear last transaction (after celebration shown)
    const clearLastTransaction = useCallback(() => {
        setLastTransaction(null);
    }, []);

    const value: GreenPointsContextType = {
        balance,
        history,
        loading,
        addPoints,
        deductPoints,
        claimReward,
        undoTransaction,
        refresh,
        lastTransaction,
        clearLastTransaction
    };

    return (
        <GreenPointsContext.Provider value={value}>
            {children}
        </GreenPointsContext.Provider>
    );
};

export default GreenPointsProvider;
