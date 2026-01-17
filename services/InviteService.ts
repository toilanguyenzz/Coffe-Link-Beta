/**
 * InviteService.ts
 * Service quản lý mời hàng xóm vào Trạm
 * Flow: Invite Link -> Onboarding -> First Order -> Both get rewards
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Hub, UserProfile } from '../types';

// Base URL for invite links
const INVITE_BASE_URL = 'https://agrios.vn/tram/';

// Incentive amounts
export const INCENTIVES = {
    INVITER_BONUS: 20000,        // 20k cho người mời khi có đơn đầu tiên
    NEW_USER_VOUCHER: 50000,     // Voucher 50k cho người mới
    SLIDING_PRICE_TIERS: [
        { members: 50, discount: 0 },      // Giá gốc
        { members: 100, discount: 2000 },  // Giảm 2k
        { members: 200, discount: 4000 },  // Giảm 4k
    ]
};

// Voucher types
export interface Voucher {
    id: string;
    userId: string;
    type: 'WELCOME' | 'REFERRAL' | 'CAMPAIGN';
    amount: number;
    minOrderAmount?: number;
    code: string;
    expiresAt: any;
    usedAt?: any;
    status: 'ACTIVE' | 'USED' | 'EXPIRED';
    createdAt: any;
}

// Hub Invite record
export interface HubInvite {
    id: string;
    hubId: string;
    hubName: string;
    inviterId: string;
    inviterName: string;
    invitedUserId?: string;    // Sau khi người được mời tạo tài khoản
    invitedUserName?: string;
    inviteCode: string;        // Unique invite code
    status: 'PENDING' | 'JOINED' | 'ORDERED';  // ORDERED = đã phát sinh đơn
    bonusPaid: boolean;        // Đã trả thưởng cho inviter chưa
    createdAt: any;
    joinedAt?: any;
    orderedAt?: any;
}

/**
 * Generate invite code từ tên người dùng
 * VD: "Ông Hùng" -> "onghung"
 */
export function generateInviteCode(displayName: string): string {
    return displayName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 12);
}

/**
 * Generate Hub slug từ tên Hub
 * VD: "Trạm Chư Pah" -> "chupah"
 */
export function generateHubSlug(hubName: string): string {
    return hubName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/trạm|tram/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

/**
 * Tạo link mời vào Trạm
 * Format: agrios.vn/tram/chupah?ref=onghung
 */
export function generateInviteLink(hubName: string, inviterName: string): string {
    const hubSlug = generateHubSlug(hubName);
    const inviteCode = generateInviteCode(inviterName);
    return `${INVITE_BASE_URL}${hubSlug}?ref=${inviteCode}`;
}

/**
 * Tạo deep link cho App
 */
export function generateDeepLink(hubId: string, inviterId: string): string {
    return `agrios://hub/${hubId}?ref=${inviterId}`;
}

/**
 * Lưu invite record khi tạo link mời
 */
export async function createHubInvite(
    hubId: string,
    hubName: string,
    inviterId: string,
    inviterName: string
): Promise<HubInvite> {
    const inviteCode = generateInviteCode(inviterName);

    const inviteData: Omit<HubInvite, 'id'> = {
        hubId,
        hubName,
        inviterId,
        inviterName,
        inviteCode,
        status: 'PENDING',
        bonusPaid: false,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'hubInvites'), inviteData);

    return {
        id: docRef.id,
        ...inviteData
    };
}

/**
 * Xử lý khi người được mời tham gia
 * Gọi trong Onboarding khi detect ref param
 */
