/**
 * MascotService.ts
 * 
 * Service managing the Đậu Đậu mascot's mood, messages, and interactions.
 * The mascot's state depends on user activity (diary logs, app usage) and
 * external factors (weather, coffee prices, time of day).
 * 
 * Xưng hô: Cháu - Bác (tạo cảm giác gia đình)
 * Giọng điệu: Lễ phép nhưng Tinh nghịch, dùng từ địa phương Tây Nguyên
 */

// --- TYPES ---

// Extended mood states per spec:
// - happy = "Béo Mầm" (Vui, căng bóng, da láng mịn)
// - sad = "Héo Hon" (Buồn, teo tóp, nhăn nheo)
// - panic = "Hoảng Loạn" (Sợ, đội mũ bảo hiểm, thổi còi)
// - sleepy = "Ngủ Gật" (Mặc đồ ngủ, ôm gối)
// - excited = "Hào Hứng" (Nhảy múa, bắn tim)
// - dizzy = "Chóng Mặt" (Mắt xoay vòng vòng - Easter egg)
// - idle = "Bình Thường" (Nháy mắt, lắc lư nhẹ)
export type MascotMood = 'happy' | 'sad' | 'panic' | 'sleepy' | 'excited' | 'dizzy' | 'idle';

// Mascot costume/accessory based on context
export type MascotCostume = 'default' | 'raincoat' | 'helmet' | 'sunglasses' | 'pajamas' | 'coffee_cup';

// Secret voucher state
export interface VoucherReward {
    code: string;
    discount: number; // in VND
    expiresAt: Date;
    claimed: boolean;
}

export interface MascotState {
    mood: MascotMood;
    health: number; // 0-100
    message: string | null;
    messageType: 'greeting' | 'warning' | 'celebration' | 'reminder' | 'tip' | 'easter_egg' | 'secret_reward';
    lastInteractionDate: Date | null;
    daysInactive: number;
    tapCount: number;
    totalTapCount: number; // Lifetime taps for 100-tap secret
    costume: MascotCostume;
    scanCount: number; // Number of QR scans today
    logCount: number; // Number of diary logs today
    secretVoucher: VoucherReward | null; // Secret 100-tap reward
}

export interface MascotMessage {
    text: string;
    mood: MascotMood;
    type: MascotState['messageType'];
    duration?: number; // milliseconds to show, default 4000
}

// --- MASCOT IMAGES ---

export const MASCOT_IMAGES: Record<MascotMood, string> = {
    happy: '/mascot/daudau_happy.png',
    sad: '/mascot/daudau_sad.png',
    panic: '/mascot/daudau_panic.png',
    sleepy: '/mascot/daudau_sleepy.png',
    excited: '/mascot/daudau_excited.png',
    dizzy: '/mascot/daudau_dizzy.png',
    idle: '/mascot/daudau_happy.png',
};

// --- MESSAGE BANKS ---

const MORNING_GREETINGS = [
    "Làm ly đen đá lấy sức ra rẫy không bác? Chúc bác ngày mới năng suất nha!",
    "Trời sáng rồi bác ơi! Cây cà phê đang đợi bác ngoài vườn kìa!",
    "Sáng nay khí trời mát quá! Ưng cái bụng heng bác!",
    "Dậy sớm thế bác! Chăm như con ong vậy đó!",
];

const AFTERNOON_GREETINGS = [
    "Bác làm cả buổi sáng rồi, nghỉ ngơi chút đi!",
    "Nắng gắt quá bác ơi! Nhớ uống nước nha!",
    "Chiều nay có gì hay ho không bác? Vô xem chợ tí không?",
];

const EVENING_GREETINGS = [
    "Một ngày làm việc vất vả rồi! Bác nghỉ ngơi đi nha!",
    "Tối rồi bác ơi! Mai dậy sớm lại chiến tiếp hen!",
    "Bác ơi! Nhớ ghi nhật ký hôm nay trước khi ngủ nha!",
];

const SAD_MESSAGES = [
    "Đói... Đói dữ liệu quá bác ơi... Cho cháu xin miếng nhật ký đi...",
    "Bác ơi bác quên cháu rồi sao? Mấy ngày nay không thấy bác đâu hết...",
    "Cháu buồn quá! Da cháu nhăn nheo hết rồi nè bác thấy không?",
    "Đói dữ liệu quá bác ơi... 2 ngày rồi bác chưa cho cháu ăn dòng nhật ký nào. Bác nỡ lòng nào để cháu teo tóp sao?",
];

