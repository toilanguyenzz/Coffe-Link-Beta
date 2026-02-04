/**
 * WeatherService.ts
 * 
 * Provides weather data and seasonal information for farm consultation.
 * Uses OpenWeatherMap API with GPS coordinates from user's farm.
 * 
 * Features:
 * - Current weather conditions
 * - 3-day rain forecast
 * - Season detection (dry/wet) for Vietnam's Central Highlands
 * - Graceful fallback when API unavailable
 */

// --- TYPES ---

export interface WeatherData {
    temperature: number;        // Celsius
    humidity: number;           // Percentage
    description: string;        // Vietnamese description
    icon: string;              // Weather icon code
    isRaining: boolean;        // Currently raining
    windSpeed: number;         // m/s
}

export interface RainForecast {
    willRainIn3Days: boolean;
    rainProbability: number;   // 0-100%
    expectedRainfall: number;  // mm
    daysWithRain: number;      // Count of rainy days ahead
}

export interface SeasonInfo {
    season: 'dry' | 'wet' | 'transition';
    seasonName: string;        // Vietnamese name
    recommendation: string;    // Brief advice
}

export interface FullWeatherReport {
    current: WeatherData;
    forecast: RainForecast;
    season: SeasonInfo;
    location: string;
    fetchedAt: Date;
}

// --- CONSTANTS ---

// Vietnam Central Highlands coordinates (Đắk Lắk region)
const DEFAULT_COORDS = { lat: 12.6667, lng: 108.0500 };

// OpenWeatherMap API (using free tier)
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// Vietnamese weather descriptions
const WEATHER_DESCRIPTIONS: Record<string, string> = {
    'clear sky': 'Trời quang',
    'few clouds': 'Ít mây',
    'scattered clouds': 'Mây rải rác',
    'broken clouds': 'Nhiều mây',
    'overcast clouds': 'U ám',
    'shower rain': 'Mưa rào',
    'rain': 'Mưa',
    'light rain': 'Mưa nhẹ',
    'moderate rain': 'Mưa vừa',
    'heavy intensity rain': 'Mưa lớn',
    'thunderstorm': 'Giông bão',
    'mist': 'Sương mù',
    'fog': 'Sương mù dày',
};

// --- SEASON DETECTION ---

/**
 * Detects the agricultural season based on current date and location.
 * Vietnam Central Highlands coffee calendar:
 * - Dry season (Mùa khô): Nov - Apr → Focus on watering
 * - Wet season (Mùa mưa): May - Oct → Focus on fertilizing, disease prevention
 */
export const detectSeason = (date: Date = new Date()): SeasonInfo => {
    const month = date.getMonth() + 1; // 1-12

    // Dry season: November to April
    if (month >= 11 || month <= 4) {
        return {
            season: 'dry',
            seasonName: 'Mùa khô',
            recommendation: 'Ưu tiên tưới nước đầy đủ, chống hạn cho cây.'
        };
    }

    // Transition periods: May, October
    if (month === 5 || month === 10) {
        return {
            season: 'transition',
            seasonName: 'Giao mùa',
            recommendation: 'Theo dõi sát thời tiết, chuẩn bị chuyển đổi chế độ chăm sóc.'
        };
    }

    // Wet season: June to September
    return {
        season: 'wet',
        seasonName: 'Mùa mưa',
        recommendation: 'Bón phân, phòng ngừa nấm bệnh, thoát nước tốt.'
    };
};

// --- WEATHER API FUNCTIONS ---

/**
 * Fetches current weather data from OpenWeatherMap.
 * Falls back to estimated data if API fails.
 */
