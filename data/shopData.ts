/**
 * shopData.ts
 * 
 * Product database for CoffeeLink Agri-OS Marketplace
 * Enhanced with treatment mapping for AI Insight-to-Action feature
 */

import { EcoTag } from '../types';

// Product categories
export type ProductCategory = 'fungicide' | 'pesticide' | 'fertilizer' | 'bio';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: ProductCategory;
  marketPrice: number;
  memberPrice: number;
  minQty: number;
  currentQty: number;
  unit: string;
  expiryTime: string;
  ecoTag: EcoTag;
  // For AI Insight-to-Action mapping
  treatableIssues: string[];  // Keywords AI can match
  dosageGuide: string;
  imageUrl?: string;
}

export interface Service {
  id: number;
  name: string;
  provider: string;
  price: string;
  status: 'available' | 'busy';
  rating: number;
  distance: string;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT DATABASE (10 popular treatments for coffee farms)
// ═══════════════════════════════════════════════════════════════

export const groupBuyProducts: Product[] = [
  // --- FUNGICIDES (Thuốc trị nấm) ---
  {
    id: 5,
    name: "Thuốc trừ nấm Anvil 5SC",
    brand: "Syngenta",
    category: 'fungicide',
    marketPrice: 220000,
    memberPrice: 195000,
    minQty: 10,
    currentQty: 5,
    unit: "Chai 1L",
    expiryTime: "16:00",
    ecoTag: 'CHEMICAL',
    treatableIssues: ['rỉ sắt', 'rust', 'hemileia', 'nấm'],
    dosageGuide: "Pha 10ml/bình 16L, phun đều mặt dưới lá",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Thuốc trị nấm Valida 5SL",
    brand: "Nhật Bản",
    category: 'fungicide',
    marketPrice: 150000,
    memberPrice: 135000,
    minQty: 20,
    currentQty: 12,
    unit: "Chai 500ml",
    expiryTime: "15:00",
    ecoTag: 'BIOLOGICAL',
    treatableIssues: ['thán thư', 'anthracnose', 'colletotrichum', 'nấm', 'rỉ sắt'],
    dosageGuide: "Pha 15ml/bình 16L, phun 7-10 ngày/lần",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Copper Hydroxide 77WP",
    brand: "Dupont",
    category: 'fungicide',
    marketPrice: 180000,
    memberPrice: 160000,
    minQty: 15,
    currentQty: 8,
    unit: "Gói 1kg",
    expiryTime: "14:00",
    ecoTag: 'CHEMICAL',
    treatableIssues: ['đốm mắt cua', 'cercospora', 'nấm lá', 'thối rễ'],
    dosageGuide: "Pha 25g/bình 16L, phun phòng ngừa đầu mùa mưa",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },

  // --- PESTICIDES (Thuốc trừ sâu) ---
  {
    id: 2,
    name: "Thuốc trừ rệp sáp Motox",
    brand: "Syngenta",
    category: 'pesticide',
    marketPrice: 120000,
    memberPrice: 95000,
    minQty: 100,
    currentQty: 15,
    unit: "Chai 500ml",
    expiryTime: "17:00",
    ecoTag: 'CHEMICAL',
    treatableIssues: ['rệp sáp', 'rệp', 'mealy bug', 'sâu', 'côn trùng'],
    dosageGuide: "Pha 20ml/bình 16L, phun kỹ vào gốc và đốt cành",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Thuốc trừ mọt đục cành Regent 800WG",
    brand: "BASF",
    category: 'pesticide',
    marketPrice: 350000,
    memberPrice: 320000,
    minQty: 5,
    currentQty: 3,
    unit: "Gói 100g",
    expiryTime: "15:30",
    ecoTag: 'CHEMICAL',
    treatableIssues: ['mọt đục cành', 'mọt', 'sâu đục thân', 'xylotrechus', 'borer'],
    dosageGuide: "Pha 5g/bình 16L, phun vào lỗ đục và xung quanh",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },

  // --- FERTILIZERS (Phân bón) ---
  {
    id: 1,
    name: "Phân bón NPK 16-16-8",
    brand: "Phú Mỹ",
    category: 'fertilizer',
    marketPrice: 850000,
    memberPrice: 820000,
    minQty: 50,
    currentQty: 42,
    unit: "Bao 50kg",
    expiryTime: "14:00",
    ecoTag: 'CHEMICAL',
    treatableIssues: ['thiếu đạm', 'vàng lá', 'nitrogen deficiency', 'dinh dưỡng', 'còi cọc'],
    dosageGuide: "300-400g/cây, bón gốc vào đầu mùa mưa",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Phân Urê 46%",
    brand: "Đạm Cà Mau",
    category: 'fertilizer',
    marketPrice: 480000,
    memberPrice: 450000,
    minQty: 30,
    currentQty: 25,
    unit: "Bao 50kg",
    expiryTime: "16:00",
    ecoTag: 'CHEMICAL',
    treatableIssues: ['thiếu đạm', 'vàng lá', 'nitrogen', 'nhạt màu'],
    dosageGuide: "100-150g/cây, chia nhỏ bón nhiều lần",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },

  // --- BIOLOGICAL (Sinh học/Hữu cơ) ---
  {
    id: 3,
    name: "Nấm Đối Kháng Trichoderma",
    brand: "Viện Eakmat",
    category: 'bio',
    marketPrice: 90000,
    memberPrice: 75000,
    minQty: 200,
    currentQty: 180,
    unit: "Gói 1kg",
    expiryTime: "16:00",
    ecoTag: 'BIOLOGICAL',
    treatableIssues: ['nấm', 'thối rễ', 'fusarium', 'cải tạo đất', 'phục hồi'],
    dosageGuide: "Trộn 1kg/m³ phân chuồng, ủ 15 ngày",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Đạm Cá Cô Đặc (Fish Protein)",
    brand: "Organic US",
    category: 'bio',
    marketPrice: 250000,
    memberPrice: 210000,
    minQty: 20,
    currentQty: 12,
    unit: "Can 5L",
    expiryTime: "15:30",
    ecoTag: 'ORGANIC',
    treatableIssues: ['thiếu đạm', 'kích rễ', 'phục hồi', 'suy yếu'],
    dosageGuide: "Pha 50ml/bình 16L, tưới gốc 2 tuần/lần",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Phân hữu cơ vi sinh",
    brand: "Vina Organic",
    category: 'bio',
    marketPrice: 180000,
    memberPrice: 150000,
    minQty: 100,
    currentQty: 60,
    unit: "Bao 25kg",
    expiryTime: "17:00",
    ecoTag: 'ORGANIC',
    treatableIssues: ['cải tạo đất', 'đất chai', 'phục hồi', 'vi sinh', 'sức khỏe đất'],
    dosageGuide: "2-3kg/cây, bón quanh gốc",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150&auto=format&fit=crop"
  }
];

// ═══════════════════════════════════════════════════════════════
// SERVICES 
// ═══════════════════════════════════════════════════════════════

export const agriServices: Service[] = [
  {
    id: 1,
    name: "Phun thuốc Drone",
    provider: "Đội bay Anh Ba",
    price: "200.000₫/ha",
    status: 'available',
    rating: 4.8,
    distance: "2km"
  },
  {
    id: 2,
    name: "Nhân công làm cỏ",
    provider: "Tổ hợp tác 5",
    price: "250.000₫/công",
    status: 'busy',
    rating: 4.5,
    distance: "5km"
  },
  {
    id: 3,
    name: "Xe tải chở cà (3 tấn)",
    provider: "Vận tải Tám Hùng",
    price: "Thương lượng",
    status: 'available',
    rating: 5.0,
    distance: "1km"
  }
];
