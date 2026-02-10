/**
 * mockChemicals.ts
 * 
 * Mock database of crop protection products with EU export compliance data.
 * Uses real-world examples of chemicals that can void export contracts.
 */

import { CropProtectionProduct } from '../types';

export const MOCK_CHEMICALS: CropProtectionProduct[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // CASE 1: BANNED SUBSTANCE (The "Red Light")
    // Glyphosate is heavily restricted/banned in many EU contexts
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'chem_001',
        barcode: '893000000001',
        trade_name: 'Vua Diệt Cỏ (Glyphosate)',
        manufacturer: 'Cty ABC',
        image_url: 'https://via.placeholder.com/150/dc2626',
        ingredients: [
            { name: 'Glyphosate', concentration: 480, unit: 'g/l' }
        ],
        export_compliance: {
            eu_status: 'BANNED',
            us_status: 'WARNING',
            isolation_days: 30,
            violation_reason: '⛔ CHỨA GLYPHOSATE: Hoạt chất này có nguy cơ cao bị EU từ chối nhập khẩu. Nhiều quốc gia châu Âu đã cấm hoàn toàn hoặc hạn chế nghiêm ngặt.'
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CASE 2: RESTRICTED / HIGH RISK (The "Yellow Light")
    // Chlorpyrifos Ethyl (Formerly common, now strictly controlled)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'chem_002',
        barcode: '893000000002',
        trade_name: 'Sâu Đục Thân 500EC',
        manufacturer: 'Cty XYZ',
        image_url: 'https://via.placeholder.com/150/eab308',
        ingredients: [
            { name: 'Chlorpyrifos Ethyl', concentration: 50, unit: '%' }
        ],
        export_compliance: {
            eu_status: 'WARNING',
            us_status: 'WARNING',
            isolation_days: 21,  // Must wait 21 days before harvest
            violation_reason: '⚠️ CẢNH BÁO: Dư lượng tồn tại lâu trong đất và cây trồng. Tuyệt đối không phun trước thu hoạch 21 ngày! Vượt PHI sẽ bị từ chối lô hàng.'
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CASE 3: SAFE / BIOLOGICAL (The "Green Light")
    // Abamectin (Biological origin, safer profile)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'chem_003',
        barcode: '893000000003',
        trade_name: 'Trừ Sâu Sinh Học Abamectin',
        manufacturer: 'BioCrop Vietnam',
        image_url: 'https://via.placeholder.com/150/22c55e',
        ingredients: [
            { name: 'Abamectin', concentration: 3.6, unit: '%' }
        ],
        export_compliance: {
            eu_status: 'SAFE',
            us_status: 'SAFE',
            isolation_days: 7,
            violation_reason: '✅ An toàn cho hàng xuất khẩu EU. Hoạt chất sinh học, phân hủy nhanh. Chỉ cần tuân thủ thời gian cách ly 7 ngày trước thu hoạch.'
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CASE 4: Another BANNED - Fipronil (Insecticide)
    // EU banned Fipronil in 2013 for outdoor use
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'chem_004',
        barcode: '893000000004',
        trade_name: 'Diệt Kiến Siêu Mạnh',
        manufacturer: 'Cty Hóa Chất Việt',
        image_url: 'https://via.placeholder.com/150/dc2626',
        ingredients: [
            { name: 'Fipronil', concentration: 200, unit: 'g/l' }
        ],
        export_compliance: {
            eu_status: 'BANNED',
            us_status: 'WARNING',
            isolation_days: 60,
            violation_reason: '⛔ CHỨA FIPRONIL: EU đã cấm sử dụng ngoài trời từ năm 2013. Tuyệt đối không dùng cho cây cà phê xuất khẩu châu Âu!'
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CASE 5: Safe copper-based fungicide
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'chem_005',
        barcode: '893000000005',
        trade_name: 'Đồng Bordeaux Phòng Nấm',
        manufacturer: 'Cty Syngenta VN',
        image_url: 'https://via.placeholder.com/150/22c55e',
        ingredients: [
            { name: 'Copper Hydroxide', concentration: 77, unit: '%' }
        ],
        export_compliance: {
            eu_status: 'SAFE',
            us_status: 'SAFE',
            isolation_days: 14,
            violation_reason: '✅ Đồng là hoạt chất truyền thống được phép sử dụng trong canh tác hữu cơ và xuất khẩu EU. Tuân thủ PHI 14 ngày.'
        }
    }
];

/**
 * Find a chemical product by barcode
 */
export function findChemicalByBarcode(barcode: string): CropProtectionProduct | undefined {
    return MOCK_CHEMICALS.find(chem => chem.barcode === barcode);
}

/**
 * Get all banned chemicals
 */
export function getBannedChemicals(): CropProtectionProduct[] {
    return MOCK_CHEMICALS.filter(chem => chem.export_compliance.eu_status === 'BANNED');
}

/**
 * Get all warning chemicals  
 */
export function getWarningChemicals(): CropProtectionProduct[] {
    return MOCK_CHEMICALS.filter(chem => chem.export_compliance.eu_status === 'WARNING');
}
