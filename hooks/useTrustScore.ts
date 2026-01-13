
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from './useFinance';
import { calculateAgriTrustScore, ScorableTask, VisitLog, TrustScoreBreakdown } from '../utils/trustScoring';

export const useTrustScore = () => {
  const { userProfile } = useAuth();
  const { transactions } = useFinance();
  const [scoreData, setScoreData] = useState<TrustScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    // 1. MOCK UP DATA FOR TASKS (Since we don't store tasks in Firestore yet)
    // In a real app, fetch from 'tasks' collection
    const mockTasks: ScorableTask[] = [
        { id: 1, isCritical: true, type: 'care', completedAt: '2024-05-10', verificationTier: 'GOLD' },
        { id: 2, isCritical: true, type: 'care', completedAt: '2024-05-20', verificationTier: 'SILVER' },
        { id: 3, isCritical: true, type: 'harvest', completedAt: '2024-11-15', verificationTier: 'GOLD' },
        // A pending critical task
        { id: 4, isCritical: true, type: 'care', verificationTier: null }, 
    ];

    // 2. MOCK UP VISIT LOGS (Simulate from Streak + Garden Location)
    // In real app, fetch 'visit_logs' collection
    const mockVisits: VisitLog[] = [];
    const today = new Date();
    // Simulate: User visits once a week for the last 10 weeks
    for (let i = 0; i < 10; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (i * 7));
        mockVisits.push({
            timestamp: d.toISOString(),
            lat: userProfile.gardenLocation?.lat || 0,
            lng: userProfile.gardenLocation?.lng || 0
        });
    }

    // 3. RUN ENGINE
    const result = calculateAgriTrustScore(
        mockTasks,
        mockVisits,
        transactions
    );

    setScoreData(result);
    setLoading(false);

  }, [userProfile, transactions]);

  return { scoreData, loading };
};