export const getCurrentWeather = async (
    lat: number = DEFAULT_COORDS.lat,
    lng: number = DEFAULT_COORDS.lng
): Promise<WeatherData> => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    // If no API key, return estimated weather based on season
    if (!apiKey) {
        console.warn('Weather API key not configured. Using estimated data.');
        return getEstimatedWeather();
    }

    try {
        const response = await fetch(
            `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            description: WEATHER_DESCRIPTIONS[data.weather[0]?.description] || data.weather[0]?.description,
            icon: data.weather[0]?.icon || '01d',
            isRaining: data.weather[0]?.main === 'Rain' || data.weather[0]?.main === 'Drizzle',
            windSpeed: data.wind?.speed || 0
        };
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        return getEstimatedWeather();
    }
};

/**
 * Fetches 5-day forecast and analyzes rain probability.
 */
export const getRainForecast = async (
    lat: number = DEFAULT_COORDS.lat,
    lng: number = DEFAULT_COORDS.lng
): Promise<RainForecast> => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    if (!apiKey) {
        console.warn('Weather API key not configured. Using estimated forecast.');
        return getEstimatedForecast();
    }

    try {
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast?lat=${lat}&lon=${lng}&units=metric&cnt=24&appid=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }

        const data = await response.json();

        // Analyze next 3 days (24 data points = 3 days at 3-hour intervals)
        let totalRainfall = 0;
        let rainyPeriods = 0;

        data.list.slice(0, 24).forEach((item: any) => {
            const rain = item.rain?.['3h'] || 0;
            totalRainfall += rain;
            if (rain > 0) rainyPeriods++;
        });

        const rainProbability = Math.min(100, Math.round((rainyPeriods / 24) * 100));
        const daysWithRain = Math.ceil(rainyPeriods / 8); // 8 periods per day

        return {
            willRainIn3Days: rainProbability > 30,
            rainProbability,
            expectedRainfall: Math.round(totalRainfall * 10) / 10,
            daysWithRain
        };
    } catch (error) {
        console.error('Failed to fetch forecast:', error);
        return getEstimatedForecast();
    }
};

/**
 * Gets complete weather report including current, forecast, and season.
 */
export const getFullWeatherReport = async (
    lat: number = DEFAULT_COORDS.lat,
    lng: number = DEFAULT_COORDS.lng
): Promise<FullWeatherReport> => {
    const [current, forecast] = await Promise.all([
        getCurrentWeather(lat, lng),
        getRainForecast(lat, lng)
    ]);

    return {
        current,
        forecast,
        season: detectSeason(),
        location: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        fetchedAt: new Date()
    };
};

// --- FALLBACK ESTIMATIONS ---

/**
 * Returns estimated weather when API is unavailable.
 * Based on typical Central Highlands conditions.
 */
const getEstimatedWeather = (): WeatherData => {
    const season = detectSeason();
    const hour = new Date().getHours();

    // Base temperature varies by time of day
    let baseTemp = 24;
    if (hour >= 10 && hour <= 16) baseTemp = 28;
    if (hour >= 20 || hour <= 5) baseTemp = 20;

    // Dry season is hotter, wet season is cooler
    if (season.season === 'dry') baseTemp += 2;
    if (season.season === 'wet') baseTemp -= 1;

    return {
        temperature: baseTemp,
        humidity: season.season === 'wet' ? 85 : 65,
        description: season.season === 'wet' ? 'Có thể có mưa' : 'Nắng nóng',
        icon: season.season === 'wet' ? '10d' : '01d',
        isRaining: false,
        windSpeed: 2
    };
};

/**
 * Returns estimated forecast when API is unavailable.
 */
const getEstimatedForecast = (): RainForecast => {
    const season = detectSeason();

    if (season.season === 'wet') {
        return {
            willRainIn3Days: true,
            rainProbability: 70,
            expectedRainfall: 25,
            daysWithRain: 2
        };
    }

    if (season.season === 'transition') {
        return {
            willRainIn3Days: true,
            rainProbability: 40,
            expectedRainfall: 10,
            daysWithRain: 1
        };
    }

    return {
        willRainIn3Days: false,
        rainProbability: 15,
        expectedRainfall: 0,
        daysWithRain: 0
    };
};

// --- UTILITY FUNCTIONS ---

/**
 * Formats weather for display in Vietnamese.
 */
export const formatWeatherSummary = (report: FullWeatherReport): string => {
    const { current, forecast, season } = report;

    let summary = `${current.temperature}°C, ${current.description}. `;
    summary += `Độ ẩm ${current.humidity}%. `;

    if (forecast.willRainIn3Days) {
        summary += `Dự báo có mưa trong ${forecast.daysWithRain} ngày tới (${forecast.expectedRainfall}mm). `;
    } else {
        summary += `3 ngày tới không mưa. `;
    }

    summary += season.seasonName + '.';

    return summary;
};

// ═══════════════════════════════════════════════════════════════════════════
// DRYING INDEX & HARVEST ADVISOR (New for Community Weather Hub)
// ═══════════════════════════════════════════════════════════════════════════

export interface DryingIndex {
    consecutiveSunnyDays: number;  // Number of sunny days ahead
    indexScore: number;            // 0-100 score
    status: 'golden' | 'good' | 'risky' | 'danger';
    statusLabel: string;
}

export interface HarvestAdvice {
    canHarvest: boolean;
    title: string;
    message: string;
    urgency: 'now' | 'wait' | 'stop';
    emoji: string;
}

/**
 * Calculate Drying Index based on weather forecast.
 * Used to advise farmers on optimal harvest timing.
 */
export const getDryingIndex = (forecast: RainForecast): DryingIndex => {
    // Calculate consecutive sunny days (inverse of rainy days)
    const sunnyDays = 3 - forecast.daysWithRain;

    // Score based on rain probability (inverse relationship)
    const indexScore = Math.max(0, 100 - forecast.rainProbability);

    // Determine status
    let status: DryingIndex['status'];
    let statusLabel: string;

    if (sunnyDays >= 3 && forecast.rainProbability < 20) {
        status = 'golden';
        statusLabel = 'CƠ HỘI VÀNG';
    } else if (sunnyDays >= 2 && forecast.rainProbability < 40) {
        status = 'good';
        statusLabel = 'Tốt';
    } else if (sunnyDays >= 1 && forecast.rainProbability < 60) {
        status = 'risky';
        statusLabel = 'Rủi ro';
    } else {
        status = 'danger';
        statusLabel = 'Nguy hiểm';
    }

    return {
        consecutiveSunnyDays: Math.max(0, sunnyDays),
        indexScore,
        status,
        statusLabel,
    };
};

/**
 * Get harvest advice based on drying index.
 * Tells farmers whether to harvest now or wait.
 */
export const getHarvestAdvice = (dryingIndex: DryingIndex): HarvestAdvice => {
    switch (dryingIndex.status) {
        case 'golden':
            return {
                canHarvest: true,
                title: 'CƠ HỘI VÀNG!',
                message: `Cắt cà ngay! Phơi ${dryingIndex.consecutiveSunnyDays} nắng liền là đạt chuẩn Hạng 1.`,
                urgency: 'now',
                emoji: '🌟',
            };
        case 'good':
            return {
                canHarvest: true,
                title: 'Thời tiết tốt',
                message: `Có thể thu hoạch. ${dryingIndex.consecutiveSunnyDays} ngày nắng đủ phơi khô.`,
                urgency: 'now',
                emoji: '✅',
            };
        case 'risky':
            return {
                canHarvest: false,
                title: 'Cân nhắc kỹ',
                message: 'Có khả năng mưa. Nếu cắt, cần chuẩn bị bạt che.',
                urgency: 'wait',
                emoji: '⚠️',
            };
        case 'danger':
        default:
            return {
                canHarvest: false,
                title: 'DỪNG CẮT!',
                message: 'Đừng tham! Cắt về không phơi được là thối hết. Chờ nắng lên!',
                urgency: 'stop',
                emoji: '🛑',
            };
    }
};

export default {
    getCurrentWeather,
    getRainForecast,
    getFullWeatherReport,
    detectSeason,
    formatWeatherSummary,
    getDryingIndex,
    getHarvestAdvice,
};

