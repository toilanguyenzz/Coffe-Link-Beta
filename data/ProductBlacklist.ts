/**
 * ProductBlacklist.ts
 * 
 * Danh sách thuốc/sản phẩm cấm và xanh (hard-coded)
 * Dùng để check nhanh trước khi gọi AI
 * 
 * CẤM (Blacklist): Thuốc bị EU cấm, độc hại môi trường → Trừ điểm
 * XANH (Greenlist): Hữu cơ, sinh học, thân thiện → Cộng điểm
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface BlacklistProduct {
    name: string;
    aliases: string[];
    category: 'herbicide' | 'pesticide' | 'fungicide' | 'fertilizer';
    pointDeduction: number;
    reason: string;
    alternatives: string[];
}

export interface GreenlistProduct {
    name: string;
    aliases: string[];
    category: 'organic' | 'biological' | 'mechanical' | 'natural';
    pointBonus: number;
    benefit: string;
}

// ═══════════════════════════════════════════════════════════════
// BLACKLIST - Sản phẩm độc hại, bị cấm
// ═══════════════════════════════════════════════════════════════

export const PRODUCT_BLACKLIST: BlacklistProduct[] = [
    {
        name: 'Paraquat',
        aliases: ['thuốc cỏ cháy', 'gramoxone', 'paraquat dichloride', 'cỏ cháy'],
        category: 'herbicide',
        pointDeduction: 50,
        reason: 'Bị EU cấm từ 2007, độc cấp tính cao, không có thuốc giải',
        alternatives: ['Máy cắt cỏ', 'Glufosinate sinh học', 'Phủ bạt diệt cỏ']
    },
    {
        name: 'Glyphosate',
        aliases: ['roundup', 'thuốc diệt cỏ', 'glyphosate isopropylamine'],
        category: 'herbicide',
        pointDeduction: 50,
        reason: 'Nghi ngờ gây ung thư (IARC 2A), EU hạn chế sử dụng',
        alternatives: ['Máy phát cỏ', 'Thuốc sinh học', 'Cắt cỏ thủ công']
    },
    {
        name: 'Chlorpyrifos',
        aliases: ['lorsban', 'dursban', 'chlor'],
        category: 'pesticide',
        pointDeduction: 50,
        reason: 'Bị EU cấm từ 2020, ảnh hưởng thần kinh trẻ em',
        alternatives: ['Thuốc Neem', 'Nấm Beauveria', 'Bẫy bả sinh học']
    },
    {
        name: 'Carbofuran',
        aliases: ['furadan', 'carbo'],
        category: 'pesticide',
        pointDeduction: 50,
        reason: 'Cực độc, bị cấm ở nhiều nước, giết chim và động vật',
        alternatives: ['Nấm Metarhizium', 'Thuốc sinh học BT']
    },
    {
        name: 'Methyl Bromide',
        aliases: ['methyl bromua', 'bromua metyl'],
        category: 'fungicide',
        pointDeduction: 50,
        reason: 'Phá hủy tầng ozone, bị cấm theo nghị định Montreal',
        alternatives: ['Hun trùng bằng nhiệt', 'Nấm đối kháng Trichoderma']
    },
    {
        name: 'Endosulfan',
        aliases: ['thiodan', 'endo'],
        category: 'pesticide',
        pointDeduction: 50,
        reason: 'Bị cấm toàn cầu theo công ước Stockholm',
        alternatives: ['Spinosad sinh học', 'Dầu Neem']
    },
    {
        name: 'Phân hóa học NPK cao',
        aliases: ['npk 30-30-30', 'phân đạm đậm đặc', 'ure đậm đặc'],
        category: 'fertilizer',
        pointDeduction: 20,
        reason: 'Lạm dụng gây chai đất, ô nhiễm nước ngầm',
        alternatives: ['Phân hữu cơ vi sinh', 'Phân chuồng ủ hoai', 'NPK hữu cơ']
    }
];

// ═══════════════════════════════════════════════════════════════
// GREENLIST - Sản phẩm tốt, khuyến khích
// ═══════════════════════════════════════════════════════════════

export const PRODUCT_GREENLIST: GreenlistProduct[] = [
    {
        name: 'Phân hữu cơ vi sinh',
        aliases: ['phân vi sinh', 'phân hữu cơ', 'organic fertilizer', 'compost'],
        category: 'organic',
        pointBonus: 25,
        benefit: 'Cải tạo đất, tăng vi sinh vật có lợi, giảm phụ thuộc hóa chất'
    },
    {
        name: 'Thuốc sinh học Neem',
        aliases: ['dầu neem', 'neem oil', 'azadirachtin'],
        category: 'biological',
        pointBonus: 20,
        benefit: 'Trừ sâu tự nhiên, an toàn cho người, phân hủy nhanh'
    },
    {
        name: 'Nấm Trichoderma',
        aliases: ['trichoderma', 'nấm đối kháng'],
        category: 'biological',
        pointBonus: 25,
        benefit: 'Phòng nấm bệnh rễ, cạnh tranh sinh học, tăng sức đề kháng cây'
    },
    {
        name: 'Nấm Beauveria bassiana',
        aliases: ['beauveria', 'nấm trắng', 'nấm côn trùng'],
        category: 'biological',
        pointBonus: 25,
        benefit: 'Diệt rệp sáp, bọ xít tự nhiên, không tồn dư'
    },
    {
        name: 'Bacillus thuringiensis (BT)',
        aliases: ['bt', 'thuốc bt', 'bacillus'],
        category: 'biological',
        pointBonus: 20,
        benefit: 'Trừ sâu sinh học, an toàn với thiên địch'
    },
    {
        name: 'Phân chuồng ủ hoai',
        aliases: ['phân bò', 'phân gà', 'phân chuồng', 'manure'],
        category: 'organic',
        pointBonus: 20,
        benefit: 'Nguồn dinh dưỡng tự nhiên, cải thiện cấu trúc đất'
    },
    {
        name: 'Máy cắt cỏ',
        aliases: ['máy phát cỏ', 'cắt cỏ cơ giới', 'lawn mower'],
        category: 'mechanical',
        pointBonus: 15,
        benefit: 'Không hóa chất, giữ lớp phủ đất, bảo vệ vi sinh vật'
    },
    {
        name: 'Bẫy bả sinh học',
        aliases: ['bẫy pheromone', 'bẫy màu vàng', 'sticky trap'],
        category: 'natural',
        pointBonus: 15,
        benefit: 'Giám sát và bắt côn trùng không dùng thuốc'
    },
    {
        name: 'Phân bón lá hữu cơ',
        aliases: ['phân bón lá', 'amino acid', 'humic acid'],
        category: 'organic',
        pointBonus: 15,
        benefit: 'Tăng hấp thu dinh dưỡng, cải thiện quang hợp'
    },
    {
        name: 'Vôi bột nông nghiệp',
        aliases: ['vôi', 'lime', 'calcium carbonate'],
        category: 'natural',
        pointBonus: 10,
        benefit: 'Khử chua đất, cung cấp canxi, diệt mầm bệnh'
    }
];

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Tìm sản phẩm trong blacklist
 * @param productName Tên sản phẩm cần kiểm tra
 * @returns BlacklistProduct nếu tìm thấy, undefined nếu không
 */
