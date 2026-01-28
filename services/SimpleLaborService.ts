/**
 * SimpleLaborService.ts - Simple Worker Tracking (Lite Version)
 * REMOVED: All "Advance Payment" (Ứng tiền) logic
 * FOCUS: Just "Chấm & Trả" - Track and Pay
 */

// ========== DATA MODEL (Simplified) ==========
export interface JobSession {
    id: string;
    date: string;                    // YYYY-MM-DD
    workerCount: number;             // Số thợ
    unitPrice: number;               // Đơn giá (VNĐ/ngày)
    totalAmount: number;             // Tổng tiền = workerCount × unitPrice
    status: 'active' | 'calculating' | 'paid';
    audioProofUrl?: string;          // URL file ghi âm xác nhận
    confirmedAt?: string;            // Thời điểm xác nhận trả tiền
    createdAt: string;
    workers?: string[];              // Tên các thợ (optional)
}

export interface LaborHistory {
    sessions: JobSession[];
    totalSpent: number;              // Tổng chi phí tích lũy
    totalDays: number;               // Tổng số ngày công
}

// ========== STORAGE KEYS ==========
const KEYS = {
    CURRENT_SESSION: 'simple_labor_current',
    HISTORY: 'simple_labor_history',
    LAST_SESSION: 'simple_labor_last'
};

// ========== DEFAULT VALUES ==========
const DEFAULT_PRICE = 250000; // 250k/ngày
const DEFAULT_WORKERS = 5;

// ========== SERVICE FUNCTIONS ==========

/**
 * Lấy session hôm nay (nếu có)
 */
export function getTodaySession(): JobSession | null {
    const data = localStorage.getItem(KEYS.CURRENT_SESSION);
    if (!data) return null;

    const session: JobSession = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];

    // Chỉ trả về nếu là session của hôm nay
    if (session.date === today) {
        return session;
    }

    return null;
}

/**
 * Lấy session hôm qua (để copy đội hình)
 */
export function getYesterdaySession(): JobSession | null {
    const data = localStorage.getItem(KEYS.LAST_SESSION);
    if (!data) return null;
    return JSON.parse(data);
}

/**
 * Kiểm tra có phải buổi sáng không (< 10 AM)
 */
export function isMorningTime(): boolean {
    const hour = new Date().getHours();
    return hour < 10;
}

/**
 * Tạo session mới từ session cũ (Reuse yesterday's team)
 */
export function createSessionFromYesterday(): JobSession {
    const yesterday = getYesterdaySession();

    const newSession: JobSession = {
        id: `session_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        workerCount: yesterday?.workerCount || DEFAULT_WORKERS,
        unitPrice: yesterday?.unitPrice || DEFAULT_PRICE,
        totalAmount: (yesterday?.workerCount || DEFAULT_WORKERS) * (yesterday?.unitPrice || DEFAULT_PRICE),
        status: 'active',
        workers: yesterday?.workers || [],
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(newSession));
    return newSession;
}

/**
 * Tạo session mới (thủ công)
 */
export function createNewSession(workerCount: number, unitPrice: number = DEFAULT_PRICE, workers?: string[]): JobSession {
    const newSession: JobSession = {
        id: `session_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        workerCount,
        unitPrice,
        totalAmount: workerCount * unitPrice,
        status: 'active',
        workers,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(newSession));
    return newSession;
}

/**
 * Cập nhật session hiện tại
 */
export function updateSession(updates: Partial<JobSession>): JobSession | null {
    const session = getTodaySession();
    if (!session) return null;

    const updated: JobSession = {
        ...session,
        ...updates,
        totalAmount: (updates.workerCount ?? session.workerCount) * (updates.unitPrice ?? session.unitPrice)
    };

    localStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(updated));
    return updated;
}

/**
 * Chuyển session sang trạng thái "calculating"
 */
export function startCalculating(): JobSession | null {
    return updateSession({ status: 'calculating' });
}

/**
 * Xác nhận đã trả tiền + lưu audio proof
 */
export function confirmPayment(audioProofUrl?: string): JobSession | null {
    const session = getTodaySession();
    if (!session) return null;

    const paidSession: JobSession = {
        ...session,
        status: 'paid',
        audioProofUrl,
        confirmedAt: new Date().toISOString()
    };

    // Lưu vào history
    saveToHistory(paidSession);

    // Lưu làm "last session" để copy hôm sau
    localStorage.setItem(KEYS.LAST_SESSION, JSON.stringify(paidSession));

    // Xóa current session
    localStorage.removeItem(KEYS.CURRENT_SESSION);

    return paidSession;
}

/**
 * Lưu session vào history
 */
function saveToHistory(session: JobSession): void {
    const history = getHistory();
    history.sessions.unshift(session); // Thêm vào đầu
    history.totalSpent += session.totalAmount;
    history.totalDays += session.workerCount;

    // Giới hạn 100 sessions
    if (history.sessions.length > 100) {
        history.sessions = history.sessions.slice(0, 100);
    }

    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

/**
 * Lấy lịch sử
 */
export function getHistory(): LaborHistory {
    const data = localStorage.getItem(KEYS.HISTORY);
    if (!data) {
        return { sessions: [], totalSpent: 0, totalDays: 0 };
    }
    return JSON.parse(data);
}

/**
 * Lấy thống kê theo mùa vụ (năm)
 */
export function getSeasonStats(year: number = new Date().getFullYear()): {
    totalSpent: number;
    totalDays: number;
    avgPrice: number;
    sessionCount: number;
} {
    const history = getHistory();
    const yearSessions = history.sessions.filter(s => s.date.startsWith(year.toString()));

    const totalSpent = yearSessions.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalDays = yearSessions.reduce((sum, s) => sum + s.workerCount, 0);

    return {
        totalSpent,
        totalDays,
        avgPrice: totalDays > 0 ? Math.round(totalSpent / totalDays) : DEFAULT_PRICE,
        sessionCount: yearSessions.length
    };
}

/**
 * Lấy so sánh giá với năm trước
 */
export function getPriceComparison(): { lastYear: number; thisYear: number; change: number } {
    const thisYear = new Date().getFullYear();
    const lastYearStats = getSeasonStats(thisYear - 1);
    const thisYearStats = getSeasonStats(thisYear);

    const change = lastYearStats.avgPrice > 0
        ? Math.round(((thisYearStats.avgPrice - lastYearStats.avgPrice) / lastYearStats.avgPrice) * 100)
        : 0;

    return {
        lastYear: lastYearStats.avgPrice || DEFAULT_PRICE,
        thisYear: thisYearStats.avgPrice || DEFAULT_PRICE,
        change
    };
}

/**
 * Format tiền VNĐ
 */
export function formatMoney(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}tr`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
}

/**
 * Format ngày
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}
