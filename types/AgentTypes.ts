/**
 * AgentTypes.ts
 * Types for the Agent (Đại lý thu mua) module
 */

// Agent registration/approval status
export type AgentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// Coffee product types
export type CoffeeType = 'FRESH' | 'BEAN' | 'HUSK';
export type CoffeeTypeLabel = 'Cà phê Tươi' | 'Cà phê Nhân' | 'Vỏ cà phê';

// EUDR compliance status
export type EudrStatus = 'PASSED' | 'WARNING' | 'UNKNOWN';

// Agent profile (KYC data)
export interface AgentProfile {
    id: string;
    userId: string;

    // Business info
    shopName: string;
    taxId?: string;
    phone: string;

    // KYC Documents (URLs from Firebase Storage)
    kycDocuments: {
        cccdFront: string;      // Ảnh CCCD mặt trước
        cccdBack: string;       // Ảnh CCCD mặt sau
        shopSignage: string;    // Ảnh biển hiệu cửa hàng
        warehousePhoto: string; // Ảnh kho bãi
    };

    // Location
    location: {
        lat: number;
        lng: number;
    };
    address: string;

    // Status
    status: AgentStatus;
    rejectionReason?: string;

    // Timestamps
    createdAt: any;
    approvedAt?: any;
    approvedBy?: string;    // Admin UID who approved
    updatedAt?: any;
}

// Coffee purchase order
export interface PurchaseOrder {
    id: string;
    agentId: string;
    farmerId: string;
    farmerName?: string;
    farmerPhone?: string;

    // Product details
    coffeeType: CoffeeType;
    weight: number;         // kg
    moisture: number;       // % độ ẩm
    impurity: number;       // % tạp chất
    qualityGrade: 'A' | 'B' | 'C';

    // EUDR status from check
    eudrStatus: EudrStatus;
    eudrDetails?: {
        hasShadeTree: boolean;
        shadeTreeCount: number;
        deforestationRisk: boolean;
        chemicalWarning: boolean;
    };

    // Pricing
    pricePerKg: number;
    totalAmount: number;

    // Debt settlement
    debtApplied: number;    // Số tiền trừ nợ
    amountPaid: number;     // Số tiền thực trả

    // Traceability
    lotId: string;          // ID lô hàng cho truy xuất
    gardenId?: string;      // Link to farmer's garden

    // Status
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    syncedToServer: boolean; // For offline mode

    createdAt: any;
    completedAt?: any;
}

// Inventory lot (for warehouse management)
export interface InventoryLot {
    id: string;
    agentId: string;

    // From purchase
    purchaseOrderId: string;
    farmerId: string;
    farmerName?: string;

    // Product
    coffeeType: CoffeeType;
    weight: number;
    qualityGrade: 'A' | 'B' | 'C';

    // EUDR
    eudrCompliant: boolean;

    // Status
    status: 'IN_STOCK' | 'SOLD' | 'TRANSFERRED';
    soldToOrderId?: string;

    createdAt: any;
    updatedAt?: any;
}

// Sale order to Coffee ID
export interface SaleOrder {
    id: string;
    agentId: string;

    // Lots being sold
    lotIds: string[];
    totalWeight: number;

    // Pricing
    pricePerKg: number;
    totalAmount: number;

    // Logistics
    pickupScheduled?: any;
    pickupCompleted?: any;

    // Traceability transfer
    traceabilityTransferred: boolean;

    status: 'PENDING' | 'SCHEDULED' | 'PICKED_UP' | 'COMPLETED';
    createdAt: any;
}

// Today's stats for dashboard
export interface AgentDailyStats {
    date: string;           // YYYY-MM-DD
    purchaseCount: number;
    totalWeightKg: number;
    totalSpent: number;
    averagePricePerKg: number;
}

// System notification for agent
export interface AgentNotification {
    id: string;
    type: 'PURCHASE_REQUEST' | 'PRICE_UPDATE' | 'SYSTEM' | 'APPROVAL';
    title: string;
    message: string;
    actionUrl?: string;
    read: boolean;
    createdAt: any;
}

// Coffee market price
export interface CoffeeMarketPrice {
    source: 'LONDON' | 'NEWYORK' | 'LOCAL';
    priceUSD?: number;      // International price
    priceVND: number;       // Local price per kg
    change: number;         // % change from yesterday
    updatedAt: any;
}

// Coffee type labels mapping
export const COFFEE_TYPE_LABELS: Record<CoffeeType, CoffeeTypeLabel> = {
    'FRESH': 'Cà phê Tươi',
    'BEAN': 'Cà phê Nhân',
    'HUSK': 'Vỏ cà phê',
};

// Quality grade colors
export const QUALITY_GRADE_COLORS: Record<string, string> = {
    'A': '#22c55e',  // Green
    'B': '#f59e0b',  // Orange
    'C': '#ef4444',  // Red
};

// Default prices per kg based on EUDR status
export const DEFAULT_PRICES: Record<EudrStatus, number> = {
    'PASSED': 100000,   // 100k/kg for EUDR compliant
    'WARNING': 80000,   // 80k/kg for non-compliant (domestic only)
    'UNKNOWN': 85000,   // 85k/kg when status unknown
};
