import React from 'react';
import { GardenMetrics } from '../../types';
import { 
  Tractor, 
  Leaf, 
  Medal, 
  ArrowRight, 
  ShieldCheck,
  Sprout
} from 'lucide-react';
import { getSmartRecommendation } from '../../utils/gardenLogic';

interface Props {
  metrics: GardenMetrics;
}

const FarmHealthCard: React.FC<Props> = ({ metrics }) => {
  const recommendation = getSmartRecommendation(metrics);
  const isOrganicPathUnlocked = metrics.ecoPotentialIndex > 30; // Only show Eco score if they show interest

  // Dynamic Theme based on Badge
  const getTheme = () => {
    switch (metrics.currentBadge) {
        case 'CERTIFIED_ORGANIC': return 'from-green-700 to-emerald-900';
        case 'ECO_PIONEER': return 'from-teal-600 to-green-700';
        case 'PRO_FARMER': return 'from-blue-600 to-blue-800';
        default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-[2.5rem] p-6 text-white shadow-xl transition-all duration-500 bg-gradient-to-br ${getTheme()}`}>
       {/* Background Decor */}
       <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
       <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-black/10 blur-2xl"></div>

       <div className="relative z-10">
          {/* Header: Badge & Title */}
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
                    {metrics.currentBadge === 'CERTIFIED_ORGANIC' ? <ShieldCheck className="h-6 w-6 text-green-200" /> :
                     metrics.currentBadge === 'ECO_PIONEER' ? <Leaf className="h-6 w-6 text-teal-200" /> :
                     <Medal className="h-6 w-6 text-yellow-200" />}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Hạng Thành Viên</p>
                    <h2 className="text-xl font-black tracking-tight uppercase">
                        {metrics.currentBadge === 'CERTIFIED_ORGANIC' ? 'Chứng Nhận Quốc Tế' :
                         metrics.currentBadge === 'ECO_PIONEER' ? 'Tiên Phong Sinh Học' :
                         metrics.currentBadge === 'PRO_FARMER' ? 'Nông Dân Chuyên Nghiệp' : 'Thành Viên Mới'}
                    </h2>
                </div>
             </div>
             
             {/* Consistency Score Circle (Always Visible) */}
             <div className="text-center">
                 <div className="relative flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-yellow-400 drop-shadow-md" strokeDasharray={`${metrics.consistencyScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <span className="absolute text-sm font-black">{metrics.consistencyScore}</span>
                 </div>
                 <p className="mt-1 text-[9px] font-bold text-white/70 uppercase">Điểm Chăm Chỉ</p>
             </div>
          </div>

          {/* Eco-Potential Bar (Conditional Unlock) */}
          {isOrganicPathUnlocked ? (
             <div className="mb-5 rounded-2xl bg-black/20 p-4 backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-green-300" />
                        <span className="text-xs font-bold uppercase tracking-wide text-green-100">Lộ trình Hữu Cơ</span>
                    </div>
                    <span className="text-xl font-black text-white">{metrics.ecoPotentialIndex}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-300 shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                        style={{ width: `${metrics.ecoPotentialIndex}%` }}
                    ></div>
                </div>
                <p className="mt-2 text-[10px] text-white/60 italic">
                    *Tỷ lệ sử dụng vật tư sinh học. Hãy tiếp tục duy trì để mở khóa giá bán cao hơn.
                </p>
             </div>
          ) : (
             // Traditional View: Focus on Yield/Hard work
             <div className="mb-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/5">
                 <div className="flex items-center gap-2 mb-1">
                    <Tractor className="h-4 w-4 text-orange-200" />
                    <span className="text-xs font-bold text-white">Năng suất dự kiến: Ổn định</span>
                 </div>
                 <p className="text-[10px] text-white/70">
                    Bác đang làm rất tốt! Duy trì ghi chép để nhận các ưu đãi về giá vật tư.
                 </p>
             </div>
          )}

          {/* Smart Action / Recommendation */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
             <div className="flex-1 mr-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Gợi ý hôm nay</p>
                <p className="text-xs font-bold leading-relaxed line-clamp-2">
                    {recommendation.text}
                </p>
             </div>
             <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-900 shadow-lg active:scale-90 transition-all">
                <ArrowRight className="h-5 w-5" />
             </button>
          </div>
       </div>
    </div>
  );
};

export default FarmHealthCard;