const HAPPY_MESSAGES = [
    "Bác nuôi cháu khéo quá! Da cháu căng thế này bán mới được giá!",
    "Ưng cái bụng! Bác siêng quá trời luôn!",
    "Cháu khỏe re luôn nè! Cảm ơn bác đã chăm cháu!",
    "Hôm nay bác làm tốt lắm! Cháu tự hào về bác!",
];

const WEATHER_RAIN_MESSAGES = [
    "Mèn ơi, ông trời sắp khóc nhè rồi! Bác nhớ che chắn mấy bao phân bón kỹ nha, ướt hết tiền đó!",
    "Mưa to sắp về! Bác lo che chắn vườn tược đi kẻo ngập nước!",
    "Trời đang u ám nè bác! Nhớ mang áo mưa khi ra rẫy nha!",
];

const PRICE_UP_MESSAGES = [
    "Trúng mánh rồi Bác ơi! Giá hôm nay nhảy múa tưng bừng. Xem ngay kẻo lỡ!",
    "Mèn đét ơi! Giá cà phê đang nhảy múa tưng bừng bác ơi!",
    "Hốt bạc! Giá đang lên bác ơi! Coi thử đi!",
];

const SCAN_WARNING_MESSAGES = [
    "Nhớ quét mã vạch nha Bác! Thời buổi này Thạch Sanh thì ít, Lý Thông bán thuốc giả thì nhiều. Cẩn thận vẫn hơn!",
    "Coi chừng thuốc giả nha bác! Quét mã kiểm tra cho chắc ăn!",
];

const BANNED_CHEMICAL_MESSAGES = [
    "Báo động đỏ! Thuốc này cấm nha bác! Dừng tay lại ngay!",
    "Ối! Thuốc này không được phép xài đâu bác ơi! Bỏ ra nha!",
];

const EUDR_SUCCESS_MESSAGES = [
    "Duyệt! Vườn này bao đi Châu Âu. Bác cứ yên tâm kê cao gối ngủ.",
    "Xuất sắc! Vườn bác đạt chuẩn EUDR rồi! Đẳng cấp quốc tế luôn!",
];

const PEST_WARNING_MESSAGES = [
    "Hình như cây ở Lô 3 đang bị ngứa (Rệp sáp) đó bác. Bác ra gãi ngứa (phun thuốc) cho em nó chưa?",
    "Cây nhà mình có dấu hiệu bị sâu đó bác! Kiểm tra gấp nha!",
];

const DEAL_ALERT_MESSAGES = [
    "Bác Minh đầu làng vừa hốt được deal giảm 15%. Bác mà chậm tay là hết phần ráng chịu nha!",
    "Có deal ngon nè bác! Gom đơn đi cho rẻ!",
];

const EMPTY_CART_MESSAGES = [
    "Sao chợ vắng hoe vậy nè? Bác không định sắm sửa gì cho vụ tới à?",
    "Giỏ hàng trống không bác ơi! Vô mua đồ đi!",
];

const VIDEO_TRENDING_MESSAGES = [
    "Vào xem lẹ bác ơi! Ông Năm bên Đắk Lắk mới chỉ chiêu ghép cành độc lắm. Cả làng đang bàn tán xôn xao kìa.",
    "Video hot nè bác! Bà con đang xem sôi nổi lắm!",
];

const WATCH_TOO_LONG_MESSAGES = [
    "Thôi nghỉ tay tí đi bác, mắt mỏi rồi. Ra thăm vườn tí rồi tối về 'lướt' tiếp nha!",
    "Xem hơi lâu rồi đó bác! Mắt mỏi quá! Nghỉ ngơi tí đi!",
];

const LEVEL_UP_MESSAGES = [
    "Chúc mừng 'Đại Gia Phố Núi'! Bác vừa lên hạng Bạc rồi. Sắp đuổi kịp già làng Ksor rồi đó!",
    "Lên level rồi bác ơi! Đỉnh của chóp luôn!",
];

const REWARD_MESSAGES = [
    "Của một đồng, công một nén. Quà này là công sức cày cuốc cả tháng nay của bác đó!",
    "Quà cho bác nè! Xứng đáng với công sức bác bỏ ra!",
];

const DIZZY_MESSAGES = [
    "Bác đừng chọc lét cháu nữa, buồn cười quá!",
    "Ối chóng mặt quá! Bác chọc cháu chi dữ vậy!",
    "Xoay... xoay... cháu xỉu mất...",
];

const LOADING_MESSAGES = [
    "Đợi xíu, cháu đang chạy ra rẫy lấy dữ liệu...",
    "Cháu đang chạy nhanh như gió nè! Chờ xíu nha bác!",
    "Lấy dữ liệu cho bác đây... Nhanh thôi!",
];

