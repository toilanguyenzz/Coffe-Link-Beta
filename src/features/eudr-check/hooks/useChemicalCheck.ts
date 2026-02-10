/**
 * useChemicalCheck.ts
 * 
 * React hook for barcode lookup and EU export compliance checking.
 * 
 * Logic:
 * - BANNED: Block action, show full-screen red alert
 * - WARNING: Show yellow alert, calculate earliest harvest date
 * - SAFE: Show green checkmark, allow use
 */

import { useState, useCallback } from 'react';
import { CropProtectionProduct, ChemicalScanResult, ComplianceStatus } from '../types';
import { findChemicalByBarcode } from '../services/mockChemicals';

interface UseChemicalCheckReturn {
    // State
    scanResult: ChemicalScanResult | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    checkBarcode: (barcode: string) => Promise<ChemicalScanResult>;
    clearResult: () => void;

    // Computed helpers
    getStatusConfig: (status: ComplianceStatus) => StatusConfig;
}

interface StatusConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: 'ban' | 'alert-triangle' | 'check-circle';
    label: string;
    labelVi: string;
}

const STATUS_CONFIGS: Record<ComplianceStatus, StatusConfig> = {
    BANNED: {
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: 'ban',
        label: 'BANNED',
        labelVi: 'CẤM XUẤT KHẨU'
    },
    WARNING: {
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        icon: 'alert-triangle',
        label: 'WARNING',
        labelVi: 'CẢNH BÁO CAO'
    },
    SAFE: {
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        icon: 'check-circle',
        label: 'SAFE',
        labelVi: 'ĐẠT CHUẨN'
    }
};

export function useChemicalCheck(): UseChemicalCheckReturn {
    const [scanResult, setScanResult] = useState<ChemicalScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Check a barcode against the chemical database.
     * Returns the scan result with compliance info.
     */
    const checkBarcode = useCallback(async (barcode: string): Promise<ChemicalScanResult> => {
        setIsLoading(true);
        setError(null);

        // Simulate network delay (for realistic UX)
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Clean barcode (remove spaces, dashes)
            const cleanBarcode = barcode.replace(/[\s-]/g, '').trim();

            if (!cleanBarcode) {
                throw new Error('Mã vạch không hợp lệ');
            }

            const product = findChemicalByBarcode(cleanBarcode);
            const now = new Date();

            let result: ChemicalScanResult;

            if (product) {
                // Calculate earliest harvest date
                const earliestHarvestDate = new Date(now);
                earliestHarvestDate.setDate(
                    earliestHarvestDate.getDate() + product.export_compliance.isolation_days
                );

                result = {
                    found: true,
                    product,
                    scannedBarcode: cleanBarcode,
                    scanTime: now,
                    earliestHarvestDate
                };
            } else {
                result = {
                    found: false,
                    scannedBarcode: cleanBarcode,
                    scanTime: now
                };
            }

            setScanResult(result);
            setIsLoading(false);
            return result;

        } catch (err: any) {
            const errorMsg = err.message || 'Có lỗi xảy ra khi quét';
            setError(errorMsg);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Clear the current scan result
     */
    const clearResult = useCallback(() => {
        setScanResult(null);
        setError(null);
    }, []);

    /**
     * Get UI configuration for a compliance status
     */
    const getStatusConfig = useCallback((status: ComplianceStatus): StatusConfig => {
        return STATUS_CONFIGS[status];
    }, []);

    return {
        scanResult,
        isLoading,
        error,
        checkBarcode,
        clearResult,
        getStatusConfig
    };
}

export type { StatusConfig };