export function findInBlacklist(productName: string): BlacklistProduct | undefined {
    const normalized = productName.toLowerCase().trim();

    return PRODUCT_BLACKLIST.find(product => {
        // Check tên chính
        if (product.name.toLowerCase() === normalized) return true;

        // Check aliases
        return product.aliases.some(alias =>
            normalized.includes(alias.toLowerCase()) ||
            alias.toLowerCase().includes(normalized)
        );
    });
}

/**
 * Tìm sản phẩm trong greenlist
 * @param productName Tên sản phẩm cần kiểm tra
 * @returns GreenlistProduct nếu tìm thấy, undefined nếu không
 */
export function findInGreenlist(productName: string): GreenlistProduct | undefined {
    const normalized = productName.toLowerCase().trim();

    return PRODUCT_GREENLIST.find(product => {
        // Check tên chính
        if (product.name.toLowerCase() === normalized) return true;

        // Check aliases
        return product.aliases.some(alias =>
            normalized.includes(alias.toLowerCase()) ||
            alias.toLowerCase().includes(normalized)
        );
    });
}

/**
 * Kiểm tra nhanh sản phẩm (không cần gọi AI)
 * @param productName Tên sản phẩm
 * @returns { status, product, pointChange }
 */
export function quickCheckProduct(productName: string): {
    status: 'BLACKLIST' | 'GREENLIST' | 'UNKNOWN';
    product?: BlacklistProduct | GreenlistProduct;
    pointChange: number;
} {
    const blacklisted = findInBlacklist(productName);
    if (blacklisted) {
        return {
            status: 'BLACKLIST',
            product: blacklisted,
            pointChange: -blacklisted.pointDeduction
        };
    }

    const greenlisted = findInGreenlist(productName);
    if (greenlisted) {
        return {
            status: 'GREENLIST',
            product: greenlisted,
            pointChange: greenlisted.pointBonus
        };
    }

    return {
        status: 'UNKNOWN',
        pointChange: 0
    };
}

export default {
    PRODUCT_BLACKLIST,
    PRODUCT_GREENLIST,
    findInBlacklist,
    findInGreenlist,
    quickCheckProduct
};
