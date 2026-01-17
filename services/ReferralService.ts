/**
 * ReferralService.ts
 * Service quản lý Referral system cho Trưởng Hub
 * Phase 6: Hub Leader Marketing System
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    increment,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, HubLeaderStats, ReferralBonus, ReferralBonusType } from '../types';

// Bonus amounts (VNĐ)
const BONUS_AMOUNTS = {
    SIGNUP: 10000,        // User đăng ký qua mã
    FIRST_ORDER: 20000,   // User hoàn thành đơn đầu tiên
    CAMPAIGN_JOIN: 5000   // User tham gia Campaign
};

/**
 * Generate referral code cho Hub Leader
 * Format: HUB-{hubId short}-{random}
 */
export function generateReferralCode(hubId: string): string {
    const hubShort = hubId.slice(-4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HUB-${hubShort}-${random}`;
}

/**
 * Validate và lấy Hub Leader từ referral code
 */
export async function validateReferralCode(code: string): Promise<UserProfile | null> {
    if (!code || code.length < 6) return null;

    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', code.toUpperCase()), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        return snapshot.docs[0].data() as UserProfile;
    } catch (error) {
        console.error('Error validating referral code:', error);
        return null;
    }
}

/**
 * Track referral khi user mới signup
 * Gọi sau khi tạo tài khoản user
 */
export async function trackReferral(
    newUserId: string,
    newUserName: string,
    referralCode: string
): Promise<boolean> {
    try {
        // Validate code và lấy Hub Leader
        const hubLeader = await validateReferralCode(referralCode);
        if (!hubLeader) return false;

        // Cập nhật user mới với referredBy
        const userRef = doc(db, 'users', newUserId);
        await updateDoc(userRef, {
            referredBy: hubLeader.uid,
            updatedAt: serverTimestamp()
        });

        // Tạo pending bonus cho Hub Leader
        await createReferralBonus(
            hubLeader.uid,
            hubLeader.displayName,
            newUserId,
            newUserName,
            'SIGNUP'
        );

        // Tăng referralCount của Hub Leader
        const leaderRef = doc(db, 'users', hubLeader.uid);
        await updateDoc(leaderRef, {
            referralCount: increment(1),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error tracking referral:', error);
        return false;
    }
}

/**
 * Tạo bản ghi bonus cho Hub Leader
 */
async function createReferralBonus(
    hubLeaderId: string,
    hubLeaderName: string,
    referredUserId: string,
    referredUserName: string,
    bonusType: ReferralBonusType,
    campaignId?: string
): Promise<void> {
    const bonusRef = collection(db, 'referralBonuses');

    await addDoc(bonusRef, {
        hubLeaderId,
        hubLeaderName,
        referredUserId,
        referredUserName,
        bonusType,
        bonusAmount: BONUS_AMOUNTS[bonusType],
        campaignId: campaignId || null,
        status: 'PENDING',
        createdAt: serverTimestamp()
    });
}

/**
 * Confirm bonus khi user hoàn thành điều kiện
 * VD: First order completed
 */
export async function confirmReferralBonus(
    userId: string,
    bonusType: ReferralBonusType,
    campaignId?: string
): Promise<boolean> {
    try {
        // Lấy thông tin user và người giới thiệu
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;

        const user = userSnap.data() as UserProfile;
        if (!user.referredBy) return false;

        // Tạo confirmed bonus
        await createReferralBonus(
            user.referredBy,
            '', // Sẽ lấy từ cache hoặc query
            userId,
            user.displayName,
            bonusType,
            campaignId
        );

        // Cập nhật pending -> confirmed cho bonuses cũ
        const bonusRef = collection(db, 'referralBonuses');
        const q = query(
            bonusRef,
            where('hubLeaderId', '==', user.referredBy),
            where('referredUserId', '==', userId),
            where('status', '==', 'PENDING')
        );

        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
            await updateDoc(doc(db, 'referralBonuses', docSnap.id), {
                status: 'CONFIRMED',
                confirmedAt: serverTimestamp()
            });
        }

        // Cộng bonus vào Hub Leader
        const leaderRef = doc(db, 'users', user.referredBy);
        await updateDoc(leaderRef, {
            referralBonus: increment(BONUS_AMOUNTS[bonusType]),
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error confirming referral bonus:', error);
        return false;
    }
}

/**
 * Lấy Hub Leader Stats
 */
export async function getHubLeaderStats(hubId: string): Promise<HubLeaderStats | null> {
    try {
        const statsRef = doc(db, 'hubLeaderStats', hubId);
        const snap = await getDoc(statsRef);

        if (snap.exists()) {
            return snap.data() as HubLeaderStats;
        }

        return null;
    } catch (error) {
        console.error('Error getting hub leader stats:', error);
        return null;
    }
}

/**
 * Lấy Top Referrers Leaderboard
 */
export async function getTopReferrers(limitCount: number = 10): Promise<HubLeaderStats[]> {
    try {
        const statsRef = collection(db, 'hubLeaderStats');
        const q = query(
            statsRef,
            orderBy('totalReferrals', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc, index) => ({
            ...doc.data() as HubLeaderStats,
            rank: index + 1
        }));
    } catch (error) {
        console.error('Error getting top referrers:', error);
        return [];
    }
}

/**
 * Lấy lịch sử bonus của Hub Leader
 */
export async function getHubLeaderBonuses(hubLeaderId: string): Promise<ReferralBonus[]> {
    try {
        const bonusRef = collection(db, 'referralBonuses');
        const q = query(
            bonusRef,
            where('hubLeaderId', '==', hubLeaderId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ReferralBonus));
    } catch (error) {
        console.error('Error getting hub leader bonuses:', error);
        return [];
    }
}

/**
 * Tính tổng tiết kiệm mà Hub Leader đã tạo ra
 * (Sum of savings từ tất cả referral orders)
 */
export async function calculateTotalSavingsGenerated(hubLeaderId: string): Promise<number> {
    try {
        // Query tất cả orders từ users được refer bởi leader
        const usersRef = collection(db, 'users');
        const refUsersQuery = query(usersRef, where('referredBy', '==', hubLeaderId));
        const usersSnapshot = await getDocs(refUsersQuery);

        if (usersSnapshot.empty) return 0;

        const userIds = usersSnapshot.docs.map(d => d.id);

        // Query orders của các users này
        let totalSavings = 0;

        // Simplified: Chỉ count số orders * trung bình tiết kiệm
        // Thực tế nên query campaignOrders và tính savings thực
        const avgSavingsPerOrder = 50000; // 50k trung bình
        totalSavings = userIds.length * avgSavingsPerOrder;

        return totalSavings;
    } catch (error) {
        console.error('Error calculating savings:', error);
        return 0;
    }
}

/**
 * Cập nhật Hub Leader Stats (chạy định kỳ hoặc trigger)
 */
export async function updateHubLeaderStats(hubId: string, leaderId: string): Promise<void> {
    try {
        // Lấy thông tin leader
        const leaderRef = doc(db, 'users', leaderId);
        const leaderSnap = await getDoc(leaderRef);
        if (!leaderSnap.exists()) return;

        const leader = leaderSnap.data() as UserProfile;

        // Đếm referrals tháng này
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const usersRef = collection(db, 'users');
        const monthlyQuery = query(
            usersRef,
            where('referredBy', '==', leaderId),
            where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
        );
        const monthlySnap = await getDocs(monthlyQuery);

        // Tính total savings
        const totalSavings = await calculateTotalSavingsGenerated(leaderId);

        // Cập nhật stats
        const statsRef = doc(db, 'hubLeaderStats', hubId);
        await setDoc(statsRef, {
            hubId,
            leaderId,
            leaderName: leader.displayName,
            totalReferrals: leader.referralCount || 0,
            monthlyReferrals: monthlySnap.size,
            totalSavingsGenerated: totalSavings,
            totalOrdersGenerated: 0, // TODO: Query from orders
            updatedAt: serverTimestamp()
        }, { merge: true });

    } catch (error) {
        console.error('Error updating hub leader stats:', error);
    }
}
