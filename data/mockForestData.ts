/**
 * EUDR Mock Forest Data - Enhanced Triple Check System
 * 
 * Generates TWO dynamic mock zones for dual-layer verification:
 * 1. JRC Zone (EU Standard) - Spawns EAST of user position (Red)
 * 2. VN Forest Zone (Vietnam Law) - Spawns NORTH of user position (Green)
 * 
 * For demo purposes - zones "follow" the user so overlay is always visible.
 */

import * as turf from '@turf/turf';
import type { Feature, Polygon, Position } from 'geojson';

// Fixed demo location: Nông trường Cà phê Nghĩa Hưng, Chư Păh, Gia Lai
// Hardcoded for consistent demo experience
export const CHU_PAH_CENTER: [number, number] = [14.1350, 108.0350];
export const DEFAULT_CENTER: [number, number] = CHU_PAH_CENTER;

// Area limit for small farms (EUDR targets smallholders)
export const MAX_FARM_AREA_M2 = 40000; // 4 hectares in square meters
export const MAX_FARM_AREA_HA = 4;

// ═══════════════════════════════════════════════════════════════════════
// ZONE GENERATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Generate JRC Zone (EU Standard) - Spawns EAST of user
 * Uses turf.circle for clean circular boundary
 * 
 * @param centerLat - User's latitude
 * @param centerLng - User's longitude
 * @returns GeoJSON Feature<Polygon> representing JRC forbidden zone
 */
export const generateMockJRCZone = (
    centerLat: number = DEFAULT_CENTER[0],
    centerLng: number = DEFAULT_CENTER[1]
): Feature<Polygon> => {
    // Offset to EAST (~400m right)
    const zoneCenterLng = centerLng + 0.004;
    const zoneCenterLat = centerLat;

    // Create circular zone with 300m radius
    const circle = turf.circle(
        [zoneCenterLng, zoneCenterLat],
        0.3, // 300m radius
        { steps: 32, units: 'kilometers' }
    );

    // Add properties for identification
    return {
        ...circle,
        properties: {
            name: 'JRC EU ZONE (DEMO)',
            type: 'JRC_EU_STANDARD',
            source: 'JRC_Global_Forest_Cover_2020',
            description: 'Vùng rừng theo tiêu chuẩn vệ tinh Châu Âu',
        }
    } as Feature<Polygon>;
};

/**
 * Generate VN Forest Zone (Vietnam Law) - Spawns NORTH of user
 * Uses turf.circle for clean circular boundary
 * 
 * @param centerLat - User's latitude
 * @param centerLng - User's longitude
 * @returns GeoJSON Feature<Polygon> representing VN Forest forbidden zone
 */
export const generateMockVNForestZone = (
    centerLat: number = DEFAULT_CENTER[0],
    centerLng: number = DEFAULT_CENTER[1]
): Feature<Polygon> => {
    // Offset to NORTH (~400m up)
    const zoneCenterLng = centerLng;
    const zoneCenterLat = centerLat + 0.004;

    // Create circular zone with 300m radius
    const circle = turf.circle(
        [zoneCenterLng, zoneCenterLat],
        0.3, // 300m radius
        { steps: 32, units: 'kilometers' }
    );

    // Add properties for identification
    return {
        ...circle,
        properties: {
            name: 'RỪNG PHÒNG HỘ VN (DEMO)',
            type: 'VN_FOREST_LAW',
            source: 'Vietnam_Forest_Map_2020',
            description: 'Vùng rừng phòng hộ theo Luật Lâm nghiệp VN',
        }
    } as Feature<Polygon>;
};

/**
 * Get both mock zones at once for convenience
 */
export const getMockZones = (lat: number, lng: number) => {
    return {
        jrcZone: generateMockJRCZone(lat, lng),
        vnZone: generateMockVNForestZone(lat, lng),
    };
};

// ═══════════════════════════════════════════════════════════════════════
// ZONE STYLING
// ═══════════════════════════════════════════════════════════════════════

/**
 * Styling for JRC Zone (EU Standard) - RED theme
 */
export const JRC_ZONE_STYLE = {
    fillColor: 'rgba(220, 38, 38, 0.25)',    // Semi-transparent red
    strokeColor: 'rgba(220, 38, 38, 0.9)',   // Solid red border
    weight: 3,
    dashArray: '8, 4',                        // Dashed line
};

/**
 * Styling for VN Forest Zone - GREEN theme
 */
export const VN_FOREST_STYLE = {
    fillColor: 'rgba(22, 163, 74, 0.25)',    // Semi-transparent green
    strokeColor: 'rgba(22, 163, 74, 0.9)',   // Solid green border
    weight: 3,
    dashArray: '8, 4',                        // Dashed line
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get the center point of a zone for label placement
 */
export const getZoneCenter = (zone: Feature<Polygon>): [number, number] => {
    const centroid = turf.centroid(zone);
    const coords = centroid.geometry.coordinates;
    return [coords[1], coords[0]]; // Return as [lat, lng] for Leaflet
};

/**
 * Calculate zone area in hectares
 */
export const getZoneAreaHa = (zone: Feature<Polygon>): number => {
    const areaM2 = turf.area(zone);
    return areaM2 / 10000;
};

/**
 * Convert GeoJSON Polygon coordinates to Leaflet format [lat, lng][]
 */
export const zoneToLeafletCoords = (zone: Feature<Polygon>): [number, number][] => {
    const coords = zone.geometry.coordinates[0];
    // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
    return coords.map(coord => [coord[1], coord[0]] as [number, number]);
};

/**
 * Calculate intersection area between user polygon and a zone
 * Returns area in square meters
 */
export const calculateOverlapArea = (
    userPolygon: Feature<Polygon>,
    zone: Feature<Polygon>
): number => {
    try {
        const intersection = turf.intersect(
            turf.featureCollection([userPolygon, zone])
        );
        if (intersection) {
            return turf.area(intersection);
        }
    } catch (e) {
        console.warn('Intersection calculation error:', e);
    }
    return 0;
};

// ═══════════════════════════════════════════════════════════════════════
// LEGACY SUPPORT (Backwards compatibility)
// ═══════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use generateMockJRCZone or generateMockVNForestZone instead
 * Legacy single forest generator for backwards compatibility
 */
export const generateMockForest = (
    centerLat: number = DEFAULT_CENTER[0],
    centerLng: number = DEFAULT_CENTER[1],
    offsetLat: number = 0.005,
    offsetLng: number = 0.005
): Feature<Polygon> => {
    // Use the new JRC zone generator for legacy calls
    return generateMockJRCZone(centerLat + offsetLat, centerLng + offsetLng);
};

export const getForestCenter = getZoneCenter;
export const forestToLeafletCoords = zoneToLeafletCoords;
export const FOREST_STYLE = JRC_ZONE_STYLE;
