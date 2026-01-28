/**
 * PricingEngine.ts - Logic Giá Trượt (Sliding Price)
 * Giá giảm dần khi số lượng gom đơn tăng
 */

import { Campaign } from '../types';

export interface PriceTier {
    minProgress: number;  // 0-1
    discountPercent: number;
    label: string;
    color: string;
}

// Định nghĩa các mốc giá
export const PRICE_TIERS: PriceTier[] = [
    { minProgress: 0.80, discountPercent: 100, label: 'Giá Sàn! 🔥', color: '#dc2626' },
    { minProgress: 0.60, discountPercent: 80, label: 'Gần đạt!', color: '#ea580c' },
    { minProgress: 0.40, discountPercent: 60, label: 'Đang gom', color: '#ca8a04' },
    { minProgress: 0.20, discountPercent: 40, label: 'Mới bắt đầu', color: '#16a34a' },
    { minProgress: 0, discountPercent: 20, label: 'Khởi động', color: '#6b7280' },
];

/**
 * Tính giá trượt dựa trên progress hiện tại
 */
export function calculateSlidingPrice(campaign: Campaign, additionalQty: number = 0): number {
    const currentQty = campaign.currentQuantity + additionalQty;
    const progress = currentQty / campaign.targetQuantity;

    const priceDiff = campaign.originalPrice - campaign.dealPrice;

    // Tìm tier phù hợp
    const tier = PRICE_TIERS.find(t => progress >= t.minProgress) || PRICE_TIERS[PRICE_TIERS.length - 1];

    // Tính giá dựa trên tier
    const discount = priceDiff * (tier.discountPercent / 100);
    return Math.round(campaign.originalPrice - discount);
}

/**
 * Lấy thông tin tier hiện tại
 */
export function getCurrentPriceTier(campaign: Campaign, additionalQty: number = 0): PriceTier {
    const progress = (campaign.currentQuantity + additionalQty) / campaign.targetQuantity;
    return PRICE_TIERS.find(t => progress >= t.minProgress) || PRICE_TIERS[PRICE_TIERS.length - 1];
}

/**
 * Tính tiết kiệm so với giá gốc
 */
export function calculateSavings(campaign: Campaign, quantity: number, additionalQty: number = 0): {
    pricePerUnit: number;
    totalPrice: number;
    savedAmount: number;
    savedPercent: number;
} {
    const slidingPrice = calculateSlidingPrice(campaign, additionalQty);
    const totalPrice = slidingPrice * quantity;
    const originalTotal = campaign.originalPrice * quantity;
    const savedAmount = originalTotal - totalPrice;
    const savedPercent = Math.round((savedAmount / originalTotal) * 100);

    return {
        pricePerUnit: slidingPrice,
        totalPrice,
        savedAmount,
        savedPercent
    };
}

/**
 * Tính preview giá nếu đặt thêm
 */
export function previewPriceWithOrder(campaign: Campaign, orderQty: number): {
    currentPrice: number;
    newPrice: number;
    willUnlockNewTier: boolean;
    nextTierAt: number | null;
} {
    const currentPrice = calculateSlidingPrice(campaign);
    const newPrice = calculateSlidingPrice(campaign, orderQty);

    const currentProgress = campaign.currentQuantity / campaign.targetQuantity;
    const newProgress = (campaign.currentQuantity + orderQty) / campaign.targetQuantity;

    // Check if new tier will be unlocked
    const currentTier = PRICE_TIERS.find(t => currentProgress >= t.minProgress);
    const newTier = PRICE_TIERS.find(t => newProgress >= t.minProgress);

    const willUnlockNewTier = currentTier !== newTier;

    // Find next tier
    const nextTierIndex = PRICE_TIERS.findIndex(t => currentProgress >= t.minProgress) - 1;
    const nextTier = nextTierIndex >= 0 ? PRICE_TIERS[nextTierIndex] : null;
    const nextTierAt = nextTier
        ? Math.ceil(nextTier.minProgress * campaign.targetQuantity) - campaign.currentQuantity
        : null;

    return {
        currentPrice,
        newPrice,
        willUnlockNewTier,
        nextTierAt
    };
}

/**
 * Format giá tiền VND
 */
export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
