/**
 * WorkCycleContext.tsx - The Brain of Fair-Play Loop
 * 
 * Manages the entire work cycle state:
 * - JobOffer (tuyển thợ)
 * - WorkSession (tracking)
 * - Transaction (thanh toán)
 * - ReputationProfile (uy tín)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export type WorkPhase = 'IDLE' | 'RECRUITED' | 'WORKING' | 'PAYMENT_PENDING' | 'COMPLETED';

export interface JobOffer {
    id: string;
    createdAt: Date;
    workerCount: number;
    promisedPrice: number;
    perks?: string;
    posterUrl?: string;
}

export interface WorkSession {
    id: string;
    jobOfferId: string;
    startTime: Date;
    endTime?: Date;
    status: 'ACTIVE' | 'PAUSED' | 'ENDED';
}

export interface Transaction {
    id: string;
    sessionId: string;
    workerCount: number;
    promisedPrice: number;
    actualPrice: number;
    totalPaid: number;
    reputationEarned: boolean;
    audioProofUrl?: string;
    receiptUrl?: string;
    paidAt: Date;
}

export interface ReputationProfile {
    score: number;
    streakDays: number;
    totalPaidHistory: number;
    lastPaymentDate?: Date;
    badges: string[];
}

export interface WorkCycleState {
    phase: WorkPhase;
    jobOffer: JobOffer | null;
    workSession: WorkSession | null;
    transaction: Transaction | null;
    reputation: ReputationProfile;
}

export interface WorkCycleContextType extends WorkCycleState {
    // Actions
    createJobOffer: (workerCount: number, price: number, perks?: string) => void;
    startWork: () => void;
    endWork: () => void;
    processPayment: (actualPrice: number, audioProofUrl?: string) => boolean;
    resetCycle: () => void;

    // Helpers
    getElapsedTime: () => number;
    getEstimatedCost: () => number;
    getTimeBasedPhase: () => WorkPhase;
}

// ═══════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════
const STORAGE_KEYS = {
    STATE: 'workCycle_state',
    REPUTATION: 'workCycle_reputation',
    HISTORY: 'workCycle_history',
};

// ═══════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════
const initialReputation: ReputationProfile = {
    score: 0,
    streakDays: 0,
    totalPaidHistory: 0,
    badges: [],
};

const initialState: WorkCycleState = {
    phase: 'IDLE',
    jobOffer: null,
    workSession: null,
    transaction: null,
    reputation: initialReputation,
};

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════
const WorkCycleContext = createContext<WorkCycleContextType | undefined>(undefined);

export const useWorkCycle = () => {
    const context = useContext(WorkCycleContext);
    if (!context) {
        throw new Error('useWorkCycle must be used within WorkCycleProvider');
    }
    return context;
};

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════
export const WorkCycleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WorkCycleState>(() => {
        // Load from localStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.STATE);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    jobOffer: parsed.jobOffer ? { ...parsed.jobOffer, createdAt: new Date(parsed.jobOffer.createdAt) } : null,
                    workSession: parsed.workSession ? {
                        ...parsed.workSession,
                        startTime: new Date(parsed.workSession.startTime),
                        endTime: parsed.workSession.endTime ? new Date(parsed.workSession.endTime) : undefined
                    } : null,
                };
            }
        } catch (e) {
            console.error('Failed to load work cycle state:', e);
        }
        return initialState;
    });

    // Persist state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
    }, [state]);

    // ═══════════════════════════════════════════════════════════════
    // TIME-BASED PHASE DETECTION
    // ═══════════════════════════════════════════════════════════════
    const getTimeBasedPhase = useCallback((): WorkPhase => {
        const now = new Date();
        const hour = now.getHours();

        // If already in a specific phase, respect it
        if (state.phase === 'WORKING') return 'WORKING';
        if (state.phase === 'PAYMENT_PENDING') return 'PAYMENT_PENDING';

        // Time-based detection
        if (state.jobOffer) {
            if (hour >= 17) return 'PAYMENT_PENDING'; // 5PM+
            if (hour >= 7 && hour < 17) return state.phase === 'RECRUITED' ? 'RECRUITED' : 'WORKING';
            return 'RECRUITED';
        }

        return 'IDLE';
    }, [state.phase, state.jobOffer]);

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════
    const createJobOffer = useCallback((workerCount: number, price: number, perks?: string) => {
        const jobOffer: JobOffer = {
            id: `job_${Date.now()}`,
            createdAt: new Date(),
            workerCount,
            promisedPrice: price,
            perks,
        };

        setState(prev => ({
            ...prev,
            phase: 'RECRUITED',
            jobOffer,
        }));
    }, []);

    const startWork = useCallback(() => {
        if (!state.jobOffer) return;

        const workSession: WorkSession = {
            id: `session_${Date.now()}`,
            jobOfferId: state.jobOffer.id,
            startTime: new Date(),
            status: 'ACTIVE',
        };

        setState(prev => ({
            ...prev,
            phase: 'WORKING',
            workSession,
        }));
    }, [state.jobOffer]);

    const endWork = useCallback(() => {
        if (!state.workSession) return;

        setState(prev => ({
            ...prev,
            phase: 'PAYMENT_PENDING',
            workSession: prev.workSession ? {
                ...prev.workSession,
                endTime: new Date(),
                status: 'ENDED',
            } : null,
        }));
    }, [state.workSession]);

    const processPayment = useCallback((actualPrice: number, audioProofUrl?: string): boolean => {
        if (!state.jobOffer || !state.workSession) return false;

        const promisedPrice = state.jobOffer.promisedPrice;
        const workerCount = state.jobOffer.workerCount;
        const totalPaid = actualPrice * workerCount;
        const reputationEarned = actualPrice >= promisedPrice;

        const transaction: Transaction = {
            id: `tx_${Date.now()}`,
            sessionId: state.workSession.id,
            workerCount,
            promisedPrice,
            actualPrice,
            totalPaid,
            reputationEarned,
            audioProofUrl,
            paidAt: new Date(),
        };

        // Update reputation
        const newReputation: ReputationProfile = {
            ...state.reputation,
            totalPaidHistory: state.reputation.totalPaidHistory + totalPaid,
            lastPaymentDate: new Date(),
        };

        if (reputationEarned) {
            newReputation.score++;
            newReputation.streakDays++;

            // Unlock badges
            if (newReputation.score >= 10 && !newReputation.badges.includes('trusted')) {
                newReputation.badges.push('trusted');
            }
            if (newReputation.streakDays >= 7 && !newReputation.badges.includes('reliable')) {
                newReputation.badges.push('reliable');
            }
        } else {
            newReputation.streakDays = 0;
        }

        setState(prev => ({
            ...prev,
            phase: 'COMPLETED',
            transaction,
            reputation: newReputation,
        }));

        // Save reputation separately
        localStorage.setItem(STORAGE_KEYS.REPUTATION, JSON.stringify(newReputation));

        return reputationEarned;
    }, [state.jobOffer, state.workSession, state.reputation]);

    const resetCycle = useCallback(() => {
        setState(prev => ({
            ...initialState,
            reputation: prev.reputation, // Keep reputation
        }));
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════
    const getElapsedTime = useCallback((): number => {
        if (!state.workSession) return 0;
        const start = new Date(state.workSession.startTime).getTime();
        const end = state.workSession.endTime
            ? new Date(state.workSession.endTime).getTime()
            : Date.now();
        return Math.floor((end - start) / 1000);
    }, [state.workSession]);

    const getEstimatedCost = useCallback((): number => {
        if (!state.jobOffer) return 0;
        return state.jobOffer.workerCount * state.jobOffer.promisedPrice;
    }, [state.jobOffer]);

    // ═══════════════════════════════════════════════════════════════
    // CONTEXT VALUE
    // ═══════════════════════════════════════════════════════════════
    const value: WorkCycleContextType = {
        ...state,
        createJobOffer,
        startWork,
        endWork,
        processPayment,
        resetCycle,
        getElapsedTime,
        getEstimatedCost,
        getTimeBasedPhase,
    };

    return (
        <WorkCycleContext.Provider value={value}>
            {children}
        </WorkCycleContext.Provider>
    );
};

export default WorkCycleContext;
