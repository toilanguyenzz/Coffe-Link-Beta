/**
 * GreenCreditService.ts
 * 
 * Core service for Green Credit System - AI-powered agricultural decisions
 * 
 * Features:
 * - Weather analysis with financial impact (Prompt 1)
 * - Product green check with alternatives (Prompt 2)
 * - Points management with caching
 */

import { quickCheckProduct, BlacklistProduct, GreenlistProduct } from '../data/ProductBlacklist';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface WeatherAnalysisInput {
    weatherForecast: string;      // e.g., "Rain 50mm starting at 14:00"
    soilMoisture: string;         // e.g., "High (85%)"
    cropStatus: string;           // e.g., "Coffee Robusta - Fruit development"
    estimatedFertilizerCost: number; // e.g., 500000 (VND)
}

export interface WeatherAnalysisResult {
    status: 'RED' | 'GREEN' | 'YELLOW';
    message: string;
    potentialSavings?: number;    // Tiền có thể mất nếu bón phân sai thời điểm
    recommendation: 'STOP' | 'GO' | 'CAUTION';
    reason: string;
}

export interface ProductCheckResult {
    isHarmful: boolean;
    isGreen: boolean;
    warningText: string;
    pointChange: number;
    alternatives: string[];
    product?: BlacklistProduct | GreenlistProduct;
}

export interface GreenPointsBalance {
    points: number;
    rank: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';
    nextRankPoints: number;
    rewardsAvailable: Reward[];
}

export interface Reward {
    id: string;
    name: string;
    pointsCost: number;
    description: string;
    icon: string;
}

export interface PointTransaction {
    id: string;
    timestamp: Date;
    amount: number;
    reason: string;
    type: 'EARN' | 'SPEND' | 'DEDUCT';
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'green_credit_points';
const HISTORY_KEY = 'green_credit_history';

const RANK_THRESHOLDS = {
    'Đồng': 0,
    'Bạc': 500,
    'Vàng': 1500,
    'Kim Cương': 5000
};

const AVAILABLE_REWARDS: Reward[] = [
    { id: 'r1', name: 'Thẻ nạp 20K', pointsCost: 300, description: 'Đổi điểm lấy thẻ điện thoại 20.000đ', icon: '📱' },
    { id: 'r2', name: 'Giảm 10% phân bón', pointsCost: 500, description: 'Voucher giảm giá 10% khi mua phân bón', icon: '🏷️' },
    { id: 'r3', name: 'Thẻ nạp 50K', pointsCost: 700, description: 'Đổi điểm lấy thẻ điện thoại 50.000đ', icon: '📱' },
    { id: 'r4', name: 'Tư vấn miễn phí', pointsCost: 200, description: '1 buổi tư vấn kỹ thuật miễn phí', icon: '👨‍🏫' },
    { id: 'r5', name: 'Hạt giống xanh', pointsCost: 400, description: 'Gói hạt giống rau hữu cơ', icon: '🌱' }
];

// Weather analysis prompt (Prompt 1)
const WEATHER_ANALYSIS_PROMPT = `Bạn là một chuyên gia nông học Tây Nguyên thân thiện. Nhiệm vụ của bạn là phân tích thời tiết để đưa ra lời khuyên bón phân cho nông dân trồng cà phê.

Quy tắc:
- Nếu mưa > 20mm: KHUYÊN DỪNG (Cảnh báo lãng phí tiền, phân bị rửa trôi)
- Nếu nắng gắt/đất khô: KHUYÊN DỪNG (Sợ xót rễ, cây chết)
- Nếu đất ẩm/mát: KHUYÊN LÀM (Ngày vàng để bón)

Output: Trả về JSON gồm:
- status: 'RED' (Nguy hiểm), 'GREEN' (Tốt), hoặc 'YELLOW' (Cẩn thận)
- message: Lời khuyên ngắn gọn (dưới 30 từ), giọng văn bình dân, nhấn mạnh vào việc TIẾT KIỆM TIỀN hoặc KIẾM TIỀN. Đừng dùng từ chuyên môn.
- recommendation: 'STOP', 'GO', hoặc 'CAUTION'
- reason: Lý do ngắn gọn

CHỈ trả về JSON, không có text khác.`;

// Product check prompt (Prompt 2) - Only used when not in blacklist/greenlist
const PRODUCT_CHECK_PROMPT = `Bạn là Trợ lý Tín dụng Xanh của App Coffee ID.

Nhiệm vụ: Kiểm tra sản phẩm nông dân vừa chọn.

Quy tắc Logic:
- Danh sách ĐỎ (Cấm/Hại): Paraquat, Glyphosate, Chlorpyrifos, thuốc hóa học độc... → is_harmful: true, point_change: -50
- Danh sách XANH (Tốt): Phân hữu cơ, Thuốc sinh học, Nấm đối kháng... → is_harmful: false, point_change: +20
- Trung lập: Không rõ → is_harmful: false, point_change: 0

Output: JSON gồm:
- is_harmful: true/false
- warning_text: Cảnh báo hậu quả (mất điểm) và gợi ý thay thế. Giọng điệu lo lắng cho lợi ích của họ.
- point_change: Số điểm sẽ bị trừ hoặc cộng
- alternatives: Array các gợi ý thay thế

CHỈ trả về JSON, không có text khác.`;

// ═══════════════════════════════════════════════════════════════
// WEATHER ANALYSIS (Prompt 1)
// ═══════════════════════════════════════════════════════════════

/**
 * Phân tích thời tiết và đưa ra lời khuyên bón phân
 * Chạy 1 lần/ngày, cache theo vùng
 */
export async function analyzeWeatherForFarming(
    input: WeatherAnalysisInput
): Promise<WeatherAnalysisResult> {

    // 1. Try rule-based analysis first (faster, no API cost)
    const ruleBasedResult = analyzeWeatherRuleBased(input);
    if (ruleBasedResult.confidence > 0.8) {
        return ruleBasedResult.result;
    }

    // 2. Fall back to AI if rules are uncertain
    try {
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('No Gemini API key, using rule-based analysis');
            return ruleBasedResult.result;
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${WEATHER_ANALYSIS_PROMPT}\n\nDữ liệu đầu vào:\n${JSON.stringify(input, null, 2)}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 300
                    }
                })
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    status: parsed.status || 'YELLOW',
                    message: parsed.message || 'Không xác định được',
                    potentialSavings: input.estimatedFertilizerCost,
                    recommendation: parsed.recommendation || 'CAUTION',
                    reason: parsed.reason || ''
                };
            }
        }
    } catch (error) {
        console.error('AI weather analysis failed:', error);
    }

    return ruleBasedResult.result;
}

