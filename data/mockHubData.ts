/**
 * mockHubData.ts
 * Mock Hub data để sử dụng trong app
 * Import vào HubService hoặc dùng để test
 */

import { Hub, Campaign, SeasonMode } from '../types';

// Mock Hub Chư Pah - Gia Lai
export const MOCK_HUB_CHU_PAH: Omit<Hub, 'createdAt' | 'updatedAt'> = {
    id: 'hub_chu_pah',
    name: 'Trạm Chư Pah',
    location: {
        lat: 14.0167,    // Tọa độ Chư Pah, Gia Lai
        lng: 108.0500
    },
    radius: 30,        // 30km bán kính phục vụ
    seasonMode: 'CARE' as SeasonMode,
    leaderId: 'leader_hung_001',
    leaderName: 'Ông Hùng',
    leaderPhone: '0905123456',
    address: 'Thị trấn Phú Hòa, Huyện Chư Pah, Gia Lai',
    memberCount: 50,
    workerCount: 12,
    activeCampaigns: 2
};

// Mock Hub Chư Sê
export const MOCK_HUB_CHU_SE: Omit<Hub, 'createdAt' | 'updatedAt'> = {
    id: 'hub_chu_se',
    name: 'Trạm Chư Sê',
    location: {
        lat: 13.7833,
        lng: 108.0667
    },
    radius: 40,
    seasonMode: 'CARE' as SeasonMode,
    leaderId: 'leader_lan_002',
    leaderName: 'Bà Lan',
    leaderPhone: '0912345678',
    address: 'Thị trấn Chư Sê, Huyện Chư Sê, Gia Lai',
    memberCount: 80,
    workerCount: 20,
    activeCampaigns: 3
};

// Mock Campaigns cho Chư Pah
export const MOCK_CAMPAIGNS: Omit<Campaign, 'createdAt' | 'updatedAt'>[] = [
    {
        id: 'campaign_npk_chu_pah',
        hubId: 'hub_chu_pah',
        title: 'Deal Phân NPK 14k - Đầu Trâu',
        description: 'Phân bón NPK 20-20-15 Đầu Trâu chính hãng, gom đơn để lấy giá sỉ!',
        productName: 'NPK 20-20-15 Đầu Trâu',
        originalPrice: 380000,
        dealPrice: 350000,
        unit: 'bao 50kg',
        targetQuantity: 400,
        currentQuantity: 156,
        minOrderQuantity: 5,
        startDate: '2026-01-15',
        endDate: '2026-01-25',
        pickupDate: '2026-01-28',
        status: 'ACTIVE',
        deepLinkCode: 'NPK14K',
        commissionRate: 3,
        pricingTiers: [
            { minQuantity: 10, price: 370000 },
            { minQuantity: 50, price: 360000 },
            { minQuantity: 150, price: 350000 },
            { minQuantity: 400, price: 340000 }
        ]
    },
    {
        id: 'campaign_thuoc_chu_pah',
        hubId: 'hub_chu_pah',
        title: 'Thuốc BVTV Combo Mùa Khô',
        description: 'Combo thuốc phòng trừ sâu bệnh mùa khô, tiết kiệm 15%',
        productName: 'Combo BVTV Mùa Khô',
        originalPrice: 850000,
        dealPrice: 720000,
        unit: 'combo',
        targetQuantity: 100,
        currentQuantity: 34,
        minOrderQuantity: 1,
        startDate: '2026-01-10',
        endDate: '2026-01-30',
        status: 'ACTIVE',
        deepLinkCode: 'COMBO15',
        commissionRate: 5
    }
];

export const ALL_MOCK_HUBS = [MOCK_HUB_CHU_PAH, MOCK_HUB_CHU_SE];
