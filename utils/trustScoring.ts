
import { TransactionData } from '../hooks/useFinance';

// --- INPUT INTERFACES ---

export interface ScorableTask {
  id: number | string;
  isCritical: boolean; // Việc quan trọng (bón phân, thu hoạch)
  completedAt?: string; // ISO Date
  verificationTier?: 'GOLD' | 'SILVER' | 'BRONZE' | 'FAIL' | null;
  type: 'harvest' | 'care' | 'other';
}

export interface VisitLog {
  timestamp: string; // ISO Date
  lat: number;
  lng: number;
}

export interface TrustScoreBreakdown {
  totalScore: number;
  components: {
    base: number;
    compliance: number; // Factor A
    frequency: number;  // Factor B
    financial: number;  // Factor C
    penalty: number;
  };
  tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';
  details: string[];
}

// --- HELPER: GET WEEK NUMBER ---
const getWeekKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  const weekNum = Math.ceil((((d.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
};

/**
 * CORE SCORING FUNCTION
 */
export const calculateAgriTrustScore = (
  tasks: ScorableTask[],
  visitLogs: VisitLog[],
  transactions: TransactionData[]
): TrustScoreBreakdown => {
  let score = 500; // Base Score
  const details: string[] = ["Điểm cơ bản: 500"];

  // ---------------------------------------------------------
  // FACTOR A: COMPLIANCE (Max 200)
  // Logic: % Critical Tasks completed * Quality Multiplier
  // ---------------------------------------------------------
  const criticalTasks = tasks.filter(t => t.isCritical);
  let complianceScore = 0;

  if (criticalTasks.length > 0) {
    let weightedCompleted = 0;
    
    criticalTasks.forEach(t => {
      if (t.completedAt) {
        let multiplier = 0.5; // Default Bronze/No verification
        if (t.verificationTier === 'GOLD') multiplier = 1.0;
        else if (t.verificationTier === 'SILVER') multiplier = 0.8;
        
        weightedCompleted += multiplier;
      }
    });

    // Formula: (WeightedCompleted / TotalCritical) * 200
    complianceScore = Math.round((weightedCompleted / criticalTasks.length) * 200);
    details.push(`Tuân thủ quy trình: +${complianceScore} (Dựa trên ${criticalTasks.length} nhiệm vụ trọng yếu)`);
  } else {
    // If no critical tasks assigned yet, give neutral score
    complianceScore = 100;
    details.push(`Tuân thủ quy trình: +100 (Chưa có nhiệm vụ trọng yếu)`);
  }
  
  score += complianceScore;

  // ---------------------------------------------------------
  // FACTOR B: VISIT FREQUENCY (Max 100)
  // Logic: Active Weeks ratio (Not Daily Streak)
  // ---------------------------------------------------------
  const uniqueWeeks = new Set<string>();
  visitLogs.forEach(log => uniqueWeeks.add(getWeekKey(log.timestamp)));
  
  // Assume a season window of 12 weeks for calculation context
  const TOTAL_SEASON_WEEKS = 12; 
  const activeWeeksCount = uniqueWeeks.size;
  const activityRatio = activeWeeksCount / TOTAL_SEASON_WEEKS;
  
  let frequencyScore = 0;
  if (activityRatio >= 0.8) {
    frequencyScore = 100;
    details.push(`Tần suất thăm vườn: +100 (Rất chăm chỉ: ${activeWeeksCount} tuần)`);
  } else if (activityRatio >= 0.5) {
    frequencyScore = 50;
    details.push(`Tần suất thăm vườn: +50 (Mức trung bình: ${activeWeeksCount} tuần)`);
  } else {
    frequencyScore = 0;
    details.push(`Tần suất thăm vườn: +0 (Cảnh báo: Bỏ bê vườn)`);
  }

  score += frequencyScore;

  // ---------------------------------------------------------
  // FACTOR C: FINANCIAL HEALTH (Max 200)
  // Logic: Verified Purchases + Organic Bonus
  // ---------------------------------------------------------
  let financialScore = 0;
  const expenseLogs = transactions.filter(t => t.type === 'expense');
  
  expenseLogs.forEach(tx => {
    // +10 points per receipt
    if (financialScore < 200) financialScore += 10;
    
    // +50 bonus for Organic/Bio inputs
    const isOrganic = /hữu cơ|vi sinh|organic|bio|phân chuồng/i.test(tx.category + tx.note);
    if (isOrganic && financialScore < 200) {
        financialScore = Math.min(financialScore + 40, 200); // Add extra 40 (total 50 per item)
    }
  });
  
  details.push(`Sức khỏe tài chính: +${financialScore} (${expenseLogs.length} giao dịch)`);
  score += financialScore;

  // ---------------------------------------------------------
  // PENALTY: GHOST HARVEST (Fraud Detection)
  // Logic: Harvest task done WITHOUT visit log in that week
  // ---------------------------------------------------------
  let penalty = 0;
  const harvestTasks = tasks.filter(t => t.type === 'harvest' && t.completedAt);
  
  harvestTasks.forEach(t => {
      if (t.completedAt) {
          const taskWeek = getWeekKey(t.completedAt);
          if (!uniqueWeeks.has(taskWeek)) {
              penalty += 100;
              details.push(`⚠️ CẢNH BÁO: Thu hoạch ngày ${t.completedAt} nhưng không có dữ liệu GPS tại vườn! (-100)`);
          }
      }
  });

  score = Math.max(0, score - penalty);
  score = Math.min(1000, score); // Cap at 1000

  // ---------------------------------------------------------
  // TIER DETERMINATION
  // ---------------------------------------------------------
  let tier: TrustScoreBreakdown['tier'] = 'BRONZE';
  if (score >= 800) tier = 'DIAMOND';
  else if (score >= 700) tier = 'GOLD';
  else if (score >= 500) tier = 'SILVER';

  return {
    totalScore: score,
    components: {
      base: 500,
      compliance: complianceScore,
      frequency: frequencyScore,
      financial: financialScore,
      penalty
    },
    tier,
    details
  };
};
