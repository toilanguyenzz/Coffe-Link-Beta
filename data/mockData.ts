/**
 * mockData.ts - Mock Data cho MVP Demo
 * Không cần Backend, chỉ dùng LocalStorage
 */

import { UserProfile, Hub, Campaign, GardenData, WorkerProfile, ServiceRequest } from '../types';

// ============ DEMO USERS ============
export const DEMO_USERS: Record<string, UserProfile> = {
    farmer_demo: {
        uid: 'farmer_demo',
        email: 'farmer@demo.com',
        displayName: 'Anh Minh (Demo)',
        photoURL: '',
        farmerId: 'VN-26-12345',
        farmingType: 'traditional',
        role: 'farmer',
        hubId: 'hub_chu_pah',
        traceabilityEnabled: true,
        plantingYear: 2018,
        eudrStatus: 'passed',
        gardenMetrics: {
            consistencyScore: 75,
            ecoPotentialIndex: 60,
            currentBadge: 'PRO_FARMER',
            nextMilestone: 'ECO_PIONEER - Còn 40 điểm nữa'
        },
        streak: {
            current: 7,
            highest: 15,
            lastLogDate: new Date().toISOString().split('T')[0]
        },
        createdAt: new Date('2024-01-01'),
    },

    hub_leader_demo: {
        uid: 'hub_leader_demo',
        email: 'leader@demo.com',
        displayName: 'Chú Hùng - Trưởng Trạm',
        photoURL: '',
        farmerId: 'VN-26-00001',
        farmingType: 'organic',
        role: 'hub_leader',
        hubId: 'hub_chu_pah',
        traceabilityEnabled: true,
        referralCode: 'HUNG2026',
        referralCount: 28,
        referralBonus: 2800000,
        createdAt: new Date('2023-06-01'),
    },

    worker_demo: {
        uid: 'worker_demo',
        email: 'worker@demo.com',
        displayName: 'Thợ Tùng',
        photoURL: '',
        farmerId: 'VN-26-99001',
        farmingType: null,
        role: 'worker',
        hubId: 'hub_chu_pah',
        traceabilityEnabled: false,
        workerProfile: {
            skills: ['harvest', 'pruning', 'fertilizing'],
            rating: 4.8,
            totalRatings: 45,
            completedJobs: 120,
            availability: 'available',
            dailyRate: 350000,
            experience: '5 năm kinh nghiệm thu hoạch cà phê'
        },
        createdAt: new Date('2024-03-01'),
    },

    agent_demo: {
        uid: 'agent_demo',
        email: 'agent@demo.com',
        displayName: 'Đại lý Anh Hùng',
        photoURL: '',
        farmerId: 'VN-26-88001',
        farmingType: null,
        role: 'agent',
        hubId: 'hub_chu_se',
        traceabilityEnabled: true,
        agentProfile: {
            shopName: 'Đại Lý Cà Phê Hùng Sơn',
            taxId: '5800123456',
            address: 'Thị trấn Chư Sê, Gia Lai',
            totalPurchased: 125000, // kg
            totalFarmers: 42,
            rating: 4.7,
        },
        createdAt: new Date('2023-09-01'),
    }
};

// ============ DEMO HUBS ============
export const DEMO_HUBS: Record<string, Hub> = {
    hub_chu_pah: {
        id: 'hub_chu_pah',
        name: 'Trạm Chư Pah',
        location: { lat: 14.0167, lng: 108.0500 },
        radius: 30,
        seasonMode: 'CARE',
        leaderId: 'hub_leader_demo',
        leaderName: 'Chú Hùng',
        leaderPhone: '0905123456',
        address: 'Thị trấn Phú Hòa, Huyện Chư Pah, Gia Lai',
        memberCount: 52,
        workerCount: 14,
        activeCampaigns: 3,
        createdAt: new Date('2023-01-01'),
    },
    hub_chu_se: {
        id: 'hub_chu_se',
        name: 'Trạm Chư Sê',
        location: { lat: 13.7833, lng: 108.0667 },
        radius: 40,
        seasonMode: 'CARE',
        leaderId: 'leader_lan',
        leaderName: 'Cô Lan',
        leaderPhone: '0912345678',
        address: 'Thị trấn Chư Sê, Huyện Chư Sê, Gia Lai',
        memberCount: 85,
        workerCount: 22,
        activeCampaigns: 4,
        createdAt: new Date('2023-02-01'),
    }
};

