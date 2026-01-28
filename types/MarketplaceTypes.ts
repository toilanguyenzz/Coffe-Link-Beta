/**
 * MarketplaceTypes.ts
 * Types for the "Chợ" (Marketplace) feature
 * Phase 1: Farmer app - One-click listing & Feed display
 */

// Product categories for agricultural by-products
export type ProductCategory =
    | 'COFFEE_HUSK'    // Vỏ cà phê
    | 'FERTILIZER'     // Phân bón
    | 'COMPOST'        // Phân hữu cơ
    | 'WOOD'           // Cành/Củi
    | 'OTHER';         // Khác

// Listing status workflow
export type ListingStatus =
    | 'PENDING'        // Chờ duyệt (AI check)
    | 'APPROVED'       // Đã duyệt, đang rao
    | 'SOLD'           // Đã bán
    | 'EXPIRED'        // Hết hạn (48h TTL)
    | 'REJECTED';      // Bị từ chối (spam/invalid)

// Product listing interface
export interface ProductListing {
    id: string;
    farmerId: string;
    farmerName?: string;
    farmerPhone?: string;

    // Product Info
    category: ProductCategory;
    title: string;
    description?: string;
    estimatedWeight: number;      // Number value
    weightUnit: 'kg' | 'tan';     // 1 tan = 1000kg
    pricePerUnit?: number;        // Optional price (VND)
    negotiable: boolean;          // "Thỏa thuận" flag

    // Media - URLs from Firebase Storage
    images: string[];             // Watermarked images
    originalImages: string[];     // Original uploads
    videoUrl?: string;            // Optional video

    // Location with GPS
    location: {
        lat: number;
        lng: number;
        address?: string;           // Human-readable address
        distanceKm?: number;        // Calculated distance to viewer
    };

    // Metadata
    status: ListingStatus;
    aiGeneratedDescription?: string;  // Phase 2: AI copywriter
    createdAt: any;               // Firestore Timestamp
    expiresAt: any;               // TTL: createdAt + 48h
    updatedAt?: any;
    viewCount: number;
    contactCount: number;         // Number of "Gọi điện" clicks
}

// Form data for one-click listing creation
export interface ListingFormData {
    category: ProductCategory;
    estimatedWeight: number;
    weightUnit: 'kg' | 'tan';
    pricePerUnit?: number;
    negotiable: boolean;
    images: File[];               // Local files before upload
    videoFile?: File;
}

// Seller stats for "Góc Của Tôi" section
export interface SellerStats {
    totalListings: number;        // All-time listings
    soldListings: number;         // Successfully sold
    totalEarnings: number;        // Sum of sold items (VND)
    activeListings: number;       // Currently live
}

// Category display config
export interface CategoryConfig {
    id: ProductCategory;
    label: string;
    icon: string;                 // Emoji or icon name
    color: string;                // Theme color
}

// Category configurations
export const PRODUCT_CATEGORIES: CategoryConfig[] = [
    { id: 'COFFEE_HUSK', label: 'Vỏ cà phê', icon: '🫘', color: '#8B4513' },
    { id: 'FERTILIZER', label: 'Phân bón', icon: '🌱', color: '#228B22' },
    { id: 'COMPOST', label: 'Phân hữu cơ', icon: '♻️', color: '#2E8B57' },
    { id: 'WOOD', label: 'Cành/Củi', icon: '🪵', color: '#A0522D' },
    { id: 'OTHER', label: 'Khác', icon: '📦', color: '#708090' },
];

// Helper function to get category label
export const getCategoryLabel = (category: ProductCategory): string => {
    return PRODUCT_CATEGORIES.find(c => c.id === category)?.label || 'Khác';
};

// Helper function to format weight display
export const formatWeight = (weight: number, unit: 'kg' | 'tan'): string => {
    if (unit === 'tan') {
        return `${weight} tấn`;
    }
    return weight >= 1000 ? `${(weight / 1000).toFixed(1)} tấn` : `${weight} kg`;
};

// Helper function to format price
export const formatPrice = (price?: number, negotiable?: boolean): string => {
    if (negotiable || !price) {
        return 'Thỏa thuận';
    }
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}tr/tấn`;
    }
    return `${(price / 1000).toFixed(0)}k/tấn`;
};
