/**
 * seedHubData.ts
 * Script tạo mock Hub data cho testing
 * Chạy: npx ts-node scripts/seedHubData.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

// Firebase config - copy từ firebase.ts
const firebaseConfig = {
    // TODO: Copy config từ file firebase.ts của bạn
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock Hub Data - Trạm Chư Pah, Gia Lai
const MOCK_HUBS = [
    {
        id: 'hub_chu_pah',
        name: 'Trạm Chư Pah',
        location: {
            lat: 14.0167,    // Tọa độ Chư Pah, Gia Lai
            lng: 108.0500
        },
        radius: 30,        // 30km bán kính phục vụ
        seasonMode: 'CARE', // Đang mùa chăm sóc
        leaderId: '',      // Sẽ gán sau khi có user
        leaderName: 'Ông Hùng',
        leaderPhone: '0905123456',
        address: 'Thị trấn Phú Hòa, Huyện Chư Pah, Gia Lai',
        memberCount: 50,
        workerCount: 12,
        activeCampaigns: 2
    },
    {
        id: 'hub_chu_se',
        name: 'Trạm Chư Sê',
        location: {
            lat: 13.7833,
            lng: 108.0667
        },
        radius: 40,
        seasonMode: 'CARE',
        leaderId: '',
        leaderName: 'Bà Lan',
        leaderPhone: '0912345678',
        address: 'Thị trấn Chư Sê, Huyện Chư Sê, Gia Lai',
        memberCount: 80,
        workerCount: 20,
        activeCampaigns: 3
    }
];

// Mock Campaign cho Chư Pah
const MOCK_CAMPAIGNS = [
    {
        id: 'campaign_npk_chu_pah',
        hubId: 'hub_chu_pah',
        title: 'Deal Phân NPK 14k - Đầu Trâu',
        description: 'Phân bón NPK 20-20-15 Đầu Trâu chính hãng, gom đơn để lấy giá sỉ!',
        productName: 'NPK 20-20-15 Đầu Trâu',
        originalPrice: 380000,
        dealPrice: 350000,
        unit: 'bao 50kg',
        targetQuantity: 400,    // 400 bao = 20 tấn
        currentQuantity: 156,   // Đã đặt 156 bao
        minOrderQuantity: 5,
        startDate: '2026-01-15',
        endDate: '2026-01-25',
        pickupDate: '2026-01-28',
        status: 'ACTIVE',
        deepLinkCode: 'NPK14K',
        commissionRate: 3
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

async function seedData() {
    console.log('🌱 Seeding Hub data...\n');

    // Seed Hubs
    for (const hub of MOCK_HUBS) {
        const hubRef = doc(db, 'hubs', hub.id);
        await setDoc(hubRef, {
            ...hub,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log(`✅ Created Hub: ${hub.name}`);
    }

    // Seed Campaigns
    for (const campaign of MOCK_CAMPAIGNS) {
        const campaignRef = doc(db, 'campaigns', campaign.id);
        await setDoc(campaignRef, {
            ...campaign,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log(`✅ Created Campaign: ${campaign.title}`);
    }

    console.log('\n🎉 Seed data completed!');
    console.log('Hub Chư Pah ID: hub_chu_pah');
    console.log('Hub Chư Sê ID: hub_chu_se');
}

seedData().catch(console.error);