const ERROR_MESSAGES = [
    "Ui da! Mất mạng rồi bác ơi. Bác đi ra chỗ thoáng xíu nhé.",
    "Mèn đét! Mạng lag quá! Thử lại tí nha bác!",
    "Có lỗi gì đó bác ơi! Cháu đang cố sửa...",
];

// Night mode messages (after 22h)
const NIGHT_MODE_MESSAGES = [
    "Khuya rồi bác ơi, ngủ sớm lấy sức mai ra rẫy. Cháu sập nguồn đây...",
    "Zzz... Đêm khuya rồi bác ơi... Ngủ ngon nha...",
    "Cháu buồn ngủ quá... Mai gặp lại bác nha...",
    "Ngáp... bác còn thức làm gì khuya thế này?",
];

// Single tap giggle messages
const SINGLE_TAP_MESSAGES = [
    "Hi hi! Bác chọc cháu chi vậy?",
    "Hehe! Nhột quá!",
    "Ôi! Bác làm cháu giật mình!",
    "Vui quá bác ơi!",
];

// Secret voucher reward (100 taps)
const SECRET_VOUCHER_MESSAGES = [
    "Bác kiên trì quá! Tặng bác món quà mọn uống nước! 🎁 Mã giảm 10.000đ: DAUDAU100",
    "Ôi trời! Bác chạm tới 100 lần rồi! Cháu phục bác sát đất! Đây là voucher 10k cho bác!",
];

// Full/Fat happy state (Béo Mầm)
const FULL_HAPPY_MESSAGES = [
    "Bác nuôi cháu mát tay quá! Da cháu căng thế này lái buôn nhìn là mê!",
    "No căng bụng rồi bác ơi! Cháu khỏe re!",
    "Điểm xanh của bác cao thế này, cháu mập ú ra rồi nè!",
];

// --- HELPER FUNCTIONS ---

function getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

// --- MAIN SERVICE FUNCTIONS ---

/**
 * Calculate mascot health based on user activity
 */
export function calculateHealth(daysInactive: number, diaryLogsCount: number): number {
    // Base health starts at 100
    let health = 100;

    // Reduce health for inactivity
    health -= daysInactive * 15; // -15 per inactive day

    // Bonus for diary logs (up to 20 points)
    health += Math.min(diaryLogsCount * 5, 20);

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, health));
}

/**
 * Determine mascot mood based on various factors
 */
export function determineMood(
    health: number,
    daysInactive: number,
    hasWeatherWarning: boolean,
    hasBannedChemical: boolean,
    priceIsUp: boolean,
    tapCount: number
): MascotMood {
    // Easter egg: dizzy after 5+ taps
    if (tapCount >= 5) return 'dizzy';

    // Panic states take priority
    if (hasBannedChemical) return 'panic';
    if (hasWeatherWarning) return 'panic';

    // Excited when price is up
    if (priceIsUp) return 'excited';

    // Health-based states
    if (health < 30) return 'sad';
    if (daysInactive >= 3) return 'sad';

    // Time-based defaults
    const timeOfDay = getTimeOfDay();
    if (timeOfDay === 'morning' && new Date().getHours() < 7) return 'sleepy';

    // Default happy
    return health >= 70 ? 'happy' : 'idle';
}

/**
 * Get appropriate greeting message based on time of day
 */
export function getGreetingMessage(): MascotMessage {
    const timeOfDay = getTimeOfDay();
    let messages: string[];
    let mood: MascotMood = 'happy';

    switch (timeOfDay) {
        case 'morning':
            messages = MORNING_GREETINGS;
            if (new Date().getHours() < 7) mood = 'sleepy';
            break;
        case 'afternoon':
            messages = AFTERNOON_GREETINGS;
            break;
        case 'evening':
        case 'night':
            messages = EVENING_GREETINGS;
            break;
        default:
            messages = MORNING_GREETINGS;
    }

    return {
        text: getRandomMessage(messages),
        mood,
        type: 'greeting',
        duration: 5000,
    };
}

/**
 * Get message for inactive user (sad state)
 */
export function getSadMessage(daysInactive: number): MascotMessage {
    return {
        text: getRandomMessage(SAD_MESSAGES).replace('2 ngày', `${daysInactive} ngày`),
        mood: 'sad',
        type: 'reminder',
        duration: 6000,
    };
}

/**
 * Get happy/congratulatory message
 */
