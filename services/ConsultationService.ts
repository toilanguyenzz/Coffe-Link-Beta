/**
 * ConsultationService.ts
 * 
 * AI-powered farm consultation engine for coffee cultivation.
 * Calculates watering, fertilizer, and cost recommendations based on:
 * - Farm area (from map)
 * - Tree count (user input)
 * - Current weather & forecast
 * - Season (dry/wet)
 * - Plant condition (user slider)
 * 
 * Formulas are based on Vietnamese coffee cultivation best practices.
 */

import { FullWeatherReport, SeasonInfo } from './WeatherService';

// --- TYPES ---

export type PlantCondition = 'wilted' | 'normal' | 'healthy';

export interface FarmInput {
    areaHectares: number;
    treeCount: number;
    condition: PlantCondition;
    centerCoords: { lat: number; lng: number };
}

export interface WateringRecommendation {
    litersPerTree: number;
    totalLiters: number;
    frequency: string;          // e.g., "2 ngày/lần"
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    costVND: number;
}

export interface FertilizerRecommendation {
    type: string;               // e.g., "NPK 16-16-8"
    gramsPerTree: number;
    totalKg: number;
    method: string;             // Application method
    timing: string;             // When to apply
    reason: string;
    costVND: number;
}

export interface ConsultationResult {
    status: {
        emoji: string;
        title: string;
        description: string;
        urgencyLevel: 'good' | 'attention' | 'critical';
    };
    watering: WateringRecommendation;
    fertilizer: FertilizerRecommendation;
    totalCostVND: number;
    tips: string[];
    weatherSummary: string;
    generatedAt: Date;
}

// --- CONSTANTS ---

// Water costs (VND per 1000 liters)
const WATER_COST_PER_1000L = 15000; // 15,000 VND / 1m³

// Fertilizer prices (VND per kg) - approximate market prices
const FERTILIZER_PRICES: Record<string, number> = {
    'NPK 16-16-8': 18000,
    'NPK 20-20-15': 22000,
    'DAP': 25000,
    'Ure': 15000,
    'Phân hữu cơ': 5000,
    'Phân vi sinh': 12000,
};

// Base watering requirements (liters per tree per irrigation)
const BASE_WATER = {
    dry_season: 180,    // More water in dry season
    wet_season: 80,     // Less water (rain helps)
    transition: 120,    // Moderate
};

// Condition adjustments (multiplier)
const CONDITION_WATER_MULTIPLIER = {
    wilted: 1.4,        // 40% more if wilted
    normal: 1.0,        // Normal amount
    healthy: 0.85,      // 15% less if healthy
};

// --- MAIN CONSULTATION FUNCTION ---

export const generateConsultation = async (
    farm: FarmInput,
    weather: FullWeatherReport
): Promise<ConsultationResult> => {

    // Calculate watering recommendation
    const watering = calculateWatering(farm, weather);

    // Calculate fertilizer recommendation
    const fertilizer = calculateFertilizer(farm, weather.season);

    // Generate status assessment
    const status = assessFarmStatus(farm, weather, watering);

    // Generate contextual tips
    const tips = generateTips(farm, weather, watering, fertilizer);

    // Weather summary for display
    const weatherSummary = generateWeatherSummary(weather);

    return {
        status,
        watering,
        fertilizer,
        totalCostVND: watering.costVND + fertilizer.costVND,
        tips,
        weatherSummary,
        generatedAt: new Date(),
    };
};

// --- WATERING CALCULATION ---

