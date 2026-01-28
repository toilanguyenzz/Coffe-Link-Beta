/**
 * RewardSystem.ts - Hệ thống điểm thưởng
 * Gamification cho nông dân
 */

import { REWARD_POINTS_CONFIG } from '../data/mockData';
import * as LocalStorage from './LocalStorageService';

// ============ TYPES ============

export type RewardAction =
    | 'JOIN_CAMPAIGN'
    | 'PURCHASE'
    | 'REFERRAL_SUCCESS'
    | 'DAILY_CHECKIN'
    | 'COMPLETE_SURVEY'
    | 'SCAN_CERTIFICATE'
    | 'EUDR_COMPLIANT';

export interface RewardLevel {
    level: number;
    name: string;
    minPoints: number;
    badge: string;
    perks: string[];
}

// ============ LEVELS ============

export const REWARD_LEVELS: RewardLevel[] = [
    {
        level: 1,
        name: 'Nông Dân Mới',
        minPoints: 0,
        badge: '🌱',
        perks: ['Tham gia cộng đồng']
    },
    {
        level: 2,
        name: 'Nông Dân Chăm Chỉ',
        minPoints: 100,
        badge: '🌿',
        perks: ['Ưu tiên nhận deal mới', 'Xem giá sớm']
    },
    {
        level: 3,
        name: 'Nông Dân Pro',
        minPoints: 300,
        badge: '🌳',
        perks: ['Giảm 2% phí dịch vụ', 'Hỗ trợ ưu tiên']
    },
    {
        level: 4,
        name: 'Nông Dân Xanh',
        minPoints: 600,
        badge: '🏆',
        perks: ['Giảm 5% phí dịch vụ', 'Badge EUDR ưu tiên', 'Kết nối nhà mua']
    },
    {
        level: 5,
        name: 'Đại Sứ Xanh',
        minPoints: 1000,
        badge: '👑',
        perks: ['Giảm 10% phí dịch vụ', 'Profile nổi bật', 'Tham gia sự kiện VIP']
    },
];

// ============ MAIN FUNCTIONS ============

/**
 * Thêm điểm thưởng cho user
 */
export function addPoints(
    userId: string,
    action: RewardAction,
    amount?: number
): { points: number; description: string; newTotal: number } {
    let points = 0;
    let description = '';

    switch (action) {
        case 'JOIN_CAMPAIGN':
            points = REWARD_POINTS_CONFIG.JOIN_CAMPAIGN;
            description = '🎯 Tham gia Deal gom đơn';
            break;
        case 'PURCHASE':
            points = Math.floor((amount || 0) / 10000) * REWARD_POINTS_CONFIG.PURCHASE_PER_10K;
            description = `💰 Mua hàng ${formatVND(amount || 0)}`;
            break;
        case 'REFERRAL_SUCCESS':
            points = REWARD_POINTS_CONFIG.REFERRAL_SUCCESS;
            description = '👥 Giới thiệu thành công';
            break;
        case 'DAILY_CHECKIN':
            points = REWARD_POINTS_CONFIG.DAILY_CHECKIN;
            description = '📅 Check-in hàng ngày';
            break;
        case 'COMPLETE_SURVEY':
            points = REWARD_POINTS_CONFIG.COMPLETE_SURVEY;
            description = '📝 Hoàn thành khảo sát';
            break;
        case 'SCAN_CERTIFICATE':
            points = REWARD_POINTS_CONFIG.SCAN_CERTIFICATE;
            description = '📄 Quét Sổ đỏ thành công';
            break;
        case 'EUDR_COMPLIANT':
            points = REWARD_POINTS_CONFIG.EUDR_COMPLIANT;
            description = '🌍 Đạt chuẩn EUDR';
            break;
    }

    if (points > 0) {
        LocalStorage.addRewardPoints(userId, points, action, description);
    }

    const newTotal = LocalStorage.getRewardPoints(userId);

    return { points, description, newTotal };
}

/**
 * Lấy điểm hiện tại của user
 */
export function getPoints(userId: string): number {
    return LocalStorage.getRewardPoints(userId);
}

/**
 * Lấy level hiện tại
 */
export function getCurrentLevel(userId: string): RewardLevel {
    const points = getPoints(userId);
    for (let i = REWARD_LEVELS.length - 1; i >= 0; i--) {
        if (points >= REWARD_LEVELS[i].minPoints) {
            return REWARD_LEVELS[i];
        }
    }
    return REWARD_LEVELS[0];
}

/**
 * Lấy level tiếp theo
 */
export function getNextLevel(userId: string): RewardLevel | null {
    const current = getCurrentLevel(userId);
    const nextIndex = REWARD_LEVELS.findIndex(l => l.level === current.level) + 1;
    return nextIndex < REWARD_LEVELS.length ? REWARD_LEVELS[nextIndex] : null;
}

/**
 * Tính tiến độ đến level tiếp theo
 */
export function getLevelProgress(userId: string): {
    current: RewardLevel;
    next: RewardLevel | null;
    progress: number; // 0-100
    pointsToNext: number;
} {
    const points = getPoints(userId);
    const current = getCurrentLevel(userId);
    const next = getNextLevel(userId);

    if (!next) {
        return { current, next: null, progress: 100, pointsToNext: 0 };
    }

    const pointsInLevel = points - current.minPoints;
    const pointsForLevel = next.minPoints - current.minPoints;
    const progress = Math.min(100, Math.round((pointsInLevel / pointsForLevel) * 100));
    const pointsToNext = next.minPoints - points;

    return { current, next, progress, pointsToNext };
}

/**
 * Lấy lịch sử điểm
 */
export function getHistory(userId: string): LocalStorage.RewardHistoryItem[] {
    return LocalStorage.getRewardHistory(userId);
}

/**
 * Check daily check-in
 */
export function canCheckIn(userId: string): boolean {
    const history = getHistory(userId);
    const today = new Date().toISOString().split('T')[0];
    return !history.some(h =>
        h.action === 'DAILY_CHECKIN' &&
        h.createdAt.startsWith(today)
    );
}

/**
 * Perform daily check-in
 */
export function doCheckIn(userId: string): { success: boolean; points: number } {
    if (!canCheckIn(userId)) {
        return { success: false, points: 0 };
    }
    const result = addPoints(userId, 'DAILY_CHECKIN');
    return { success: true, points: result.points };
}

// ============ HELPERS ============

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
