
import { GardenMetrics, EcoTag } from '../types';

/**
 * MOCK DATA INPUTS for the Engine
 * In a real app, these would come from Firestore 'logs' and 'inventory' collections.
 */
interface ActivityLog {
  id: string;
  type: string;
  productEcoTag?: EcoTag;
  timestamp: Date;
}

/**
 * CORE LOGIC ENGINE
 * Calculates metrics based on user activity without punishment.
 */
export const calculateGardenMetrics = (logs: ActivityLog[]): GardenMetrics => {
  // 1. Calculate Consistency Score (Hard Work)
  // Logic: Rewards frequency of interaction.
  const consistencyScore = Math.min(logs.length * 5, 100); 

  // 2. Calculate Eco-Potential Index (Direction)
  // Logic: Ratio of Bio/Organic inputs vs Total inputs.
  // CRITICAL: Chemical inputs do NOT reduce the score, they just dilute the potential.
  const bioLogs = logs.filter(l => l.productEcoTag === 'ORGANIC' || l.productEcoTag === 'BIOLOGICAL');
  const totalInputs = logs.filter(l => l.productEcoTag !== undefined);
  
  let ecoPotential = 0;
  if (totalInputs.length > 0) {
    ecoPotential = Math.round((bioLogs.length / totalInputs.length) * 100);
  }

  // Bonus for high consistency (Hard work enables better farming)
  if (consistencyScore > 80) {
    ecoPotential += 5; 
  }

  ecoPotential = Math.min(ecoPotential, 100);

  // 3. Determine Badge Tier
  let badge: GardenMetrics['currentBadge'] = 'MEMBER';
  let milestone = 'Hãy ghi chép nhật ký để thăng hạng!';

  if (consistencyScore > 30) {
    badge = 'PRO_FARMER'; // Default goal for everyone
    milestone = 'Đạt 80 điểm Chăm chỉ để mở khóa tính năng Chuyên sâu';
  }

  // The Organic Path is an "Unlock"
  if (consistencyScore > 50 && ecoPotential > 60) {
    badge = 'ECO_PIONEER';
    milestone = 'Bạn đã rất gần chứng chỉ Hữu cơ!';
  }

  if (consistencyScore > 80 && ecoPotential > 90) {
    badge = 'CERTIFIED_ORGANIC';
    milestone = 'Tuyệt vời! Vườn của bạn đạt chuẩn Quốc tế.';
  }

  return {
    consistencyScore,
    ecoPotentialIndex: ecoPotential,
    currentBadge: badge,
    nextMilestone: milestone
  };
};

/**
 * Contextual Recommendation Engine
 */
export const getSmartRecommendation = (metrics: GardenMetrics) => {
  if (metrics.currentBadge === 'MEMBER') {
    return {
      text: "Mẹo: Ghi chép nhật ký hôm nay để nhận +5 điểm Chăm chỉ.",
      action: "Ghi nhật ký ngay",
      type: "NEUTRAL"
    };
  }

  if (metrics.currentBadge === 'PRO_FARMER') {
    // If they are a pro farmer but using chemicals (low eco potential)
    // Suggest alternatives gently (Upsell)
    if (metrics.ecoPotentialIndex < 40) {
       return {
        text: "Thị trường: Cà phê Hữu cơ đang có giá cao hơn 15%. Bác có muốn xem thử phân bón Vi sinh không?",
        action: "Xem vật tư Vi sinh",
        type: "UPSELL"
      };
    }
  }

  if (metrics.currentBadge === 'ECO_PIONEER') {
    return {
      text: "Chỉ còn 2 bước nữa để đạt chứng chỉ Organic. Hãy kiểm tra lại quy trình bón phân.",
      action: "Kiểm tra quy trình",
      type: "ORGANIC"
    };
  }

  return {
    text: "Vườn của bác đang phát triển rất tốt!",
    action: "Xem báo cáo",
    type: "NEUTRAL"
  };
};