const calculateWatering = (
    farm: FarmInput,
    weather: FullWeatherReport
): WateringRecommendation => {
    const { treeCount, condition } = farm;
    const { season, forecast, current } = weather;

    // Base water amount by season
    let baseWater = BASE_WATER[season.season === 'dry' ? 'dry_season' :
        season.season === 'wet' ? 'wet_season' : 'transition'];

    // Adjust for plant condition
    baseWater *= CONDITION_WATER_MULTIPLIER[condition];

    // Adjust for weather
    if (!forecast.willRainIn3Days && season.season === 'dry') {
        baseWater *= 1.25; // 25% more if no rain coming in dry season
    }

    if (current.temperature > 32) {
        baseWater *= 1.15; // 15% more in extreme heat
    }

    if (current.humidity < 50) {
        baseWater *= 1.1; // 10% more in low humidity
    }

    // If rain is coming, reduce water
    if (forecast.willRainIn3Days && forecast.rainProbability > 60) {
        baseWater *= 0.6; // 40% less if heavy rain expected
    }

    const litersPerTree = Math.round(baseWater);
    const totalLiters = litersPerTree * treeCount;
    const costVND = Math.round((totalLiters / 1000) * WATER_COST_PER_1000L);

    // Determine urgency
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    if (condition === 'wilted' || (!forecast.willRainIn3Days && season.season === 'dry')) {
        urgency = 'high';
    } else if (forecast.willRainIn3Days || season.season === 'wet') {
        urgency = 'low';
    }

    // Determine frequency
    let frequency = '3 ngày/lần';
    if (season.season === 'dry') {
        frequency = condition === 'wilted' ? 'Hàng ngày' : '2 ngày/lần';
    } else if (season.season === 'wet') {
        frequency = 'Khi cần (theo dõi mưa)';
    }

    // Reason explanation
    let reason = '';
    if (!forecast.willRainIn3Days) {
        reason = `${forecast.daysWithRain === 0 ? '3 ngày tới không có mưa' : 'Ít mưa dự báo'}`;
    } else {
        reason = `Dự báo mưa ${forecast.expectedRainfall}mm trong ${forecast.daysWithRain} ngày tới`;
    }
    if (condition === 'wilted') {
        reason += ', cây đang thiếu nước';
    }

    return {
        litersPerTree,
        totalLiters,
        frequency,
        urgency,
        reason,
        costVND,
    };
};

// --- FERTILIZER CALCULATION ---

const calculateFertilizer = (
    farm: FarmInput,
    season: SeasonInfo
): FertilizerRecommendation => {
    const { treeCount, condition } = farm;
    const currentMonth = new Date().getMonth() + 1;

    // Determine fertilizer type based on growth stage and season
    let fertilizerType = 'NPK 16-16-8';
    let gramsPerTree = 300;
    let method = 'Rải đều quanh tán cây, cách gốc 50cm';
    let timing = 'Sáng sớm hoặc chiều mát';
    let reason = '';

    // Coffee growth stages (simplified for Vietnam Central Highlands)
    // Dec-Feb: Flowering → High P (DAP)
    // Mar-Jun: Fruit development → Balanced NPK
    // Jul-Sep: Fruit maturation → High K
    // Oct-Nov: Post-harvest → Organic matter

    if (currentMonth >= 12 || currentMonth <= 2) {
        // Flowering stage
        fertilizerType = 'DAP';
        gramsPerTree = 250;
        reason = 'Giai đoạn ra hoa, cần nhiều Phốt pho';
    } else if (currentMonth >= 3 && currentMonth <= 6) {
        // Fruit development
        fertilizerType = 'NPK 16-16-8';
        gramsPerTree = 350;
        reason = 'Giai đoạn nuôi quả, cần dinh dưỡng cân bằng';
    } else if (currentMonth >= 7 && currentMonth <= 9) {
        // Fruit maturation
        fertilizerType = 'NPK 20-20-15';
        gramsPerTree = 300;
        reason = 'Giai đoạn chín quả, cần Kali cao';
    } else {
        // Post-harvest recovery
        fertilizerType = 'Phân hữu cơ';
        gramsPerTree = 1000; // More organic matter
        reason = 'Sau thu hoạch, bổ sung hữu cơ phục hồi đất';
    }

    // Adjust for condition
    if (condition === 'wilted') {
        gramsPerTree *= 0.7; // Less fertilizer when stressed (focus on water first)
        timing = 'Sau khi tưới nước đủ 2-3 ngày';
        reason += '. Ưu tiên tưới nước trước';
    } else if (condition === 'healthy') {
        gramsPerTree *= 1.1; // Slightly more for healthy plants
    }

    // Wet season: prefer organic to prevent root burn
    if (season.season === 'wet') {
        method += '. Bón mỏng, chia nhiều đợt để tránh rửa trôi';
    }

    const totalKg = Math.round((gramsPerTree * treeCount) / 1000);
    const costVND = totalKg * (FERTILIZER_PRICES[fertilizerType] || 18000);

    return {
        type: fertilizerType,
        gramsPerTree: Math.round(gramsPerTree),
        totalKg,
        method,
        timing,
        reason,
        costVND,
    };
};

