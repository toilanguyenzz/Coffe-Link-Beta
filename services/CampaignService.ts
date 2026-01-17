/**
 * CampaignService.ts
 * Service quản lý Campaign gom đơn phân bón
 * Tầng 2: Commerce - Goods Flow
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
    Unsubscribe,
    increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { Campaign, CampaignOrder } from '../types';

const CAMPAIGNS_COLLECTION = 'campaigns';
const CAMPAIGN_ORDERS_COLLECTION = 'campaignOrders';

// ============================================================
// CAMPAIGN CRUD
// ============================================================

/**
 * Lấy Campaign theo ID
 */
export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
    try {
        const docRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Campaign;
        }
        return null;
    } catch (error) {
        console.error('Error getting campaign:', error);
        return null;
    }
}

/**
 * Lấy danh sách Campaigns đang active trong Hub
 */
export async function getActiveCampaigns(hubId: string): Promise<Campaign[]> {
    try {
        const q = query(
            collection(db, CAMPAIGNS_COLLECTION),
            where('hubId', '==', hubId),
            where('status', '==', 'ACTIVE'),
            orderBy('endDate', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Campaign[];
    } catch (error) {
        console.error('Error getting active campaigns:', error);
        return [];
    }
}

/**
 * Realtime listener cho Campaign progress (để cập nhật thanh tiến độ)
 */
export function onCampaignProgress(
    campaignId: string,
    callback: (campaign: Campaign) => void
): Unsubscribe {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);

    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() } as Campaign);
        }
    });
}

/**
 * Tạo Campaign mới (Hub Leader only)
 */
export async function createCampaign(
    data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'currentQuantity' | 'deepLinkCode'>
): Promise<string | null> {
    try {
        const campaignRef = doc(collection(db, CAMPAIGNS_COLLECTION));

        // Generate unique deep link code
        const deepLinkCode = generateDeepLinkCode();

        await setDoc(campaignRef, {
            ...data,
            currentQuantity: 0,
            deepLinkCode,
            status: 'ACTIVE',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return campaignRef.id;
    } catch (error) {
        console.error('Error creating campaign:', error);
        return null;
    }
}

/**
 * Generate unique deep link code
 */
function generateDeepLinkCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Tìm Campaign bằng deep link code
 */
export async function getCampaignByDeepLink(code: string): Promise<Campaign | null> {
    try {
        const q = query(
            collection(db, CAMPAIGNS_COLLECTION),
            where('deepLinkCode', '==', code.toUpperCase())
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Campaign;
    } catch (error) {
        console.error('Error getting campaign by deep link:', error);
        return null;
    }
}

// ============================================================
// CAMPAIGN ORDERS (Đặt cọc)
// ============================================================

/**
 * Đặt hàng trong Campaign (Farmer)
 */
export async function joinCampaign(
    campaignId: string,
    userId: string,
    userName: string,
    userPhone: string,
    quantity: number
): Promise<CampaignOrder | null> {
    try {
        // Get campaign for price calculation
        const campaign = await getCampaignById(campaignId);
        if (!campaign || campaign.status !== 'ACTIVE') {
            throw new Error('Campaign không khả dụng');
        }

        // Check min order quantity
        if (campaign.minOrderQuantity && quantity < campaign.minOrderQuantity) {
            throw new Error(`Tối thiểu ${campaign.minOrderQuantity} ${campaign.unit}`);
        }

        // Calculate amounts
        const totalAmount = campaign.dealPrice * quantity;
        const depositAmount = Math.round(totalAmount * 0.3); // 30% deposit

        // Generate pickup QR
        const pickupQrCode = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create order
        const orderRef = doc(collection(db, CAMPAIGN_ORDERS_COLLECTION));
        const order: Omit<CampaignOrder, 'id'> = {
            campaignId,
            userId,
            userName,
            userPhone,
            quantity,
            totalAmount,
            depositAmount,
            depositPaid: false,
            pickupConfirmed: false,
            pickupQrCode,
            createdAt: serverTimestamp()
        };

        await setDoc(orderRef, order);

        // Update campaign currentQuantity
        const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
        await updateDoc(campaignRef, {
            currentQuantity: increment(quantity),
            updatedAt: serverTimestamp()
        });

        // Check if campaign is fulfilled
        if (campaign.currentQuantity + quantity >= campaign.targetQuantity) {
            await updateDoc(campaignRef, {
                status: 'FULFILLED'
            });
        }

        return { id: orderRef.id, ...order } as CampaignOrder;
    } catch (error) {
        console.error('Error joining campaign:', error);
        throw error;
    }
}

/**
 * Xác nhận đã đặt cọc (Có thể gọi sau khi thanh toán offline)
 */
export async function confirmDeposit(orderId: string): Promise<boolean> {
    try {
        const orderRef = doc(db, CAMPAIGN_ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, {
            depositPaid: true,
            depositPaidAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error confirming deposit:', error);
        return false;
    }
}

/**
 * Xác nhận nhận hàng (Quét QR tại Hub)
 */
export async function confirmPickup(orderId: string): Promise<boolean> {
    try {
        const orderRef = doc(db, CAMPAIGN_ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, {
            pickupConfirmed: true,
            pickupConfirmedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error confirming pickup:', error);
        return false;
    }
}

/**
 * Lấy đơn hàng của user trong Campaign
 */
export async function getUserCampaignOrders(userId: string): Promise<CampaignOrder[]> {
    try {
        const q = query(
            collection(db, CAMPAIGN_ORDERS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CampaignOrder[];
    } catch (error) {
        console.error('Error getting user orders:', error);
        return [];
    }
}

/**
 * Lấy tất cả đơn hàng trong Campaign (Hub Leader)
 */
export async function getCampaignOrders(campaignId: string): Promise<CampaignOrder[]> {
    try {
        const q = query(
            collection(db, CAMPAIGN_ORDERS_COLLECTION),
            where('campaignId', '==', campaignId),
            orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CampaignOrder[];
    } catch (error) {
        console.error('Error getting campaign orders:', error);
        return [];
    }
}

// ============================================================
// VIRAL SHARING
// ============================================================

/**
 * Generate shareable link cho Campaign
 * Note: Sử dụng Branch.io hoặc custom domain trong production
 */
export function generateShareLink(campaign: Campaign): string {
    // Development: Dùng hash router link
    // Production: Thay bằng Branch.io link hoặc Universal Link
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/campaign/${campaign.deepLinkCode}`;
}

/**
 * Generate share text cho Zalo/Facebook
 */
export function generateShareText(campaign: Campaign): string {
    const savings = campaign.originalPrice - campaign.dealPrice;
    const savingsPercent = Math.round((savings / campaign.originalPrice) * 100);
    const remaining = campaign.targetQuantity - campaign.currentQuantity;

    return `🌱 DEAL HOT: ${campaign.title}
💰 Giá gốc: ${campaign.originalPrice.toLocaleString()}đ
🔥 Giá gom đơn: ${campaign.dealPrice.toLocaleString()}đ (-${savingsPercent}%)
📦 Còn ${remaining} ${campaign.unit} nữa là đủ!

👉 Đặt ngay: ${generateShareLink(campaign)}`;
}
