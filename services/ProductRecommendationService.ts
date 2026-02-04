/**
 * ProductRecommendationService.ts
 * 
 * Maps AI-detected issues to product recommendations
 * Part of the Insight-to-Action feature ("Bác sĩ kê đơn")
 */

import { groupBuyProducts, Product } from '../data/shopData';
import { DetectedIssue } from './VideoAnalysisService';
import { Hub } from '../types';
import { ALL_MOCK_HUBS } from '../data/mockHubData';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RecommendationResult {
    primary: Product | null;       // Main recommended product
    alternatives: Product[];       // Alternative products
    nearestHub: Hub | null;        // Nearest dealer hub
    deliveryTime: string;          // "2 giờ", "Trong ngày"
    distance: string;              // "2km"
}

export interface HubDistance {
    hub: Hub;
    distance: number; // km
}

// ═══════════════════════════════════════════════════════════════
// MAIN RECOMMENDATION FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Get product recommendations based on detected issues
 * @param issues - Issues detected by AI video analysis
 * @param userLocation - Optional user coordinates for hub distance calculation
 */
export function getProductRecommendations(
    issues: DetectedIssue[],
    userLocation?: { lat: number; lng: number }
): RecommendationResult {
    if (!issues || issues.length === 0) {
        return {
            primary: null,
            alternatives: [],
            nearestHub: null,
            deliveryTime: "N/A",
            distance: "N/A"
        };
    }

    // Find matching products for all issues
    const matchedProducts = findMatchingProducts(issues);

    // Get primary (highest match score) and alternatives
    const primary = matchedProducts[0] || null;
    const alternatives = matchedProducts.slice(1, 4); // Max 3 alternatives

    // Find nearest hub
    const { hub: nearestHub, distance } = findNearestHub(userLocation);

    // Estimate delivery time based on distance
    const deliveryTime = estimateDeliveryTime(distance);

    return {
        primary,
        alternatives,
        nearestHub: nearestHub as Hub || null,
        deliveryTime,
        distance: `${distance.toFixed(1)}km`
    };
}

// ═══════════════════════════════════════════════════════════════
// MATCHING LOGIC
// ═══════════════════════════════════════════════════════════════

interface ProductMatch {
    product: Product;
    score: number;
    matchedKeywords: string[];
}

function findMatchingProducts(issues: DetectedIssue[]): Product[] {
    const matches: ProductMatch[] = [];

    for (const product of groupBuyProducts) {
        let totalScore = 0;
        const matchedKeywords: string[] = [];

        for (const issue of issues) {
            const issueKeywords = extractKeywords(issue);

            for (const keyword of issueKeywords) {
                for (const treatableIssue of product.treatableIssues) {
                    if (treatableIssue.toLowerCase().includes(keyword.toLowerCase()) ||
                        keyword.toLowerCase().includes(treatableIssue.toLowerCase())) {
                        totalScore += getSeverityMultiplier(issue.severity);
                        matchedKeywords.push(keyword);
                    }
                }
            }
        }

        if (totalScore > 0) {
            matches.push({
                product,
                score: totalScore,
                matchedKeywords: [...new Set(matchedKeywords)]
            });
        }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches.map(m => m.product);
}

function extractKeywords(issue: DetectedIssue): string[] {
    const keywords: string[] = [];

    // From issue name
    keywords.push(...issue.name.toLowerCase().split(/[\s,]+/));

    // From issue name in English
    if (issue.nameEn) {
        keywords.push(...issue.nameEn.toLowerCase().split(/[\s,]+/));
    }

    // From issue type
    keywords.push(issue.type);

    // Filter out common words
    const stopWords = ['bệnh', 'của', 'và', 'hoặc', 'the', 'of', 'and', 'or', 'coffee', 'leaf'];
    return keywords.filter(k => k.length > 2 && !stopWords.includes(k));
}

function getSeverityMultiplier(severity: 'low' | 'medium' | 'high'): number {
    switch (severity) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 1;
    }
}

// ═══════════════════════════════════════════════════════════════
// HUB LOCATION LOGIC
// ═══════════════════════════════════════════════════════════════

function findNearestHub(userLocation?: { lat: number; lng: number }): HubDistance {
    // Default location: Chư Pah center
    const defaultLocation = { lat: 14.0167, lng: 108.0500 };
    const location = userLocation || defaultLocation;

    let nearestHub = ALL_MOCK_HUBS[0];
    let minDistance = Infinity;

    for (const hub of ALL_MOCK_HUBS) {
        const distance = haversineDistance(
            location.lat,
            location.lng,
            hub.location.lat,
            hub.location.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestHub = hub;
        }
    }

    return {
        hub: nearestHub as Hub,
        distance: minDistance
    };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

function estimateDeliveryTime(distanceKm: number): string {
    if (distanceKm <= 5) return "Giao trong 2 giờ";
    if (distanceKm <= 15) return "Giao trong 4 giờ";
    if (distanceKm <= 30) return "Giao trong ngày";
    return "Giao trong 1-2 ngày";
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Get single recommendation for backward compatibility
// ═══════════════════════════════════════════════════════════════

export function getRecommendationForIssue(issueName: string): Product | null {
    const lowerName = issueName.toLowerCase();

    // Find best match from products
    for (const product of groupBuyProducts) {
        for (const keyword of product.treatableIssues) {
            if (lowerName.includes(keyword) || keyword.includes(lowerName.split(' ')[0])) {
                return product;
            }
        }
    }

    return null;
}

export default {
    getProductRecommendations,
    getRecommendationForIssue
};