export function getHappyMessage(): MascotMessage {
    return {
        text: getRandomMessage(HAPPY_MESSAGES),
        mood: 'happy',
        type: 'celebration',
        duration: 4000,
    };
}

/**
 * Get weather warning message
 */
export function getWeatherWarningMessage(): MascotMessage {
    return {
        text: getRandomMessage(WEATHER_RAIN_MESSAGES),
        mood: 'panic',
        type: 'warning',
        duration: 6000,
    };
}

/**
 * Get price increase celebration message
 */
export function getPriceUpMessage(): MascotMessage {
    return {
        text: getRandomMessage(PRICE_UP_MESSAGES),
        mood: 'excited',
        type: 'celebration',
        duration: 5000,
    };
}

/**
 * Get banned chemical warning message
 */
export function getBannedChemicalMessage(): MascotMessage {
    return {
        text: getRandomMessage(BANNED_CHEMICAL_MESSAGES),
        mood: 'panic',
        type: 'warning',
        duration: 8000,
    };
}

/**
 * Get EUDR success message
 */
export function getEudrSuccessMessage(): MascotMessage {
    return {
        text: getRandomMessage(EUDR_SUCCESS_MESSAGES),
        mood: 'excited',
        type: 'celebration',
        duration: 5000,
    };
}

/**
 * Get pest warning message
 */
export function getPestWarningMessage(): MascotMessage {
    return {
        text: getRandomMessage(PEST_WARNING_MESSAGES),
        mood: 'panic',
        type: 'warning',
        duration: 6000,
    };
}

/**
 * Get scan reminder message (marketplace)
 */
export function getScanReminderMessage(): MascotMessage {
    return {
        text: getRandomMessage(SCAN_WARNING_MESSAGES),
        mood: 'happy',
        type: 'tip',
        duration: 5000,
    };
}

/**
 * Get deal alert message
 */
export function getDealAlertMessage(): MascotMessage {
    return {
        text: getRandomMessage(DEAL_ALERT_MESSAGES),
        mood: 'excited',
        type: 'tip',
        duration: 5000,
    };
}

/**
 * Get empty cart message
 */
export function getEmptyCartMessage(): MascotMessage {
    return {
        text: getRandomMessage(EMPTY_CART_MESSAGES),
        mood: 'happy',
        type: 'tip',
        duration: 4000,
    };
}

/**
 * Get trending video message
 */
export function getTrendingVideoMessage(): MascotMessage {
    return {
        text: getRandomMessage(VIDEO_TRENDING_MESSAGES),
        mood: 'excited',
        type: 'tip',
        duration: 5000,
    };
}

/**
 * Get watching too long warning
 */
export function getWatchTooLongMessage(): MascotMessage {
    return {
        text: getRandomMessage(WATCH_TOO_LONG_MESSAGES),
        mood: 'happy',
        type: 'reminder',
        duration: 6000,
    };
}

/**
 * Get level up celebration message
 */
export function getLevelUpMessage(): MascotMessage {
    return {
        text: getRandomMessage(LEVEL_UP_MESSAGES),
        mood: 'excited',
        type: 'celebration',
        duration: 6000,
    };
}

/**
 * Get reward message
 */
export function getRewardMessage(): MascotMessage {
    return {
        text: getRandomMessage(REWARD_MESSAGES),
        mood: 'happy',
        type: 'celebration',
        duration: 5000,
    };
}

/**
 * Get dizzy/easter egg message
 */
export function getDizzyMessage(): MascotMessage {
    return {
        text: getRandomMessage(DIZZY_MESSAGES),
        mood: 'dizzy',
        type: 'easter_egg',
        duration: 4000,
    };
}

/**
 * Get loading message
 */
export function getLoadingMessage(): MascotMessage {
    return {
        text: getRandomMessage(LOADING_MESSAGES),
        mood: 'happy',
        type: 'tip',
        duration: 3000,
    };
}

/**
 * Get error/offline message
 */
export function getErrorMessage(): MascotMessage {
    return {
        text: getRandomMessage(ERROR_MESSAGES),
        mood: 'sad',
        type: 'warning',
        duration: 5000,
    };
}

/**
 * Get night mode message (after 22h)
 */
export function getNightModeMessage(): MascotMessage {
    return {
        text: getRandomMessage(NIGHT_MODE_MESSAGES),
        mood: 'sleepy',
        type: 'reminder',
        duration: 6000,
    };
}

/**
 * Get single tap giggle message
 */
export function getSingleTapMessage(): MascotMessage {
    return {
        text: getRandomMessage(SINGLE_TAP_MESSAGES),
        mood: 'happy',
        type: 'greeting',
        duration: 2500,
    };
}

