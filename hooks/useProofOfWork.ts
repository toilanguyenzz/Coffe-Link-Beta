
import { useState } from 'react';
import { useAuth } from '../contexts/DemoAuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getDistanceFromLatLonInMeters } from '../utils/geoUtils';
import { StreakData } from '../types';

export interface CheckInResult {
  success: boolean;
  message: string;
  distance?: number;
  streakUpdated?: boolean;
  newStreak?: number;
}

export const useProofOfWork = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Constants
  const MAX_DISTANCE_METERS = 200; // 200m allowed radius
  const LOAN_TIER_1_DAYS = 30; // 5 Million
  const LOAN_TIER_2_DAYS = 90; // 20 Million

  const checkLoanEligibility = () => {
    const streak = userProfile?.streak?.current || 0;
    return {
      canBorrow5M: streak >= LOAN_TIER_1_DAYS,
      canBorrow20M: streak >= LOAN_TIER_2_DAYS,
      currentStreak: streak,
      nextGoal: streak < LOAN_TIER_1_DAYS ? LOAN_TIER_1_DAYS : LOAN_TIER_2_DAYS
    };
  };

  // Helper: Get local date string YYYY-MM-DD correctly
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const performCheckIn = async (): Promise<CheckInResult> => {
    if (!currentUser || !userProfile) {
      return { success: false, message: "Vui lòng đăng nhập." };
    }

    if (!userProfile.gardenLocation?.lat || !userProfile.gardenLocation?.lng) {
      return { success: false, message: "Bạn chưa định vị vườn. Vui lòng vào Hồ sơ để cài đặt." };
    }

    setLoading(true);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLoading(false);
        resolve({ success: false, message: "Thiết bị không hỗ trợ GPS." });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;

          // 1. Verify GPS (Anti-Cheat)
          const distance = getDistanceFromLatLonInMeters(
            currentLat,
            currentLng,
            userProfile.gardenLocation!.lat,
            userProfile.gardenLocation!.lng
          );

          // Allow slight buffer or Dev mode override if needed, strict for Prod
          if (distance > MAX_DISTANCE_METERS) {
            setLoading(false);
            resolve({
              success: false,
              message: `CẢNH BÁO: Bạn đang cách vườn ${Math.round(distance)}m. Vui lòng ra vườn để check-in!`,
              distance
            });
            return;
          }

          // 2. Update Streak (REAL LOGIC)
          try {
            const today = getLocalToday();
            const streakData = userProfile.streak || { current: 0, highest: 0, lastLogDate: null };
            let newCurrent = streakData.current;
            let streakUpdated = false;

            if (streakData.lastLogDate === today) {
              // Already logged today -> No increment, just success
              streakUpdated = false;
            } else {
              // Check if logged yesterday
              const yesterdayDate = new Date();
              yesterdayDate.setDate(yesterdayDate.getDate() - 1);

              const yYear = yesterdayDate.getFullYear();
              const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
              const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
              const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

              if (streakData.lastLogDate === yesterdayStr) {
                // Perfect streak
                newCurrent += 1;
              } else {
                // Missed a day (or first time) -> Reset logic
                // If it's the very first time (current=0), set to 1.
                // If they broke the streak, reset to 1.
                newCurrent = 1;
              }
              streakUpdated = true;
            }

            const newStreakData: StreakData = {
              current: newCurrent,
              highest: Math.max(streakData.highest, newCurrent),
              lastLogDate: today
            };

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              streak: newStreakData,
              updatedAt: serverTimestamp()
            });

            await refreshProfile(); // Sync local state
            setLoading(false);

            resolve({
              success: true,
              message: streakUpdated ? `Check-in thành công! Chuỗi +1 ngày.` : `Hôm nay bác đã điểm danh rồi. Hẹn mai nhé!`,
              streakUpdated,
              newStreak: newCurrent,
              distance
            });

          } catch (error) {
            console.error(error);
            setLoading(false);
            resolve({ success: false, message: "Lỗi hệ thống khi lưu dữ liệu." });
          }
        },
        (error) => {
          setLoading(false);
          resolve({ success: false, message: "Không thể lấy vị trí. Hãy bật GPS." });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  return {
    loading,
    checkLoanEligibility,
    performCheckIn
  };
};