export async function processInviteJoin(
    inviteCode: string,
    newUserId: string,
    newUserName: string
): Promise<{ hubId: string; inviterName: string } | null> {
    try {
        // Tìm invite record
        const invitesRef = collection(db, 'hubInvites');
        const q = query(
            invitesRef,
            where('inviteCode', '==', inviteCode),
            where('status', '==', 'PENDING')
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const inviteDoc = snapshot.docs[0];
        const invite = inviteDoc.data() as HubInvite;

        // Cập nhật invite record
        await updateDoc(doc(db, 'hubInvites', inviteDoc.id), {
            invitedUserId: newUserId,
            invitedUserName: newUserName,
            status: 'JOINED',
            joinedAt: serverTimestamp()
        });

        // Gán user vào Hub
        await updateDoc(doc(db, 'users', newUserId), {
            hubId: invite.hubId,
            referredBy: invite.inviterId,
            updatedAt: serverTimestamp()
        });

        // Tạo Welcome Voucher cho người mới
        await createWelcomeVoucher(newUserId);

        // Tăng member count của Hub
        await updateDoc(doc(db, 'hubs', invite.hubId), {
            memberCount: increment(1),
            updatedAt: serverTimestamp()
        });

        return {
            hubId: invite.hubId,
            inviterName: invite.inviterName
        };
    } catch (error) {
        console.error('Error processing invite join:', error);
        return null;
    }
}

/**
 * Tạo Welcome Voucher cho user mới
 */
async function createWelcomeVoucher(userId: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 ngày

    const voucher: Omit<Voucher, 'id'> = {
        userId,
        type: 'WELCOME',
        amount: INCENTIVES.NEW_USER_VOUCHER,
        minOrderAmount: 200000,  // Đơn tối thiểu 200k
        code: `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        expiresAt,
        status: 'ACTIVE',
        createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'vouchers'), voucher);
}

/**
 * Xử lý khi người được mời hoàn thành đơn đầu tiên
 * Trả thưởng cho cả 2
 */
export async function processFirstOrderBonus(userId: string): Promise<boolean> {
    try {
        // Tìm invite record của user này
        const invitesRef = collection(db, 'hubInvites');
        const q = query(
            invitesRef,
            where('invitedUserId', '==', userId),
            where('status', '==', 'JOINED'),
            where('bonusPaid', '==', false)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return false;

        const inviteDoc = snapshot.docs[0];
        const invite = inviteDoc.data() as HubInvite;

        // Cập nhật invite
        await updateDoc(doc(db, 'hubInvites', inviteDoc.id), {
            status: 'ORDERED',
            orderedAt: serverTimestamp(),
            bonusPaid: true
        });

        // Cộng bonus cho người mời
        await updateDoc(doc(db, 'users', invite.inviterId), {
            referralBonus: increment(INCENTIVES.INVITER_BONUS),
            referralCount: increment(1),
            updatedAt: serverTimestamp()
        });

        // Ghi log giao dịch bonus
        await addDoc(collection(db, 'referralBonuses'), {
            hubLeaderId: invite.inviterId,
            hubLeaderName: invite.inviterName,
            referredUserId: userId,
            referredUserName: invite.invitedUserName,
            bonusType: 'FIRST_ORDER',
            bonusAmount: INCENTIVES.INVITER_BONUS,
            status: 'CONFIRMED',
            createdAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error processing first order bonus:', error);
        return false;
    }
}

/**
 * Tính giá sliding dựa trên số thành viên Hub
 */
export function calculateSlidingPrice(
    basePrice: number,
    currentMembers: number
): { price: number; nextTier: { members: number; price: number } | null } {
    let discount = 0;
    let nextTier = null;

    for (let i = 0; i < INCENTIVES.SLIDING_PRICE_TIERS.length; i++) {
        const tier = INCENTIVES.SLIDING_PRICE_TIERS[i];
        if (currentMembers >= tier.members) {
            discount = tier.discount;
        } else {
            nextTier = {
                members: tier.members,
                price: basePrice - tier.discount
            };
            break;
        }
    }

    return {
        price: basePrice - discount,
        nextTier
    };
}

/**
 * Lấy vouchers còn hiệu lực của user
 */
export async function getUserVouchers(userId: string): Promise<Voucher[]> {
    try {
        const vouchersRef = collection(db, 'vouchers');
        const q = query(
            vouchersRef,
            where('userId', '==', userId),
            where('status', '==', 'ACTIVE')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Voucher));
    } catch (error) {
        console.error('Error getting user vouchers:', error);
        return [];
    }
}

/**
 * Đếm số invite thành công của user
 */
export async function getInviteStats(userId: string): Promise<{
    pending: number;
    joined: number;
    ordered: number;
}> {
    try {
        const invitesRef = collection(db, 'hubInvites');
        const q = query(invitesRef, where('inviterId', '==', userId));
        const snapshot = await getDocs(q);

        const stats = { pending: 0, joined: 0, ordered: 0 };

        snapshot.docs.forEach(doc => {
            const status = doc.data().status;
            if (status === 'PENDING') stats.pending++;
            else if (status === 'JOINED') stats.joined++;
            else if (status === 'ORDERED') stats.ordered++;
        });

        return stats;
    } catch (error) {
        console.error('Error getting invite stats:', error);
        return { pending: 0, joined: 0, ordered: 0 };
    }
}