/**
 * Get secret voucher reward message (100 taps easter egg)
 */
export function getSecretVoucherMessage(): MascotMessage {
    return {
        text: getRandomMessage(SECRET_VOUCHER_MESSAGES),
        mood: 'excited',
        type: 'secret_reward',
        duration: 10000, // Show longer so user can read/copy
    };
}

/**
 * Get full/fat happy message (Béo Mầm state)
 */
export function getFullHappyMessage(): MascotMessage {
    return {
        text: getRandomMessage(FULL_HAPPY_MESSAGES),
        mood: 'happy',
        type: 'celebration',
        duration: 5000,
    };
}

/**
 * Generate a secret voucher for 100-tap easter egg
 */
export function generateSecretVoucher(): VoucherReward {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    return {
        code: `DAUDAU${Date.now().toString(36).toUpperCase()}`,
        discount: 10000, // 10,000 VND
        expiresAt,
        claimed: false,
    };
}

/**
 * Check if it's night time (after 22h or before 5h)
 */
export function isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 5;
}

/**
 * Get costume based on context
 */
export function getCostume(context: {
    isRaining?: boolean;
    hasBannedChemical?: boolean;
    priceIsUp?: boolean;
    isNight?: boolean;
    isMorning?: boolean;
}): MascotCostume {
    if (context.isNight) return 'pajamas';
    if (context.isRaining) return 'raincoat';
    if (context.hasBannedChemical) return 'helmet';
    if (context.priceIsUp) return 'sunglasses';
    if (context.isMorning) return 'coffee_cup';
    return 'default';
}

/**
 * Get contextual message based on current tab
 */
export function getTabContextMessage(
    tab: 'home' | 'farm' | 'market' | 'community' | 'profile',
    context?: {
        priceIsUp?: boolean;
        hasWeatherWarning?: boolean;
        daysInactive?: number;
        cartIsEmpty?: boolean;
        hasTrendingVideo?: boolean;
    }
): MascotMessage | null {
    switch (tab) {
        case 'home':
            if (context?.priceIsUp) return getPriceUpMessage();
            if (context?.hasWeatherWarning) return getWeatherWarningMessage();
            return getGreetingMessage();

        case 'farm':
            if (context?.daysInactive && context.daysInactive >= 2) {
                return getSadMessage(context.daysInactive);
            }
            return null;

        case 'market':
            if (context?.cartIsEmpty) return getEmptyCartMessage();
            // Random chance to show scan reminder
            if (Math.random() < 0.3) return getScanReminderMessage();
            return null;

        case 'community':
            if (context?.hasTrendingVideo) return getTrendingVideoMessage();
            return null;

        case 'profile':
            return null;

        default:
            return null;
    }
}

// --- STORAGE HELPERS ---

const STORAGE_KEY = 'coffeelink_mascot_state';

export function saveMascotState(state: Partial<MascotState>): void {
    try {
        const existing = loadMascotState();
        const updated = { ...existing, ...state };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to save mascot state:', e);
    }
}

export function loadMascotState(): Partial<MascotState> {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...parsed,
                lastInteractionDate: parsed.lastInteractionDate
                    ? new Date(parsed.lastInteractionDate)
                    : null,
            };
        }
    } catch (e) {
        console.error('Failed to load mascot state:', e);
    }
    return {};
}

export function calculateDaysInactive(lastInteractionDate: Date | null): number {
    if (!lastInteractionDate) return 0;
    const now = new Date();
    const diff = now.getTime() - lastInteractionDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// --- EXPORTS ---

export default {
    MASCOT_IMAGES,
    calculateHealth,
    determineMood,
    getGreetingMessage,
    getSadMessage,
    getHappyMessage,
    getWeatherWarningMessage,
    getPriceUpMessage,
    getBannedChemicalMessage,
    getEudrSuccessMessage,
    getPestWarningMessage,
    getScanReminderMessage,
    getDealAlertMessage,
    getEmptyCartMessage,
    getTrendingVideoMessage,
    getWatchTooLongMessage,
    getLevelUpMessage,
    getRewardMessage,
    getDizzyMessage,
    getLoadingMessage,
    getErrorMessage,
    // New functions
    getNightModeMessage,
    getSingleTapMessage,
    getSecretVoucherMessage,
    getFullHappyMessage,
    generateSecretVoucher,
    isNightTime,
    getCostume,
    // Core
    getTabContextMessage,
    saveMascotState,
    loadMascotState,
    calculateDaysInactive,
};
