/**
 * LunarCalendarService.ts
 * 
 * Service tính toán Lịch Âm (Lunar Calendar) và lời khuyên nông vụ
 * dựa trên pha trăng cho nông dân Việt Nam.
 * 
 * Áp dụng kiến thức nông nghiệp truyền thống kết hợp khoa học.
 */

export interface LunarDate {
    day: number;
    month: number;
    year: number;
    isLeapMonth: boolean;
    dayName: string;      // Mùng 1, Mùng 2, ... 15 (Rằm), 30 (Cuối tháng)
    monthName: string;    // Tháng Giêng, Tháng Hai, ...
}

export interface MoonPhase {
    phase: 'new' | 'waxing' | 'full' | 'waning';
    phaseName: string;
    illumination: number; // 0-100%
    icon: string;
}

export interface LunarFarmingAdvice {
    title: string;
    advice: string;
    priority: 'high' | 'medium' | 'low';
    emoji: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LUNAR CALENDAR CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

// Vietnamese lunar month names
const LUNAR_MONTHS = [
    'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
    'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
    'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'
];

// Simplified lunar date calculation
// Note: This is an approximation. For production, use a proper lunar library.
const getLunarNewYear = (solarYear: number): Date => {
    // Approximate lunar new year dates (Tết)
    const tetDates: Record<number, [number, number]> = {
        2024: [2, 10],  // Feb 10, 2024
        2025: [1, 29],  // Jan 29, 2025
        2026: [2, 17],  // Feb 17, 2026
        2027: [2, 6],   // Feb 6, 2027
    };
    const [month, day] = tetDates[solarYear] || [2, 1];
    return new Date(solarYear, month - 1, day);
};

/**
 * Calculate approximate lunar date from solar date
 * This is a simplified algorithm for demo purposes.
 */
export const getLunarDate = (solarDate: Date = new Date()): LunarDate => {
    const year = solarDate.getFullYear();
    const tetDate = getLunarNewYear(year);

    // If before Tết, use previous year's lunar calendar
    let lunarYear = year;
    let refTet = tetDate;
    if (solarDate < tetDate) {
        lunarYear = year - 1;
        refTet = getLunarNewYear(year - 1);
    }

    // Calculate days since lunar new year
    const daysSinceTet = Math.floor(
        (solarDate.getTime() - refTet.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Approximate lunar month (~29.5 days per month)
    const lunarMonth = Math.floor(daysSinceTet / 29.5) + 1;
    const lunarDay = (daysSinceTet % 29.5) + 1;

    // Clamp values
    const clampedMonth = Math.min(12, Math.max(1, Math.floor(lunarMonth)));
    const clampedDay = Math.min(30, Math.max(1, Math.floor(lunarDay)));

    // Day name
    let dayName = `${clampedDay}`;
    if (clampedDay <= 10) dayName = `Mùng ${clampedDay}`;
    if (clampedDay === 15) dayName = '15 (Rằm)';
    if (clampedDay === 30) dayName = '30 (Cuối tháng)';
    if (clampedDay === 1) dayName = 'Mùng 1 (Sóc)';

    return {
        day: clampedDay,
        month: clampedMonth,
        year: lunarYear,
        isLeapMonth: false,
        dayName,
        monthName: LUNAR_MONTHS[clampedMonth - 1] || `Tháng ${clampedMonth}`,
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// MOON PHASE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get moon phase based on lunar day
 */
export const getMoonPhase = (lunarDay: number): MoonPhase => {
    // Lunar months are ~29.5 days
    // Day 1 = New Moon (Sóc)
    // Day 7-8 = First Quarter (Trăng lưỡi liềm)
    // Day 15 = Full Moon (Rằm)
    // Day 22-23 = Last Quarter

    if (lunarDay <= 2 || lunarDay >= 29) {
        return {
            phase: 'new',
            phaseName: 'Trăng non (Sóc)',
            illumination: lunarDay <= 2 ? lunarDay * 5 : (30 - lunarDay) * 5,
            icon: '🌑',
        };
    }

    if (lunarDay <= 7) {
        return {
            phase: 'waxing',
            phaseName: 'Trăng lưỡi liềm',
            illumination: Math.round((lunarDay / 15) * 100),
            icon: '🌒',
        };
    }

    if (lunarDay <= 11) {
        return {
            phase: 'waxing',
            phaseName: 'Trăng bán nguyệt',
            illumination: Math.round((lunarDay / 15) * 100),
            icon: '🌓',
        };
    }

    if (lunarDay <= 17) {
        return {
            phase: 'full',
            phaseName: 'Trăng tròn (Rằm)',
            illumination: 100 - Math.abs(15 - lunarDay) * 5,
            icon: '🌕',
        };
    }

    if (lunarDay <= 22) {
        return {
            phase: 'waning',
            phaseName: 'Trăng khuyết',
            illumination: Math.round(((30 - lunarDay) / 15) * 100),
            icon: '🌖',
        };
    }

    return {
        phase: 'waning',
        phaseName: 'Trăng cuối tháng',
        illumination: Math.round(((30 - lunarDay) / 15) * 100),
        icon: '🌘',
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// FARMING ADVICE BASED ON MOON PHASE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get farming advice based on lunar day and moon phase
 * Combines traditional knowledge with scientific observations.
 */
export const getMoonPhaseAdvice = (lunarDay: number): LunarFarmingAdvice[] => {
    const advice: LunarFarmingAdvice[] = [];

    // Full moon (Rằm) - Days 14-16
    if (lunarDay >= 14 && lunarDay <= 16) {
        advice.push({
            title: 'Trăng tròn - Sâu bọ hoạt động mạnh',
            advice: 'Đêm nay sâu đục thân và bướm đẻ trứng mạnh. Ra vườn soi đèn bắt bướm ngay!',
            priority: 'high',
            emoji: '🦋',
        });
        advice.push({
            title: 'Không nên thu hoạch',
            advice: 'Hạt cà phê chứa nhiều nước hơn vào ngày rằm. Chờ 2-3 ngày sau sẽ tốt hơn.',
            priority: 'medium',
            emoji: '⏳',
        });
    }

    // New moon (Sóc) - Days 1-2 or 29-30
    if (lunarDay <= 2 || lunarDay >= 29) {
        advice.push({
            title: 'Trăng non - Thời điểm gieo trồng',
            advice: 'Đây là thời điểm tốt để gieo hạt và trồng cây mới. Năng lượng đang đi lên.',
            priority: 'medium',
            emoji: '🌱',
        });
    }

    // Waxing moon (Days 3-14) - Growth phase
    if (lunarDay >= 3 && lunarDay <= 14) {
        advice.push({
            title: 'Trăng đầy dần - Pha sinh trưởng',
            advice: 'Thời điểm tốt để bón phân, tưới nước. Cây hấp thụ dinh dưỡng tốt hơn.',
            priority: 'low',
            emoji: '💧',
        });
    }

    // Waning moon (Days 17-28) - Harvest phase
    if (lunarDay >= 17 && lunarDay <= 28) {
        advice.push({
            title: 'Trăng khuyết - Pha thu hoạch',
            advice: 'Thời điểm tốt để thu hoạch và cắt tỉa. Hạt ít nước, dễ phơi khô.',
            priority: 'medium',
            emoji: '✂️',
        });
    }

    // Special dates
    if (lunarDay === 1) {
        advice.push({
            title: 'Mùng 1 - Ngày tốt',
            advice: 'Ngày đẹp để bắt đầu công việc mới. Tránh cắt cây, đốn hạ.',
            priority: 'low',
            emoji: '🙏',
        });
    }

    // If no specific advice, give general tip
    if (advice.length === 0) {
        advice.push({
            title: 'Ngày bình thường',
            advice: 'Không có lưu ý đặc biệt. Tiếp tục công việc thường ngày.',
            priority: 'low',
            emoji: '☀️',
        });
    }

    return advice;
};

/**
 * Get display string for lunar date
 */
export const formatLunarDate = (date: LunarDate): string => {
    return `${date.dayName} ${date.monthName}`;
};

/**
 * Get short lunar date for badge display
 */
export const formatLunarDateShort = (date: LunarDate): string => {
    return `${date.day} Â.L`;
};

export default {
    getLunarDate,
    getMoonPhase,
    getMoonPhaseAdvice,
    formatLunarDate,
    formatLunarDateShort,
};
