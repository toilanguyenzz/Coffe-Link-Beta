/**
 * CommunityAlertService.ts
 * 
 * Service xử lý tính năng "Cộng đồng cảnh báo" (Waze cho nông dân)
 * Cho phép nông dân báo mưa/thời tiết cục bộ và nhận thông báo từ vùng lân cận.
 */

export type AlertType = 'rain' | 'storm' | 'pest' | 'hail' | 'drought';

export interface CommunityAlert {
    id: string;
    type: AlertType;
    location: [number, number]; // [lat, lng]
    timestamp: Date;
    reporterName: string;
    reporterId: string;
    message?: string;
    distanceKm?: number; // Calculated based on viewer's location
}

export interface AlertStats {
    totalAlertsNearby: number;
    rainAlerts: number;
    stormAlerts: number;
    lastUpdated: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - Simulating alerts from nearby farmers
// ═══════════════════════════════════════════════════════════════════════════

// Demo location: Chư Păh, Gia Lai (13.9°N, 107.9°E)
const MOCK_ALERTS: CommunityAlert[] = [
    {
        id: 'alert-001',
        type: 'rain',
        location: [13.92, 107.88],
        timestamp: new Date(Date.now() - 15 * 60000), // 15 mins ago
        reporterName: 'Bác Tư',
        reporterId: 'user-001',
        message: 'Mưa to lắm bà con ơi!',
    },
    {
        id: 'alert-002',
        type: 'rain',
        location: [13.88, 107.92],
        timestamp: new Date(Date.now() - 30 * 60000), // 30 mins ago
        reporterName: 'Anh Ba',
        reporterId: 'user-002',
        message: 'Mưa rào đang đổ',
    },
    {
        id: 'alert-003',
        type: 'storm',
        location: [13.95, 107.85],
        timestamp: new Date(Date.now() - 45 * 60000), // 45 mins ago
        reporterName: 'Chú Năm',
        reporterId: 'user-003',
        message: 'Có sấm sét, cẩn thận!',
    },
    {
        id: 'alert-004',
        type: 'rain',
        location: [13.87, 107.95],
        timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
        reporterName: 'Cô Bảy',
        reporterId: 'user-004',
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculates distance between two points using Haversine formula
 */
export const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Formats time ago in Vietnamese
 */
export const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
};

/**
 * Gets alert type label in Vietnamese
 */
export const getAlertTypeLabel = (type: AlertType): string => {
    const labels: Record<AlertType, string> = {
        rain: '🌧️ Mưa',
        storm: '⛈️ Bão',
        pest: '🐛 Sâu bệnh',
        hail: '🧊 Mưa đá',
        drought: '☀️ Hạn',
    };
    return labels[type] || type;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SERVICE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all alerts within a radius of the user's location
 */
export const getAlertsByRadius = (
    userLat: number,
    userLng: number,
    radiusKm: number = 5
): CommunityAlert[] => {
    return MOCK_ALERTS
        .map((alert) => {
            const distance = calculateDistanceKm(
                userLat,
                userLng,
                alert.location[0],
                alert.location[1]
            );
            return { ...alert, distanceKm: Math.round(distance * 10) / 10 };
        })
        .filter((alert) => alert.distanceKm! <= radiusKm)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * Report a new weather alert from the user
 */
export const reportAlert = async (
    type: AlertType,
    userLat: number,
    userLng: number,
    reporterName: string,
    reporterId: string,
    message?: string
): Promise<CommunityAlert> => {
    // In a real app, this would POST to a backend
    const newAlert: CommunityAlert = {
        id: `alert-${Date.now()}`,
        type,
        location: [userLat, userLng],
        timestamp: new Date(),
        reporterName,
        reporterId,
        message,
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add to mock data (in memory only for demo)
    MOCK_ALERTS.unshift(newAlert);

    return newAlert;
};

/**
 * Get summary stats of alerts nearby
 */
export const getAlertStats = (
    userLat: number,
    userLng: number,
    radiusKm: number = 5
): AlertStats => {
    const nearbyAlerts = getAlertsByRadius(userLat, userLng, radiusKm);

    return {
        totalAlertsNearby: nearbyAlerts.length,
        rainAlerts: nearbyAlerts.filter((a) => a.type === 'rain').length,
        stormAlerts: nearbyAlerts.filter((a) => a.type === 'storm').length,
        lastUpdated: new Date(),
    };
};

/**
 * Check if there's an active rain warning nearby
 */
export const hasActiveRainWarning = (
    userLat: number,
    userLng: number,
    radiusKm: number = 5
): boolean => {
    const recentAlerts = getAlertsByRadius(userLat, userLng, radiusKm);
    const oneHourAgo = new Date(Date.now() - 60 * 60000);

    return recentAlerts.some(
        (alert) =>
            (alert.type === 'rain' || alert.type === 'storm') &&
            alert.timestamp > oneHourAgo
    );
};

export default {
    getAlertsByRadius,
    reportAlert,
    getAlertStats,
    hasActiveRainWarning,
    calculateDistanceKm,
    formatTimeAgo,
    getAlertTypeLabel,
};