/**
 * Rule-based weather analysis (no API needed)
 */
function analyzeWeatherRuleBased(input: WeatherAnalysisInput): {
    result: WeatherAnalysisResult;
    confidence: number;
} {
    const forecast = input.weatherForecast.toLowerCase();
    const moisture = input.soilMoisture.toLowerCase();

    // Check for heavy rain
    const rainMatch = forecast.match(/(\d+)\s*mm/);
    const rainAmount = rainMatch ? parseInt(rainMatch[1]) : 0;

    if (rainAmount > 20 || forecast.includes('mưa to') || forecast.includes('heavy rain')) {
        return {
            result: {
                status: 'RED',
                message: `Bác ơi hôm nay mưa to ${rainAmount}mm! Đừng bón phân kẻo trôi mất ${input.estimatedFertilizerCost.toLocaleString()}đ tiền phân đấy!`,
                potentialSavings: input.estimatedFertilizerCost,
                recommendation: 'STOP',
                reason: 'Mưa lớn sẽ rửa trôi phân bón'
            },
            confidence: 0.95
        };
    }

    // Check for drought/hot weather
    if (forecast.includes('nắng gắt') || forecast.includes('hạn') ||
        moisture.includes('low') || moisture.includes('thấp')) {
        return {
            result: {
                status: 'RED',
                message: 'Đất đang khô quá bác ơi! Bón phân bây giờ sẽ xót rễ cây. Tưới nước trước đi đã!',
                potentialSavings: input.estimatedFertilizerCost,
                recommendation: 'STOP',
                reason: 'Đất khô sẽ gây xót rễ khi bón phân'
            },
            confidence: 0.9
        };
    }

    // Good conditions
    if ((moisture.includes('high') || moisture.includes('cao') || moisture.includes('đủ ẩm')) &&
        (forecast.includes('mát') || forecast.includes('cloudy') || rainAmount < 10)) {
        return {
            result: {
                status: 'GREEN',
                message: 'Đất đang đủ ẩm, trời mát. Hôm nay là NGÀY VÀNG để bón phân nuôi quả đấy bác!',
                recommendation: 'GO',
                reason: 'Điều kiện lý tưởng để bón phân'
            },
            confidence: 0.9
        };
    }

    // Default: cautious
    return {
        result: {
            status: 'YELLOW',
            message: 'Thời tiết bình thường. Bác có thể bón phân nhưng nên theo dõi thêm.',
            recommendation: 'CAUTION',
            reason: 'Điều kiện chưa rõ ràng'
        },
        confidence: 0.6
    };
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT CHECK (Prompt 2)
// ═══════════════════════════════════════════════════════════════

/**
 * Kiểm tra sản phẩm có hại không và tính điểm
 * Ưu tiên dùng blacklist/greenlist trước, chỉ gọi AI nếu không xác định
 */
export async function checkProductGreenStatus(
    productName: string,
    currentPoints: number = 0
): Promise<ProductCheckResult> {

    // 1. Quick check with local blacklist/greenlist (no API cost!)
    const quickResult = quickCheckProduct(productName);

    if (quickResult.status === 'BLACKLIST') {
        const product = quickResult.product as BlacklistProduct;
        return {
            isHarmful: true,
            isGreen: false,
            warningText: `Nguy hiểm bác ơi! ${product.name} ${product.reason}. Dùng là bị TRỪ ${product.pointDeduction} điểm Tín Dụng đấy!`,
            pointChange: -product.pointDeduction,
            alternatives: product.alternatives,
            product
        };
    }

    if (quickResult.status === 'GREENLIST') {
        const product = quickResult.product as GreenlistProduct;
        return {
            isHarmful: false,
            isGreen: true,
            warningText: `Tuyệt vời bác! ${product.name} ${product.benefit}. Bác được CỘNG ${product.pointBonus} điểm Xanh!`,
            pointChange: product.pointBonus,
            alternatives: [],
            product
        };
    }

    // 2. Unknown product - try AI check
    try {
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            // No API key, assume neutral
            return {
                isHarmful: false,
                isGreen: false,
                warningText: 'Sản phẩm trung lập, không cộng/trừ điểm.',
                pointChange: 0,
                alternatives: []
            };
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${PRODUCT_CHECK_PROMPT}\n\nSản phẩm cần kiểm tra: "${productName}"\nĐiểm hiện tại của user: ${currentPoints}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 300
                    }
                })
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    isHarmful: parsed.is_harmful || false,
                    isGreen: !parsed.is_harmful && parsed.point_change > 0,
                    warningText: parsed.warning_text || 'Không có thông tin',
                    pointChange: parsed.point_change || 0,
                    alternatives: parsed.alternatives || []
                };
            }
        }
    } catch (error) {
        console.error('AI product check failed:', error);
    }

    // Default: neutral
    return {
        isHarmful: false,
        isGreen: false,
        warningText: 'Không xác định được sản phẩm này.',
        pointChange: 0,
        alternatives: []
    };
}

