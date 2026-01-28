/**
 * EUDRChecker.ts - Logic Check Điều Kiện EUDR
 * EU Deforestation Regulation Compliance Check
 */

import { GardenData } from '../types';

export interface EUDRCheckResult {
    isCompliant: boolean;
    score: number; // 0-100
    checks: {
        hasBoundary: { passed: boolean; message: string };
        hasPlantingYear: { passed: boolean; message: string };
        beforeCutoff: { passed: boolean; message: string };
        hasMinArea: { passed: boolean; message: string };
        notInProtectedZone: { passed: boolean; message: string }; // Mock always true
    };
    missingItems: string[];
    recommendations: string[];
}

const EUDR_CUTOFF_YEAR = 2020; // 31/12/2020
const MIN_BOUNDARY_POINTS = 3;
const MIN_AREA_HA = 0.1; // Tối thiểu 0.1ha

/**
 * Check tuân thủ EUDR cho vườn
 */
export function checkEUDRCompliance(
    garden: GardenData | null,
    plantingYear?: number,
    areaHa?: number
): EUDRCheckResult {
    const checks = {
        hasBoundary: checkBoundary(garden),
        hasPlantingYear: checkPlantingYear(plantingYear),
        beforeCutoff: checkBeforeCutoff(plantingYear),
        hasMinArea: checkMinArea(areaHa || garden?.metrics?.areaHa),
        notInProtectedZone: checkProtectedZone(), // Mock
    };

    const passedCount = Object.values(checks).filter(c => c.passed).length;
    const score = Math.round((passedCount / Object.keys(checks).length) * 100);

    const isCompliant = checks.hasBoundary.passed &&
        checks.beforeCutoff.passed &&
        checks.notInProtectedZone.passed;

    const missingItems: string[] = [];
    const recommendations: string[] = [];

    if (!checks.hasBoundary.passed) {
        missingItems.push('Polygon ranh giới vườn');
        recommendations.push('Vẽ ranh giới vườn hoặc quét Sổ đỏ để lấy tọa độ chính xác');
    }

    if (!checks.hasPlantingYear.passed) {
        missingItems.push('Năm trồng cà phê');
        recommendations.push('Khai báo năm bắt đầu trồng cà phê');
    }

    if (!checks.beforeCutoff.passed && plantingYear) {
        missingItems.push('Vườn trồng sau 2020');
        recommendations.push('Vườn trồng sau 31/12/2020 cần chứng minh không phá rừng');
    }

    if (!checks.hasMinArea.passed) {
        missingItems.push('Diện tích tối thiểu');
        recommendations.push('Diện tích vườn phải tối thiểu 0.1 hecta');
    }

    return {
        isCompliant,
        score,
        checks,
        missingItems,
        recommendations
    };
}

function checkBoundary(garden: GardenData | null): { passed: boolean; message: string } {
    const hasEnoughPoints = (garden?.boundary?.length || 0) >= MIN_BOUNDARY_POINTS;
    return {
        passed: hasEnoughPoints,
        message: hasEnoughPoints
            ? `Có ${garden?.boundary?.length} điểm ranh giới`
            : 'Cần ít nhất 3 điểm để tạo ranh giới'
    };
}

function checkPlantingYear(year?: number): { passed: boolean; message: string } {
    return {
        passed: !!year && year >= 1950 && year <= new Date().getFullYear(),
        message: year ? `Năm trồng: ${year}` : 'Chưa khai báo năm trồng'
    };
}

function checkBeforeCutoff(year?: number): { passed: boolean; message: string } {
    if (!year) {
        return { passed: false, message: 'Cần xác định năm trồng' };
    }
    const passed = year <= EUDR_CUTOFF_YEAR;
    return {
        passed,
        message: passed
            ? `Trồng từ ${year}, trước mốc EUDR (2020) ✓`
            : `Trồng năm ${year}, sau mốc EUDR - cần chứng minh thêm`
    };
}

function checkMinArea(areaHa?: number): { passed: boolean; message: string } {
    const passed = (areaHa || 0) >= MIN_AREA_HA;
    return {
        passed,
        message: areaHa
            ? `Diện tích: ${areaHa.toFixed(2)} ha`
            : 'Chưa xác định diện tích'
    };
}

function checkProtectedZone(): { passed: boolean; message: string } {
    // Mock: Always pass - In production, check against forest/protected area maps
    return {
        passed: true,
        message: 'Không nằm trong vùng rừng bảo vệ ✓'
    };
}

/**
 * Get EUDR status badge info
 */
export function getEUDRBadge(result: EUDRCheckResult): {
    status: 'passed' | 'pending' | 'needs_review';
    label: string;
    color: string;
    icon: string;
} {
    if (result.isCompliant && result.score >= 80) {
        return { status: 'passed', label: 'EUDR Compliant', color: '#16a34a', icon: '✓' };
    }
    if (result.score >= 50) {
        return { status: 'pending', label: 'Đang xác minh', color: '#ca8a04', icon: '⏳' };
    }
    return { status: 'needs_review', label: 'Cần bổ sung', color: '#dc2626', icon: '!' };
}

/**
 * Calculate area from polygon (Shoelace formula)
 */
export function calculatePolygonArea(boundary: { lat: number; lng: number }[]): number {
    if (boundary.length < 3) return 0;

    // Convert to approximate meters (at Vietnam's latitude)
    const R = 6371000; // Earth radius in meters
    const toRad = (deg: number) => deg * Math.PI / 180;
    const avgLat = boundary.reduce((sum, p) => sum + p.lat, 0) / boundary.length;
    const metersPerDegreeLat = R * toRad(1);
    const metersPerDegreeLng = R * toRad(1) * Math.cos(toRad(avgLat));

    const points = boundary.map(p => ({
        x: p.lng * metersPerDegreeLng,
        y: p.lat * metersPerDegreeLat
    }));

    // Shoelace formula
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }

    const areaSqM = Math.abs(area) / 2;
    const areaHa = areaSqM / 10000;

    return areaHa;
}
