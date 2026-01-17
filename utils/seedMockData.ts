/**
 * seedMockData.ts
 * Utility để seed mock Hub data vào Firestore
 * Sử dụng khi cần test
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MOCK_HUB_CHU_PAH, MOCK_HUB_CHU_SE, MOCK_CAMPAIGNS } from '../data/mockHubData';

/**
 * Seed tất cả mock Hubs vào Firestore
 */
export async function seedMockHubs(): Promise<void> {
    console.log('🌱 Seeding mock Hub data...');

    try {
        // Seed Hub Chư Pah
        await setDoc(doc(db, 'hubs', MOCK_HUB_CHU_PAH.id), {
            ...MOCK_HUB_CHU_PAH,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('✅ Created Hub:', MOCK_HUB_CHU_PAH.name);

        // Seed Hub Chư Sê
        await setDoc(doc(db, 'hubs', MOCK_HUB_CHU_SE.id), {
            ...MOCK_HUB_CHU_SE,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('✅ Created Hub:', MOCK_HUB_CHU_SE.name);

        // Seed Campaigns
        for (const campaign of MOCK_CAMPAIGNS) {
            await setDoc(doc(db, 'campaigns', campaign.id), {
                ...campaign,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('✅ Created Campaign:', campaign.title);
        }

        console.log('🎉 Mock data seeded successfully!');
        alert('✅ Đã tạo mock Hub data thành công!\n- Trạm Chư Pah\n- Trạm Chư Sê\n- 2 Campaigns');
    } catch (error) {
        console.error('❌ Error seeding mock data:', error);
        alert('❌ Lỗi khi tạo mock data: ' + (error as Error).message);
        throw error;
    }
}

/**
 * Seed mock Hub Chư Pah và gán user hiện tại vào Hub đó
 */
export async function seedAndAssignToHub(userId: string): Promise<string> {
    // First seed the hub
    await setDoc(doc(db, 'hubs', MOCK_HUB_CHU_PAH.id), {
        ...MOCK_HUB_CHU_PAH,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    // Assign user to hub
    await setDoc(doc(db, 'users', userId), {
        hubId: MOCK_HUB_CHU_PAH.id,
        updatedAt: serverTimestamp()
    }, { merge: true });

    // Seed campaigns too
    for (const campaign of MOCK_CAMPAIGNS) {
        await setDoc(doc(db, 'campaigns', campaign.id), {
            ...campaign,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }

    console.log('✅ User assigned to Hub Chư Pah');
    return MOCK_HUB_CHU_PAH.id;
}