// ============ DEMO CAMPAIGNS (với sliding price) ============
export const DEMO_CAMPAIGNS: Campaign[] = [
    {
        id: 'campaign_npk_001',
        hubId: 'hub_chu_pah',
        title: '🔥 Deal Phân NPK 14k - Đầu Trâu',
        description: 'Phân bón NPK 20-20-15 Đầu Trâu chính hãng. Gom đơn để lấy giá sỉ tốt nhất!',
        productName: 'NPK 20-20-15 Đầu Trâu',
        productImage: '',
        originalPrice: 380000,
        dealPrice: 340000, // Giá tốt nhất khi đủ target
        unit: 'bao 50kg',
        targetQuantity: 400,
        currentQuantity: 312, // 78% - gần đạt giá tốt nhất
        minOrderQuantity: 5,
        startDate: '2026-01-15',
        endDate: '2026-01-25',
        pickupDate: '2026-01-28',
        status: 'ACTIVE',
        deepLinkCode: 'NPK14K',
        commissionRate: 3,
        type: 'INPUT',
        totalParticipants: 28,
        savingsPerUnit: 40000,
        createdAt: new Date(),
    },
    {
        id: 'campaign_thuoc_002',
        hubId: 'hub_chu_pah',
        title: '🛡️ Combo Thuốc BVTV Mùa Khô',
        description: 'Combo thuốc phòng trừ sâu bệnh mùa khô, tiết kiệm 15%',
        productName: 'Combo BVTV Mùa Khô',
        originalPrice: 850000,
        dealPrice: 720000,
        unit: 'combo',
        targetQuantity: 100,
        currentQuantity: 42, // 42%
        minOrderQuantity: 1,
        startDate: '2026-01-10',
        endDate: '2026-01-30',
        status: 'ACTIVE',
        deepLinkCode: 'COMBO15',
        commissionRate: 5,
        type: 'INPUT',
        totalParticipants: 42,
        savingsPerUnit: 130000,
        createdAt: new Date(),
    },
    {
        id: 'campaign_labor_003',
        hubId: 'hub_chu_pah',
        title: '👷 Đội Thợ Thu Hoạch - T1/2026',
        description: 'Đăng ký sớm để có thợ giỏi trong mùa thu hoạch',
        productName: 'Nhân công thu hoạch',
        originalPrice: 400000,
        dealPrice: 350000,
        unit: 'công/ngày',
        targetQuantity: 50, // 50 slot thợ
        currentQuantity: 18,
        minOrderQuantity: 3, // Tối thiểu 3 ngày
        startDate: '2026-01-20',
        endDate: '2026-02-15',
        status: 'ACTIVE',
        deepLinkCode: 'THO26',
        commissionRate: 2,
        type: 'LABOR',
        totalParticipants: 8,
        savingsPerUnit: 50000,
        createdAt: new Date(),
    }
];

// ============ DEMO GARDENS (với polygon EUDR) ============
export const DEMO_GARDENS: GardenData[] = [
    {
        id: 'garden_minh_001',
        name: 'Vườn Nhà - Lô 1',
        boundary: [
            { lat: 14.0170, lng: 108.0505 },
            { lat: 14.0175, lng: 108.0515 },
            { lat: 14.0165, lng: 108.0520 },
            { lat: 14.0160, lng: 108.0510 },
        ],
        center: { lat: 14.0168, lng: 108.0512 },
        metrics: {
            areaSqM: 12500,
            areaHa: 1.25,
            estimatedTrees: 1388
        }
    }
];

// ============ DEMO WORKERS (cho tìm thợ) ============
export const DEMO_WORKERS: Array<UserProfile & { workerProfile: WorkerProfile }> = [
    {
        ...DEMO_USERS.worker_demo,
        workerProfile: DEMO_USERS.worker_demo.workerProfile!
    },
    {
        uid: 'worker_002',
        email: 'worker2@demo.com',
        displayName: 'Thợ Bình',
        farmerId: 'VN-26-99002',
        farmingType: null,
        role: 'worker',
        hubId: 'hub_chu_pah',
        traceabilityEnabled: false,
        workerProfile: {
            skills: ['harvest', 'irrigation'],
            rating: 4.5,
            totalRatings: 32,
            completedJobs: 85,
            availability: 'available',
            dailyRate: 320000,
            experience: '3 năm kinh nghiệm'
        },
        createdAt: new Date('2024-05-01'),
    },
    {
        uid: 'worker_003',
        email: 'worker3@demo.com',
        displayName: 'Thợ Hải',
        farmerId: 'VN-26-99003',
        farmingType: null,
        role: 'worker',
        hubId: 'hub_chu_pah',
        traceabilityEnabled: false,
        workerProfile: {
            skills: ['pruning', 'spraying', 'fertilizing'],
            rating: 4.9,
            totalRatings: 67,
            completedJobs: 200,
            availability: 'busy',
            dailyRate: 380000,
            experience: '8 năm kinh nghiệm, chuyên cắt tỉa'
        },
        createdAt: new Date('2023-10-01'),
    }
];

// ============ REWARD POINTS CONFIG ============
export const REWARD_POINTS_CONFIG = {
    JOIN_CAMPAIGN: 10,
    PURCHASE_PER_10K: 1,
    REFERRAL_SUCCESS: 50,
    DAILY_CHECKIN: 5,
    COMPLETE_SURVEY: 20,
    SCAN_CERTIFICATE: 30,
    EUDR_COMPLIANT: 100,
};

// ============ VN-2000 CONVERTER PARAMS (MONRE Official) ============
export const VN2000_TRANSFORM_PARAMS = {
    // 7-parameter Helmert transformation
    tx: -191.90441429,   // Translation X (meters)
    ty: -39.30318279,    // Translation Y (meters)
    tz: -111.45032835,   // Translation Z (meters)
    rx: -0.00928836,     // Rotation X (arcseconds)
    ry: 0.01975479,      // Rotation Y (arcseconds)
    rz: -0.00427372,     // Rotation Z (arcseconds)
    s: 0.252906278,      // Scale (ppm)

    // VN-2000 ellipsoid (WGS-84 based)
    a: 6378137.0,        // Semi-major axis
    f: 1 / 298.257223563 // Flattening
};