// ═══════════════════════════════════════════════════════════════
// POINTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Get current green points balance
 */
export function getGreenPointsBalance(): GreenPointsBalance {
    try {
        const points = parseInt(localStorage.getItem(STORAGE_KEY) || '1000', 10);

        // Determine rank
        let rank: GreenPointsBalance['rank'] = 'Đồng';
        let nextRankPoints = RANK_THRESHOLDS['Bạc'];

        if (points >= RANK_THRESHOLDS['Kim Cương']) {
            rank = 'Kim Cương';
            nextRankPoints = points; // Already max
        } else if (points >= RANK_THRESHOLDS['Vàng']) {
            rank = 'Vàng';
            nextRankPoints = RANK_THRESHOLDS['Kim Cương'];
        } else if (points >= RANK_THRESHOLDS['Bạc']) {
            rank = 'Bạc';
            nextRankPoints = RANK_THRESHOLDS['Vàng'];
        }

        // Filter available rewards based on points
        const rewardsAvailable = AVAILABLE_REWARDS.filter(r => r.pointsCost <= points);

        return {
            points,
            rank,
            nextRankPoints,
            rewardsAvailable
        };
    } catch (error) {
        console.error('Error accessing localStorage for green points:', error);
        return {
            points: 1000,
            rank: 'Bạc',
            nextRankPoints: 1500,
            rewardsAvailable: []
        };
    }
}

/**
 * Add points to user balance
 */
