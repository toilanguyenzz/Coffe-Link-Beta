/**
 * HubService.ts
 * Service quản lý Hub (Trạm) - Tầng 1: Infrastructure
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { Hub, SeasonMode, UserProfile } from '../types';

const HUBS_COLLECTION = 'hubs';
const USERS_COLLECTION = 'users';

// ============================================================
// GEO UTILITIES
// ============================================================

/**
 * Haversine formula - Tính khoảng cách giữa 2 điểm GPS (km)
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// ============================================================
// HUB CRUD OPERATIONS
// ============================================================

/**
 * Lấy thông tin Hub theo ID
 */
export async function getHubById(hubId: string): Promise<Hub | null> {
    try {
        const docRef = doc(db, HUBS_COLLECTION, hubId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Hub;
        }
        return null;
    } catch (error) {
        console.error('Error getting hub:', error);
        return null;
    }
}

/**
 * Lấy tất cả Hubs
 */
export async function getAllHubs(): Promise<Hub[]> {
    try {
        const q = query(collection(db, HUBS_COLLECTION), orderBy('name'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Hub[];
    } catch (error) {
        console.error('Error getting all hubs:', error);
        return [];
    }
}

/**
 * Tìm Hub gần nhất dựa trên GPS
 * @returns Hub gần nhất trong bán kính hoặc null
 */
export async function getNearestHub(
    lat: number,
    lng: number,
    maxDistance: number = 50 // km - mặc định 50km
): Promise<Hub | null> {
    try {
        const hubs = await getAllHubs();

        let nearestHub: Hub | null = null;
        let minDistance = Infinity;

        for (const hub of hubs) {
            const distance = calculateDistance(lat, lng, hub.location.lat, hub.location.lng);

            // Kiểm tra trong bán kính phục vụ của Hub hoặc maxDistance
            const effectiveRadius = Math.min(hub.radius, maxDistance);

            if (distance <= effectiveRadius && distance < minDistance) {
                minDistance = distance;
                nearestHub = hub;
            }
        }

        return nearestHub;
    } catch (error) {
        console.error('Error finding nearest hub:', error);
        return null;
    }
}

/**
 * Tìm Hub theo địa chỉ thủ công (Tỉnh/Huyện/Xã)
 * Logic: Tìm Hub có bán kính bao phủ khu vực đó
 */
export async function findHubByAddress(
    provinceCode: string,
    districtCode: string,
    _wardCode: string // Reserved for future use
): Promise<Hub | null> {
    try {
        // Mapping tỉnh -> Hub (có thể mở rộng sau bằng collection riêng)
        // Hiện tại dùng logic đơn giản: Query Hub trong tỉnh đó
        const hubs = await getAllHubs();

        // TODO: Khi có collection mapping Ward -> Hub, dùng wardCode
        // Hiện tại: Tìm Hub đầu tiên hoạt động trong vùng
        // Giả định: Hub đầu tiên trong danh sách phục vụ tỉnh đó

        // Tạm thời: Return Hub đầu tiên có trong DB
        // Sau này cần xây dựng mapping chính xác hơn
        if (hubs.length > 0) {
            console.log(`Found ${hubs.length} hubs, assigning first one for province ${provinceCode}, district ${districtCode}`);
            return hubs[0];
        }

        return null;
    } catch (error) {
        console.error('Error finding hub by address:', error);
        return null;
    }
}

// ============================================================
// USER-HUB ASSIGNMENT
// ============================================================

/**
 * Gán User vào Hub
 */
export async function assignUserToHub(
    userId: string,
    hubId: string,
    isManual: boolean = false,
    manualAddress?: { provinceCode: string; districtCode: string; wardCode: string }
): Promise<boolean> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);

        const updateData: Partial<UserProfile> = {
            hubId: hubId,
            isManualLocation: isManual,
            updatedAt: serverTimestamp()
        };

        if (isManual && manualAddress) {
            updateData.manualAddress = manualAddress;
        }

        await updateDoc(userRef, updateData);

        // TODO: Increment Hub memberCount via Cloud Function

        return true;
    } catch (error) {
        console.error('Error assigning user to hub:', error);
        return false;
    }
}

/**
 * Auto-route User dựa trên GPS
 * Được gọi khi user đăng nhập lần đầu hoặc reload app
 */
export async function autoRouteUserToHub(
    userId: string,
    lat: number,
    lng: number
): Promise<Hub | null> {
    try {
        const nearestHub = await getNearestHub(lat, lng);

        if (nearestHub) {
            await assignUserToHub(userId, nearestHub.id, false);
            return nearestHub;
        }

        return null;
    } catch (error) {
        console.error('Error auto-routing user:', error);
        return null;
    }
}

// ============================================================
// SEASON MODE MANAGEMENT
// ============================================================

/**
 * Cập nhật chế độ mùa vụ cho Hub (Admin only)
 */
export async function updateSeasonMode(
    hubId: string,
    mode: SeasonMode
): Promise<boolean> {
    try {
        const hubRef = doc(db, HUBS_COLLECTION, hubId);
        await updateDoc(hubRef, {
            seasonMode: mode,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating season mode:', error);
        return false;
    }
}

/**
 * Realtime listener cho Season Mode thay đổi
 */
export function onSeasonModeChange(
    hubId: string,
    callback: (mode: SeasonMode) => void
): Unsubscribe {
    const hubRef = doc(db, HUBS_COLLECTION, hubId);

    return onSnapshot(hubRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data() as Hub;
            callback(data.seasonMode);
        }
    });
}

// ============================================================
// ADMIN: HUB MANAGEMENT
// ============================================================

/**
 * Tạo Hub mới (Admin only)
 */
export async function createHub(
    data: Omit<Hub, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> {
    try {
        const hubRef = doc(collection(db, HUBS_COLLECTION));

        await setDoc(hubRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return hubRef.id;
    } catch (error) {
        console.error('Error creating hub:', error);
        return null;
    }
}

/**
 * Cấp quyền Hub Leader cho user
 */
export async function assignHubLeader(
    userId: string,
    hubId: string
): Promise<boolean> {
    try {
        // Update user role
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            role: 'hub_leader',
            hubId: hubId,
            updatedAt: serverTimestamp()
        });

        // Update hub leader info
        const hubRef = doc(db, HUBS_COLLECTION, hubId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            await updateDoc(hubRef, {
                leaderId: userId,
                leaderName: userData.displayName || '',
                updatedAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error('Error assigning hub leader:', error);
        return false;
    }
}

/**
 * Lấy danh sách thành viên trong Hub
 */
export async function getHubMembers(hubId: string): Promise<UserProfile[]> {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('hubId', '==', hubId),
            orderBy('displayName')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        })) as UserProfile[];
    } catch (error) {
        console.error('Error getting hub members:', error);
        return [];
    }
}
