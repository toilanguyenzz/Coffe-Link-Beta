/**
 * ReputationService.ts - Uy tín tracking for farmers
 * 
 * Tracks:
 * - Promise vs Actual payment
 * - Streak days
 * - Badges
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export interface ReputationData {
    score: number;
    streakDays: number;
    totalPaid: number;
    totalSessions: number;
    badges: Badge[];
    history: ReputationEvent[];
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
}

export interface ReputationEvent {
    date: Date;
    promisedPrice: number;
    actualPrice: number;
    earned: boolean;
    scoreChange: number;
}

// ═══════════════════════════════════════════════════════════════
// BADGE DEFINITIONS
// ═══════════════════════════════════════════════════════════════
export const BADGES = {
    NEWCOMER: { id: 'newcomer', name: 'Người mới', icon: '🌱' },
    TRUSTED: { id: 'trusted', name: 'Đáng tin cậy', icon: '⭐' },
    RELIABLE: { id: 'reliable', name: 'Ổn định', icon: '🏆' },
    GENEROUS: { id: 'generous', name: 'Hào phóng', icon: '💎' },
    VETERAN: { id: 'veteran', name: 'Lão làng', icon: '👑' },
};

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════
const STORAGE_KEY = 'coffeelink_reputation';

const getDefaultData = (): ReputationData => ({
    score: 0,
    streakDays: 0,
    totalPaid: 0,
    totalSessions: 0,
    badges: [{ ...BADGES.NEWCOMER, earnedAt: new Date() }],
    history: [],
});

export const loadReputation = (): ReputationData => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...parsed,
                badges: parsed.badges.map((b: any) => ({ ...b, earnedAt: new Date(b.earnedAt) })),
                history: parsed.history.map((h: any) => ({ ...h, date: new Date(h.date) })),
            };
        }
    } catch (e) {
        console.error('Failed to load reputation:', e);
    }
    return getDefaultData();
};

export const saveReputation = (data: ReputationData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// ═══════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════
export const recordPayment = (
    promisedPrice: number,
    actualPrice: number,
    workerCount: number
): { earned: boolean; newData: ReputationData } => {
    const data = loadReputation();
    const earned = actualPrice >= promisedPrice;
    const totalPaid = actualPrice * workerCount;

    const event: ReputationEvent = {
        date: new Date(),
        promisedPrice,
        actualPrice,
        earned,
        scoreChange: earned ? 1 : 0,
    };

    // Update data
    data.history.unshift(event);
    data.totalPaid += totalPaid;
    data.totalSessions++;

    if (earned) {
        data.score++;
        data.streakDays++;

        // Check for new badges
        if (data.score >= 5 && !data.badges.find(b => b.id === 'trusted')) {
            data.badges.push({ ...BADGES.TRUSTED, earnedAt: new Date() });
        }
        if (data.streakDays >= 7 && !data.badges.find(b => b.id === 'reliable')) {
            data.badges.push({ ...BADGES.RELIABLE, earnedAt: new Date() });
        }
        if (data.totalPaid >= 10000000 && !data.badges.find(b => b.id === 'generous')) {
            data.badges.push({ ...BADGES.GENEROUS, earnedAt: new Date() });
        }
        if (data.totalSessions >= 30 && !data.badges.find(b => b.id === 'veteran')) {
            data.badges.push({ ...BADGES.VETERAN, earnedAt: new Date() });
        }
    } else {
        data.streakDays = 0;
    }

    saveReputation(data);
    return { earned, newData: data };
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
export const getReputationLevel = (score: number): { level: string; color: string } => {
    if (score >= 50) return { level: 'Huyền thoại', color: '#9333EA' };
    if (score >= 30) return { level: 'Xuất sắc', color: '#F59E0B' };
    if (score >= 15) return { level: 'Uy tín cao', color: '#10B981' };
    if (score >= 5) return { level: 'Đáng tin', color: '#3B82F6' };
    return { level: 'Mới', color: '#6B7280' };
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

export const getStreakEmoji = (days: number): string => {
    if (days >= 30) return '🔥🔥🔥';
    if (days >= 14) return '🔥🔥';
    if (days >= 7) return '🔥';
    if (days >= 3) return '⚡';
    return '';
};
