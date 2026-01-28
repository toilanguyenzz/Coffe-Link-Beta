/**
 * LocalStorageService.ts - Quản lý LocalStorage cho MVP Demo
 * Thay thế Firebase Firestore, lưu tạm trên device
 */

const STORAGE_KEYS = {
    CURRENT_USER: 'agrios_current_user',
    CAMPAIGN_ORDERS: 'agrios_campaign_orders',
    REWARD_POINTS: 'agrios_reward_points',
    REWARD_HISTORY: 'agrios_reward_history',
    GARDENS: 'agrios_gardens',
    USER_ACTIONS: 'agrios_user_actions',
    DEMO_MODE: 'agrios_demo_mode',
} as const;

// ============ USER SESSION ============

export function setCurrentUser(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
}

export function getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

export function isDemoMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
}

export function clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
}

// ============ CAMPAIGN ORDERS ============

export interface CampaignOrderLocal {
    id: string;
    campaignId: string;
    userId: string;
    quantity: number;
    totalAmount: number;
    depositAmount: number;
    depositPaid: boolean;
    slidingPrice: number; // Giá tại thời điểm đặt
    pickupQrCode: string;
    createdAt: string;
}

export function saveCampaignOrder(order: CampaignOrderLocal): void {
    const orders = getCampaignOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.CAMPAIGN_ORDERS, JSON.stringify(orders));
}

export function getCampaignOrders(): CampaignOrderLocal[] {
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_ORDERS);
    return data ? JSON.parse(data) : [];
}

export function getUserOrders(userId: string): CampaignOrderLocal[] {
    return getCampaignOrders().filter(o => o.userId === userId);
}

export function getCampaignOrderCount(campaignId: string): number {
    const orders = getCampaignOrders().filter(o => o.campaignId === campaignId);
    return orders.reduce((sum, o) => sum + o.quantity, 0);
}

// ============ REWARD POINTS ============

export interface RewardHistoryItem {
    id: string;
    action: string;
    points: number;
    description: string;
    createdAt: string;
}

export function getRewardPoints(userId: string): number {
    const data = localStorage.getItem(`${STORAGE_KEYS.REWARD_POINTS}_${userId}`);
    return data ? parseInt(data, 10) : 0;
}

export function addRewardPoints(userId: string, points: number, action: string, description: string): void {
    const current = getRewardPoints(userId);
    localStorage.setItem(`${STORAGE_KEYS.REWARD_POINTS}_${userId}`, String(current + points));

    // Add to history
    const history = getRewardHistory(userId);
    history.unshift({
        id: `reward_${Date.now()}`,
        action,
        points,
        description,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem(`${STORAGE_KEYS.REWARD_HISTORY}_${userId}`, JSON.stringify(history.slice(0, 50)));
}

export function getRewardHistory(userId: string): RewardHistoryItem[] {
    const data = localStorage.getItem(`${STORAGE_KEYS.REWARD_HISTORY}_${userId}`);
    return data ? JSON.parse(data) : [];
}

// ============ GARDENS ============

export interface GardenLocal {
    id: string;
    userId: string;
    name: string;
    boundary: { lat: number; lng: number }[];
    center: { lat: number; lng: number };
    areaHa: number;
    plantingYear?: number;
    eudrStatus: 'passed' | 'needs_review' | 'pending';
    sourceType: 'manual_draw' | 'gps_walk' | 'certificate_scan';
    createdAt: string;
}

export function saveGarden(garden: GardenLocal): void {
    const gardens = getGardens();
    const existingIndex = gardens.findIndex(g => g.id === garden.id);
    if (existingIndex >= 0) {
        gardens[existingIndex] = garden;
    } else {
        gardens.push(garden);
    }
    localStorage.setItem(STORAGE_KEYS.GARDENS, JSON.stringify(gardens));
}

export function getGardens(): GardenLocal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GARDENS);
    return data ? JSON.parse(data) : [];
}

export function getUserGardens(userId: string): GardenLocal[] {
    return getGardens().filter(g => g.userId === userId);
}

// ============ GENERAL USER ACTIONS ============

export function logUserAction(userId: string, action: string, data?: any): void {
    const actions = getUserActions();
    actions.push({
        userId,
        action,
        data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.USER_ACTIONS, JSON.stringify(actions.slice(-100)));
}

export function getUserActions(): Array<{ userId: string; action: string; data?: any; timestamp: string }> {
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACTIONS);
    return data ? JSON.parse(data) : [];
}

// ============ RESET DEMO ============

export function resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    // Also clear user-specific keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('agrios_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ============ INITIALIZE DEMO DATA ============

export function initializeDemoData(userId: string): void {
    // Set initial reward points
    if (getRewardPoints(userId) === 0) {
        localStorage.setItem(`${STORAGE_KEYS.REWARD_POINTS}_${userId}`, '50'); // Start with 50 points
        addRewardPoints(userId, 0, 'WELCOME', 'Chào mừng đến với Agri-OS! 🎉');
    }
}