export function addGreenPoints(amount: number, reason: string): PointTransaction {
    const currentPoints = parseInt(localStorage.getItem(STORAGE_KEY) || '1000', 10);
    const newPoints = currentPoints + amount;
    localStorage.setItem(STORAGE_KEY, newPoints.toString());

    const transaction: PointTransaction = {
        id: `pt_${Date.now()}`,
        timestamp: new Date(),
        amount,
        reason,
        type: 'EARN'
    };

    saveTransaction(transaction);
    return transaction;
}

/**
 * Deduct points from user balance
 */
export function deductGreenPoints(amount: number, reason: string): PointTransaction {
    const currentPoints = parseInt(localStorage.getItem(STORAGE_KEY) || '1000', 10);
    const newPoints = Math.max(0, currentPoints - amount);
    localStorage.setItem(STORAGE_KEY, newPoints.toString());

    const transaction: PointTransaction = {
        id: `pt_${Date.now()}`,
        timestamp: new Date(),
        amount: -amount,
        reason,
        type: 'DEDUCT'
    };

    saveTransaction(transaction);
    return transaction;
}

/**
 * Claim a reward
 */
export function claimReward(rewardId: string): { success: boolean; message: string } {
    const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId);
    if (!reward) {
        return { success: false, message: 'Phần thưởng không tồn tại' };
    }

    const balance = getGreenPointsBalance();
    if (balance.points < reward.pointsCost) {
        return { success: false, message: 'Không đủ điểm để đổi phần thưởng này' };
    }

    // Deduct points
    const currentPoints = parseInt(localStorage.getItem(STORAGE_KEY) || '1000', 10);
    localStorage.setItem(STORAGE_KEY, (currentPoints - reward.pointsCost).toString());

    const transaction: PointTransaction = {
        id: `pt_${Date.now()}`,
        timestamp: new Date(),
        amount: -reward.pointsCost,
        reason: `Đổi thưởng: ${reward.name}`,
        type: 'SPEND'
    };

    saveTransaction(transaction);

    return { success: true, message: `Đã đổi thành công ${reward.name}!` };
}

/**
 * Get transaction history
 */
export function getPointHistory(): PointTransaction[] {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        if (!historyJson) return [];

        return JSON.parse(historyJson);
    } catch (error) {
        console.error('Error accessing point history:', error);
        return [];
    }
}

/**
 * Save transaction to history
 */
function saveTransaction(transaction: PointTransaction): void {
    const history = getPointHistory();
    history.unshift(transaction);

    // Keep only last 50 transactions
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
}

// ═══════════════════════════════════════════════════════════════
// UNDO MECHANISM
// ═══════════════════════════════════════════════════════════════

const UNDO_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if a transaction can be undone
 */
export function canUndoTransaction(transactionId: string): boolean {
    const history = getPointHistory();
    const transaction = history.find(t => t.id === transactionId);

    if (!transaction) return false;

    const timeSince = Date.now() - new Date(transaction.timestamp).getTime();
    return timeSince < UNDO_WINDOW_MS;
}

/**
 * Undo a recent transaction
 */
export function undoTransaction(transactionId: string): { success: boolean; message: string } {
    if (!canUndoTransaction(transactionId)) {
        return { success: false, message: 'Không thể hoàn tác sau 1 giờ' };
    }

    const history = getPointHistory();
    const transaction = history.find(t => t.id === transactionId);

    if (!transaction) {
        return { success: false, message: 'Không tìm thấy giao dịch' };
    }

    // Reverse the transaction
    const currentPoints = parseInt(localStorage.getItem(STORAGE_KEY) || '1000', 10);
    const newPoints = currentPoints - transaction.amount; // Reverse: subtract what was added
    localStorage.setItem(STORAGE_KEY, Math.max(0, newPoints).toString());

    // Mark as undone in history
    const updatedHistory = history.map(t =>
        t.id === transactionId
            ? { ...t, reason: `[ĐÃ HOÀN TÁC] ${t.reason}` }
            : t
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    return { success: true, message: 'Đã hoàn tác thành công!' };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    // Weather
    analyzeWeatherForFarming,

    // Products
    checkProductGreenStatus,

    // Points
    getGreenPointsBalance,
    addGreenPoints,
    deductGreenPoints,
    claimReward,
    getPointHistory,

    // Undo
    canUndoTransaction,
    undoTransaction,

    // Constants
    AVAILABLE_REWARDS,
    RANK_THRESHOLDS
};
