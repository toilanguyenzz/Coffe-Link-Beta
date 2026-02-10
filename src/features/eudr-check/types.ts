/**
 * types.ts
 * 
 * Data models for EU Chemical Compliance Check (EUDR)
 * Focus on active_ingredients because the EU bans chemicals, not brand names.
 */

// 1. Compliance Status
export type ComplianceStatus =
    | 'SAFE'      // Safe to use - Green light
    | 'WARNING'   // Allowed but strict isolation required (PHI) - Yellow light
    | 'BANNED';   // Totally banned in EU (e.g., Glyphosate, Chlorpyrifos) - Red light

// 2. Chemical Ingredient
export interface Ingredient {
    name: string;           // e.g., "Glyphosate"
    concentration: number;  // Amount
    unit: string;           // e.g., "%", "g/l"
}

// 3. Product Structure
export interface CropProtectionProduct {
    id: string;
    barcode: string;        // Scanning Key
    trade_name: string;     // Brand Name (e.g., "Cỏ Chay 500")
    manufacturer: string;
    image_url: string;

    // CORE LOGIC FOR EXPORT
    ingredients: Ingredient[];

    export_compliance: {
        eu_status: ComplianceStatus;
        us_status: ComplianceStatus;  // Optional for future

        // PHI (Pre-Harvest Interval): Days to wait before harvest
        isolation_days: number;

        // Reason for ban/warning
        violation_reason?: string;
    };
}

// 4. Scan Result for UI
export interface ChemicalScanResult {
    found: boolean;
    product?: CropProtectionProduct;
    scannedBarcode: string;
    scanTime: Date;

    // Computed fields for UI
    earliestHarvestDate?: Date;  // Today + isolation_days
}
