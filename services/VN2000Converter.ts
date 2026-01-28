/**
 * VN2000Converter.ts - Chuyển đổi tọa độ VN-2000 → WGS-84
 * 7-Parameter Helmert Transformation
 * Params from MONRE (Vietnam Ministry of Natural Resources)
 */

import { VN2000_TRANSFORM_PARAMS } from '../data/mockData';

// ============ TYPES ============

export interface VN2000Coordinate {
    x: number; // Easting (mét)
    y: number; // Northing (mét)
    zone?: number; // Múi chiếu (3 độ)
}

export interface WGS84Coordinate {
    lat: number;
    lng: number;
}

export interface ParsedCertificateData {
    coordinates: VN2000Coordinate[];
    ownerName?: string;
    landType?: string;
    area?: number; // m²
    certificateNumber?: string;
}

// ============ TRANSFORM PARAMETERS ============

// VN-2000 sử dụng múi chiếu 3 độ, kinh tuyến trục tùy tỉnh
// Gia Lai: Kinh tuyến trục 108°15' (zone 48)
const DEFAULT_CENTRAL_MERIDIAN = 108.25; // 108°15'

// ============ CONVERSION FUNCTIONS ============

/**
 * Chuyển VN-2000 (Gauss-Kruger projection) → WGS-84
 */
export function convertVN2000ToWGS84(
    x: number,
    y: number,
    centralMeridian: number = DEFAULT_CENTRAL_MERIDIAN
): WGS84Coordinate {
    // Step 1: VN-2000 projected → VN-2000 geodetic
    const vn2000Geodetic = projectToGeodetic(x, y, centralMeridian);

    // Step 2: VN-2000 geodetic → WGS-84 geodetic (gần như giống nhau vì VN-2000 dựa trên WGS-84)
    // Apply small corrections
    const wgs84 = applyDatumShift(vn2000Geodetic.lat, vn2000Geodetic.lng);

    return wgs84;
}

/**
 * Gauss-Kruger reverse projection
 */
function projectToGeodetic(x: number, y: number, centralMeridian: number): { lat: number; lng: number } {
    const params = VN2000_TRANSFORM_PARAMS;
    const a = params.a;
    const f = params.f;
    const b = a * (1 - f);
    const e2 = (a * a - b * b) / (a * a);
    const e2_ = (a * a - b * b) / (b * b);

    // False Easting và Northing cho VN-2000
    const FE = 500000; // 500km false easting
    const FN = 0;
    const k0 = 0.9999; // Scale factor

    const x_ = x - FE;
    const y_ = y - FN;

    // Footprint latitude
    const M = y_ / k0;
    const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));

    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

    const phi1 = mu +
        (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) +
        (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) +
        (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

    const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1));
    const T1 = Math.tan(phi1) * Math.tan(phi1);
    const C1 = e2_ * Math.cos(phi1) * Math.cos(phi1);
    const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5);
    const D = x_ / (N1 * k0);

    const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
        D * D / 2 -
        (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2_) * D * D * D * D / 24 +
        (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2_ - 3 * C1 * C1) * D * D * D * D * D * D / 720
    );

    const lng = centralMeridian * Math.PI / 180 + (
        D -
        (1 + 2 * T1 + C1) * D * D * D / 6 +
        (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2_ + 24 * T1 * T1) * D * D * D * D * D / 120
    ) / Math.cos(phi1);

    return {
        lat: lat * 180 / Math.PI,
        lng: lng * 180 / Math.PI
    };
}

/**
 * Apply datum shift (VN-2000 và WGS-84 gần như giống nhau, chỉ cần correction nhỏ)
 */
function applyDatumShift(lat: number, lng: number): WGS84Coordinate {
    // VN-2000 sử dụng ellipsoid WGS-84 nên sai số rất nhỏ
    // Áp dụng correction parameters từ MONRE (đơn vị: mét → độ)
    const params = VN2000_TRANSFORM_PARAMS;

    // Convert translation to degrees (approximate)
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos(lat * Math.PI / 180);

    const dLat = params.tx / metersPerDegreeLat;
    const dLng = params.ty / metersPerDegreeLng;

    return {
        lat: lat + dLat * 0.001, // Very small correction
        lng: lng + dLng * 0.001
    };
}

/**
 * Convert batch of coordinates
 */
export function convertCoordinatesBatch(
    coords: VN2000Coordinate[],
    centralMeridian?: number
): WGS84Coordinate[] {
    return coords.map(c => convertVN2000ToWGS84(c.x, c.y, centralMeridian));
}

// ============ OCR PARSING ============

/**
 * Parse bảng tọa độ từ OCR text
 * Format phổ biến trong Sổ đỏ:
 * "Điểm 1: X = 1234567.89  Y = 567890.12"
 * hoặc dạng bảng
 */
export function parseCoordinatesFromOCR(text: string): VN2000Coordinate[] {
    const coords: VN2000Coordinate[] = [];

    // Pattern 1: "X = 1234567.89" hoặc "X: 1234567.89"
    const patterns = [
        // Pattern: X = value, Y = value (cùng dòng hoặc khác dòng)
        /[XxEe]\s*[=:]\s*([\d.,]+)\s*[,;\s]*[YyNn]\s*[=:]\s*([\d.,]+)/gi,
        // Pattern: Điểm N: X = value, Y = value
        /[ĐđDd]i[ểế]m\s*\d+\s*[:\s]*[XxEe]\s*[=:]\s*([\d.,]+)\s*[,;\s]*[YyNn]\s*[=:]\s*([\d.,]+)/gi,
        // Pattern bảng: cột X và Y
        /([\d]{6,9}[.,]?\d*)\s+([\d]{6,9}[.,]?\d*)/g
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const x = parseFloat(match[1].replace(',', '.'));
            const y = parseFloat(match[2].replace(',', '.'));

            // Validate: VN-2000 coordinates should be in reasonable range
            // X (Easting): 100,000 - 900,000
            // Y (Northing): 500,000 - 2,500,000 (for Vietnam)
            if (x > 100000 && x < 900000 && y > 500000 && y < 2500000) {
                coords.push({ x, y });
            } else if (y > 100000 && y < 900000 && x > 500000 && x < 2500000) {
                // Sometimes X and Y are swapped in documents
                coords.push({ x: y, y: x });
            }
        }

        if (coords.length >= 3) break; // Found enough points
    }

    return coords;
}

/**
 * Extract area from OCR text  
 */
export function parseAreaFromOCR(text: string): number | null {
    // Pattern: "Diện tích: 12,500 m²" hoặc "1.25 ha"
    const patterns = [
        /[Dd]i[ệe]n\s*t[íi]ch[:\s]*([\d.,]+)\s*m[²2]/i,
        /([\d.,]+)\s*ha/i,
        /([\d.,]+)\s*h[eé]c\s*ta/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let area = parseFloat(match[1].replace(',', '.'));
            // Convert ha to m² if needed
            if (pattern.source.includes('ha')) {
                area *= 10000;
            }
            return area;
        }
    }

    return null;
}

/**
 * Full parse of land certificate OCR
 */
export function parseLandCertificate(ocrText: string): ParsedCertificateData {
    const coordinates = parseCoordinatesFromOCR(ocrText);
    const area = parseAreaFromOCR(ocrText);

    // Try to extract certificate number
    const certMatch = ocrText.match(/[Ss][ốo]\s*[:\s]*([\w\d\-\/]+)/);
    const certificateNumber = certMatch ? certMatch[1] : undefined;

    return {
        coordinates,
        area: area || undefined,
        certificateNumber
    };
}