// --- STATUS ASSESSMENT ---

const assessFarmStatus = (
    farm: FarmInput,
    weather: FullWeatherReport,
    watering: WateringRecommendation
): ConsultationResult['status'] => {
    const { condition } = farm;
    const { season, forecast } = weather;

    // Critical: Wilted plants in dry season with no rain
    if (condition === 'wilted' && season.season === 'dry' && !forecast.willRainIn3Days) {
        return {
            emoji: '🚨',
            title: 'Vườn đang KHÁT!',
            description: 'Cần tưới nước NGAY để cứu cây. Không có mưa trong 3 ngày tới.',
            urgencyLevel: 'critical',
        };
    }

    // Attention: Needs care
    if (condition === 'wilted' || (season.season === 'dry' && !forecast.willRainIn3Days)) {
        return {
            emoji: '⚠️',
            title: 'Cần chú ý chăm sóc',
            description: season.season === 'dry'
                ? 'Mùa khô, cần duy trì lịch tưới đều đặn.'
                : 'Cây đang yếu, cần chăm sóc kịp thời.',
            urgencyLevel: 'attention',
        };
    }

    // Good: Everything is fine
    return {
        emoji: '✅',
        title: 'Vườn phát triển tốt',
        description: forecast.willRainIn3Days
            ? 'Thời tiết thuận lợi, có mưa hỗ trợ.'
            : 'Duy trì chế độ chăm sóc hiện tại.',
        urgencyLevel: 'good',
    };
};

// --- TIPS GENERATION ---

const generateTips = (
    farm: FarmInput,
    weather: FullWeatherReport,
    watering: WateringRecommendation,
    fertilizer: FertilizerRecommendation
): string[] => {
    const tips: string[] = [];
    const { season, forecast, current } = weather;

    // Weather-based tips
    if (current.temperature > 35) {
        tips.push('🌡️ Nhiệt độ cao: Tưới vào sáng sớm (5-7h) hoặc chiều muộn (17-18h).');
    }

    if (forecast.willRainIn3Days && forecast.rainProbability > 70) {
        tips.push('🌧️ Mưa lớn sắp tới: Kiểm tra hệ thống thoát nước, tránh ngập úng.');
    }

    // Season-based tips
    if (season.season === 'dry') {
        tips.push('☀️ Mùa khô: Phủ gốc bằng rơm để giữ ẩm, giảm bốc hơi.');
    } else if (season.season === 'wet') {
        tips.push('🌿 Mùa mưa: Theo dõi nấm bệnh (rỉ sắt, thán thư), phun phòng định kỳ.');
    }

    // Condition-based tips
    if (farm.condition === 'wilted') {
        tips.push('💧 Cây héo: Tưới nước từ từ, chia nhiều lần/ngày, tránh sốc rễ.');
    }

    // Cost-saving tips
    if (watering.totalLiters > 50000) {
        tips.push('💰 Tiết kiệm: Xem xét hệ thống tưới nhỏ giọt để giảm 30-40% nước.');
    }

    // Always add at least 2 tips
    if (tips.length < 2) {
        tips.push('📊 Ghi chép: Lưu lại nhật ký chăm sóc để theo dõi hiệu quả.');
    }

    return tips.slice(0, 4); // Max 4 tips
};

// --- WEATHER SUMMARY ---

const generateWeatherSummary = (weather: FullWeatherReport): string => {
    const { current, forecast, season } = weather;

    let summary = `${current.temperature}°C, ${current.description}`;
    summary += ` • Độ ẩm ${current.humidity}%`;
    summary += ` • ${season.seasonName}`;

    if (forecast.willRainIn3Days) {
        summary += ` • Dự báo mưa ${forecast.expectedRainfall}mm`;
    } else {
        summary += ' • 3 ngày tới không mưa';
    }

    return summary;
};

// --- UTILITY: FORMAT CURRENCY ---

export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default {
    generateConsultation,
    formatVND,
};
