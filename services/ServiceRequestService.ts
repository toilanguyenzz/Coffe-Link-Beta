/**
 * ServiceRequestService.ts
 * Service quản lý yêu cầu tìm thợ và booking nhân công
 * Tầng 3: Services Flow
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
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ServiceRequest, ServiceRequestType, ServiceRequestStatus, JobType, UserProfile } from '../types';

const SERVICE_REQUESTS_COLLECTION = 'serviceRequests';
const USERS_COLLECTION = 'users';

// ============================================================
// SERVICE REQUEST CRUD
// ============================================================

/**
 * Lấy Service Request theo ID
 */
export async function getServiceRequestById(requestId: string): Promise<ServiceRequest | null> {
    try {
        const docRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as ServiceRequest;
        }
        return null;
    } catch (error) {
        console.error('Error getting service request:', error);
        return null;
    }
}

/**
 * Tạo P2P Booking Request (Tìm thợ lẻ - MODE A: Thời Bình)
 */
export async function createP2PRequest(data: {
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    hubId: string;
    jobType: JobType;
    jobDescription?: string;
    workersNeeded: number;
    daysNeeded: number;
    startDate: string;
    dailyRate?: number;
    location?: { lat: number; lng: number; address?: string };
}): Promise<ServiceRequest | null> {
    try {
        const estimatedCost = (data.dailyRate || 300000) * data.workersNeeded * data.daysNeeded;

        const requestRef = doc(collection(db, SERVICE_REQUESTS_COLLECTION));
        const request: Omit<ServiceRequest, 'id'> = {
            ...data,
            type: 'P2P_BOOKING',
            status: 'OPEN',
            estimatedCost,
            depositAmount: 0, // P2P không cần deposit
            depositPaid: false,
            isSharedToFacebook: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(requestRef, request);
        return { id: requestRef.id, ...request } as ServiceRequest;
    } catch (error) {
        console.error('Error creating P2P request:', error);
        return null;
    }
}

/**
 * Tạo Hub Pooling Request (Đăng ký suất thợ mùa vụ - MODE B: Thời Chiến)
 */
export async function createHubPoolingRequest(data: {
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    hubId: string;
    jobType: JobType;
    workersNeeded: number;
    daysNeeded: number;
    startDate: string;
    dailyRate?: number;
    location?: { lat: number; lng: number; address?: string };
}): Promise<ServiceRequest | null> {
    try {
        const dailyRate = data.dailyRate || 350000; // Mùa vụ giá cao hơn
        const estimatedCost = dailyRate * data.workersNeeded * data.daysNeeded;
        const depositAmount = Math.round(estimatedCost * 0.3); // 30% deposit

        const requestRef = doc(collection(db, SERVICE_REQUESTS_COLLECTION));
        const request: Omit<ServiceRequest, 'id'> = {
            ...data,
            type: 'HUB_POOLING',
            status: 'OPEN',
            estimatedCost,
            dailyRate,
            depositAmount,
            depositPaid: false,
            isSharedToFacebook: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(requestRef, request);
        return { id: requestRef.id, ...request } as ServiceRequest;
    } catch (error) {
        console.error('Error creating hub pooling request:', error);
        return null;
    }
}

/**
 * Xác nhận deposit cho Hub Pooling
 */
export async function confirmRequestDeposit(requestId: string): Promise<boolean> {
    try {
        const requestRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        await updateDoc(requestRef, {
            depositPaid: true,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error confirming deposit:', error);
        return false;
    }
}

// ============================================================
// MATCHING (P2P)
// ============================================================

/**
 * Thợ nhận việc (Match request)
 */
export async function matchRequest(
    requestId: string,
    workerId: string,
    workerName: string
): Promise<boolean> {
    try {
        const requestRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        await updateDoc(requestRef, {
            status: 'MATCHED',
            matchedWorkerId: workerId,
            matchedWorkerName: workerName,
            matchedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error matching request:', error);
        return false;
    }
}

/**
 * Bắt đầu công việc
 */
export async function startRequest(requestId: string): Promise<boolean> {
    try {
        const requestRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        await updateDoc(requestRef, {
            status: 'IN_PROGRESS',
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error starting request:', error);
        return false;
    }
}

/**
 * Hoàn thành công việc
 */
export async function completeRequest(
    requestId: string,
    farmerRating?: number,
    workerRating?: number
): Promise<boolean> {
    try {
        const requestRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        await updateDoc(requestRef, {
            status: 'COMPLETED',
            farmerRating,
            workerRating,
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // TODO: Update worker rating in their profile

        return true;
    } catch (error) {
        console.error('Error completing request:', error);
        return false;
    }
}

/**
 * Hủy request
 */
export async function cancelRequest(requestId: string): Promise<boolean> {
    try {
        const requestRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        await updateDoc(requestRef, {
            status: 'CANCELLED',
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error cancelling request:', error);
        return false;
    }
}

// ============================================================
// QUERIES
// ============================================================

/**
 * Lấy danh sách request OPEN trong Hub (cho Thợ xem)
 */
export async function getOpenRequests(hubId: string): Promise<ServiceRequest[]> {
    try {
        const q = query(
            collection(db, SERVICE_REQUESTS_COLLECTION),
            where('hubId', '==', hubId),
            where('status', '==', 'OPEN'),
            where('type', '==', 'P2P_BOOKING'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ServiceRequest[];
    } catch (error) {
        console.error('Error getting open requests:', error);
        return [];
    }
}

/**
 * Lấy requests của Farmer
 */
export async function getFarmerRequests(farmerId: string): Promise<ServiceRequest[]> {
    try {
        const q = query(
            collection(db, SERVICE_REQUESTS_COLLECTION),
            where('farmerId', '==', farmerId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ServiceRequest[];
    } catch (error) {
        console.error('Error getting farmer requests:', error);
        return [];
    }
}

/**
 * Lấy tổng nhu cầu thợ mùa vụ trong Hub (Hub Leader view)
 */
export async function getHubPoolingDemand(hubId: string): Promise<{
    totalRequests: number;
    totalWorkers: number;
    totalDays: number;
    depositCollected: number;
}> {
    try {
        const q = query(
            collection(db, SERVICE_REQUESTS_COLLECTION),
            where('hubId', '==', hubId),
            where('type', '==', 'HUB_POOLING'),
            where('status', 'in', ['OPEN', 'MATCHED', 'IN_PROGRESS'])
        );

        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => doc.data() as ServiceRequest);

        return {
            totalRequests: requests.length,
            totalWorkers: requests.reduce((sum, r) => sum + r.workersNeeded, 0),
            totalDays: requests.reduce((sum, r) => sum + r.daysNeeded, 0),
            depositCollected: requests
                .filter(r => r.depositPaid)
                .reduce((sum, r) => sum + r.depositAmount, 0)
        };
    } catch (error) {
        console.error('Error getting hub pooling demand:', error);
        return { totalRequests: 0, totalWorkers: 0, totalDays: 0, depositCollected: 0 };
    }
}

// ============================================================
// THỢ RUỘT (Favorite Workers)
// ============================================================

/**
 * Thêm thợ vào danh sách thợ ruột
 */
export async function addFavoriteWorker(
    farmerId: string,
    workerId: string
): Promise<boolean> {
    try {
        const farmerRef = doc(db, USERS_COLLECTION, farmerId);
        const farmerSnap = await getDoc(farmerRef);

        if (!farmerSnap.exists()) return false;

        const currentFavorites = farmerSnap.data().favoriteWorkers || [];
        if (!currentFavorites.includes(workerId)) {
            await updateDoc(farmerRef, {
                favoriteWorkers: [...currentFavorites, workerId],
                updatedAt: serverTimestamp()
            });
        }

        return true;
    } catch (error) {
        console.error('Error adding favorite worker:', error);
        return false;
    }
}

/**
 * Xóa thợ khỏi danh sách thợ ruột
 */
export async function removeFavoriteWorker(
    farmerId: string,
    workerId: string
): Promise<boolean> {
    try {
        const farmerRef = doc(db, USERS_COLLECTION, farmerId);
        const farmerSnap = await getDoc(farmerRef);

        if (!farmerSnap.exists()) return false;

        const currentFavorites = farmerSnap.data().favoriteWorkers || [];
        await updateDoc(farmerRef, {
            favoriteWorkers: currentFavorites.filter((id: string) => id !== workerId),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error removing favorite worker:', error);
        return false;
    }
}

/**
 * Lấy danh sách thợ ruột của Farmer
 */
export async function getFavoriteWorkers(farmerId: string): Promise<UserProfile[]> {
    try {
        const farmerRef = doc(db, USERS_COLLECTION, farmerId);
        const farmerSnap = await getDoc(farmerRef);

        if (!farmerSnap.exists()) return [];

        const favoriteIds = farmerSnap.data().favoriteWorkers || [];
        if (favoriteIds.length === 0) return [];

        // Fetch each worker profile
        const workers: UserProfile[] = [];
        for (const workerId of favoriteIds) {
            const workerRef = doc(db, USERS_COLLECTION, workerId);
            const workerSnap = await getDoc(workerRef);
            if (workerSnap.exists()) {
                workers.push({ uid: workerSnap.id, ...workerSnap.data() } as UserProfile);
            }
        }

        return workers;
    } catch (error) {
        console.error('Error getting favorite workers:', error);
        return [];
    }
}

// ============================================================
// FACEBOOK POSTER (Vampire Attack)
// ============================================================

/**
 * Đánh dấu đã share lên Facebook
 */
export async function markAsSharedToFacebook(
    requestId: string,
    posterId?: string
): Promise<boolean> {
    try {
        const requestRef = doc(db, SERVICE_REQUESTS_COLLECTION, requestId);
        await updateDoc(requestRef, {
            isSharedToFacebook: true,
            facebookPosterId: posterId,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error marking as shared:', error);
        return false;
    }
}

/**
 * Generate text để share lên Facebook
 */
export function generateFacebookShareText(request: ServiceRequest): string {
    const jobTypeLabels: Record<JobType, string> = {
        harvest: '🌾 Hái cà phê',
        irrigation: '💧 Tưới nước',
        pruning: '✂️ Cắt tỉa',
        fertilizing: '🌱 Bón phân',
        spraying: '🧪 Phun thuốc',
        other: '🔧 Công việc khác'
    };

    return `📢 CẦN TÌM THỢ
  
${jobTypeLabels[request.jobType]}
👥 Số người: ${request.workersNeeded} thợ
📅 Thời gian: ${request.daysNeeded} ngày (từ ${request.startDate})
💰 Công: ${(request.dailyRate || 300000).toLocaleString()}đ/ngày

📍 ${request.location?.address || 'Liên hệ để biết địa chỉ'}
📞 Liên hệ: ${request.farmerPhone}

#TimTho #CaPhe #NongNghiep`;
}
