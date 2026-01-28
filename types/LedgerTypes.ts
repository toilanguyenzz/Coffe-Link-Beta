/**
 * LedgerTypes.ts
 * Types for the Debt Ledger (Sổ Nợ) system
 * Uses simplified double-entry bookkeeping
 */

// Transaction types
export type TransactionType =
    | 'DEBT'      // Ghi nợ (farmer owes agent)
    | 'CREDIT'    // Ghi có (agent owes farmer)
    | 'PURCHASE'  // Thu mua (creates credit for farmer)
    | 'PAYMENT'   // Thanh toán (settles debt)
    | 'OFFSET';   // Bù trừ (debt applied to purchase)

// Debt category
export type DebtCategory =
    | 'FERTILIZER'  // Phân bón
    | 'CASH'        // Tiền mặt
    | 'PESTICIDE'   // Thuốc BVTV
    | 'OTHER';      // Khác

// Account types for double-entry
export type AccountType =
    | 'AGENT_RECEIVABLE'  // Phải thu từ farmer
    | 'FARMER_PAYABLE';   // Phải trả cho farmer

// Individual ledger transaction
export interface LedgerTransaction {
    id: string;
    agentId: string;
    farmerId: string;
    farmerName?: string;

    // Transaction details
    type: TransactionType;
    category?: DebtCategory;
    amount: number;           // Always positive
    description: string;

    // Double-entry accounts
    debitAccount: AccountType;
    creditAccount: AccountType;

    // Related records
    relatedOrderId?: string;  // Link to purchase order

    // Notification
    notificationSent: boolean;
    notificationChannel?: 'SMS' | 'ZALO' | 'APP';

    // Offline sync
    offlineCreated: boolean;
    syncedAt?: any;

    createdAt: any;
    createdBy: string;        // Agent user ID
}

// Farmer balance summary
export interface FarmerBalance {
    farmerId: string;
    farmerName: string;
    farmerPhone?: string;

    // Balance (positive = farmer owes agent, negative = agent owes farmer)
    balance: number;

    // Breakdown
    totalDebt: number;        // Tổng nợ farmer
    totalCredit: number;      // Tổng có farmer

    // Stats
    lastTransactionDate?: any;
    transactionCount: number;
}

// Ledger summary for agent
export interface AgentLedgerSummary {
    agentId: string;

    // Totals
    totalReceivable: number;  // Tổng phải thu
    totalPayable: number;     // Tổng phải trả
    netPosition: number;      // Receivable - Payable

    // Counts
    farmersWithDebt: number;
    farmersWithCredit: number;

    updatedAt: any;
}

// Debt category labels
export const DEBT_CATEGORY_LABELS: Record<DebtCategory, string> = {
    'FERTILIZER': 'Phân bón',
    'CASH': 'Tiền mặt',
    'PESTICIDE': 'Thuốc BVTV',
    'OTHER': 'Khác',
};

// Transaction type labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    'DEBT': 'Ghi nợ',
    'CREDIT': 'Ghi có',
    'PURCHASE': 'Thu mua',
    'PAYMENT': 'Thanh toán',
    'OFFSET': 'Trừ nợ',
};

// Helper: Format balance display
export const formatBalance = (balance: number): { text: string; color: string } => {
    if (balance > 0) {
        return {
            text: `Nợ ${formatCurrency(balance)}`,
            color: '#ef4444' // Red - farmer owes
        };
    } else if (balance < 0) {
        return {
            text: `Dư ${formatCurrency(Math.abs(balance))}`,
            color: '#22c55e' // Green - agent owes
        };
    }
    return { text: 'Hết nợ', color: '#6b7280' };
};

// Helper: Format currency
export const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}tr`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}k`;
    }
    return `${amount}đ`;
};

// Helper: Full currency format
export const formatFullCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN') + 'đ';
};
