
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTrustScore } from '../../hooks/useTrustScore';
import { ShieldCheck, Leaf, Flame, QrCode, Share2, Award, Check, ScanLine, Loader2 } from 'lucide-react';

const GreenPassport: React.FC = () => {
  const { userProfile } = useAuth();
  const { scoreData, loading } = useTrustScore();

  const streak = userProfile?.streak?.current || 0;
  const isEUDR = userProfile?.eudrStatus === 'passed';
  
  // Check-in status
  const today = new Date().toLocaleDateString('en-CA');
  const lastLog = userProfile?.streak?.lastLogDate;
  const isCheckedInToday = lastLog === today;

  // Real Score Data
  const trustScore = scoreData?.totalScore || 0;
  const tier = scoreData?.tier || 'BRONZE';
  
  const tierColor = tier === 'DIAMOND' ? 'text-cyan-200' : tier === 'GOLD' ? 'text-yellow-300' : tier === 'SILVER' ? 'text-gray-300' : 'text-orange-300';
  const tierBg = tier === 'DIAMOND' ? 'from-cyan-500 to-blue-600' : tier === 'GOLD' ? 'from-yellow-500 to-amber-600' : tier === 'SILVER' ? 'from-gray-400 to-gray-600' : 'from-orange-700 to-orange-900';

  // Next Tier Goal Logic
  const nextTierScore = tier === 'DIAMOND' ? 1000 : tier === 'GOLD' ? 800 : tier === 'SILVER' ? 700 : 500;
  const progressPercent = Math.min((trustScore / nextTierScore) * 100, 100);

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-5">
       {/* 1. THE PASSPORT CARD (PREMIUM ID STYLE) */}
       <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 p-5 text-white shadow-2xl shadow-green-900/40 transform transition-transform hover:scale-[1.01]">
          {/* Holographic / Noise Effect Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-green-400/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl"></div>

          <div className="relative z-10">
             {/* Header Card */}
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                      <ShieldCheck className="h-4 w-4 text-green-300" />
                   </div>
                   <div>
                       <span className="block text-[7px] font-black uppercase tracking-[0.2em] text-white/50">Digital ID</span>
                       <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-white/90">Agri-Passport</span>
                   </div>
                </div>
                <div className={`rounded-full bg-gradient-to-r ${tierBg} px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/10`}>
                   Hạng {tier}
                </div>
             </div>

             {/* User Identity Section */}
             <div className="flex gap-4 items-center mb-6">
                <div className="relative shrink-0">
                   <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 p-1 backdrop-blur-sm border border-white/10 shadow-inner">
                      <div className="h-full w-full rounded-xl bg-green-950 flex items-center justify-center text-xl font-black text-white/50">
                         {userProfile?.displayName?.charAt(0).toUpperCase()}
                      </div>
                   </div>
                   <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-green-500 p-1 border-2 border-green-900 shadow-md">
                      <Check className="h-2.5 w-2.5 text-white stroke-[4]" />
                   </div>
                </div>

                <div className="flex-1 space-y-0.5">
                   <h2 className="text-xl font-black tracking-tight leading-none text-white">{userProfile?.displayName}</h2>
                   <p className="text-[9px] font-mono text-green-200/60 tracking-wider">ID: {userProfile?.farmerId || 'PENDING'}</p>
                   
                   <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-0.5 text-[8px] font-bold text-white/90 backdrop-blur-md border border-white/5">
                         <Leaf className="h-2.5 w-2.5 text-green-400" />
                         Thành viên
                      </div>
                      {isEUDR && (
                         <div className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-2 py-0.5 text-[8px] font-bold text-blue-200 backdrop-blur-md border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            <ScanLine className="h-2.5 w-2.5" /> EUDR Verified
                         </div>
                      )}
                   </div>
                </div>
             </div>

             {/* QR & Trust Score Footer */}
             <div className="flex items-end justify-between border-t border-white/10 pt-4">
                <div>
                   <p className="text-[8px] font-bold text-green-200/60 uppercase tracking-widest mb-0.5">Điểm Tín Nhiệm</p>
                   <div className="flex items-baseline gap-1.5">
                       <p className={`text-4xl font-black tracking-tighter ${tierColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                          {trustScore}
                       </p>
                       <span className="text-[9px] font-bold text-white/40 mb-1">/ 1000</span>
                   </div>
                </div>
                <div className="rounded-lg bg-white p-1.5 shadow-lg">
                   <QrCode className="h-10 w-10 text-gray-900" />
                </div>
             </div>
          </div>
       </div>

       {/* 2. PROGRESS TO NEXT TIER (Replaced streak tracker with Score Tracker) */}
       <div className="rounded-[1.8rem] bg-white p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="rounded-[1.6rem] bg-gradient-to-b from-white to-gray-50 p-4 relative overflow-hidden">
                {/* Progress Background Line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-green-500 transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wide">Mục tiêu thăng hạng</h3>
                        <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                            Cần thêm <span className="text-green-600 font-bold">{Math.max(0, nextTierScore - trustScore)} điểm</span> để lên hạng tiếp theo.
                        </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 font-black text-xs">
                        {Math.round(progressPercent)}%
                    </div>
                </div>

                {/* Motivation Text */}
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-2.5 text-[11px] font-medium text-blue-800 border border-blue-100">
                    <Award className="h-3.5 w-3.5 shrink-0 text-blue-600 mt-0.5" />
                    <span className="leading-relaxed">
                        Hãy hoàn thành các nhiệm vụ trọng yếu đúng hạn và ghi chép chi tiêu để tăng điểm nhanh nhất!
                    </span>
                </div>
          </div>
       </div>

       {/* 3. ACTION BUTTONS */}
       <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-green-200 active:scale-95 transition-all hover:bg-green-800">
             <Share2 className="h-3.5 w-3.5" /> Gửi Ngân Hàng
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-black uppercase text-gray-600 shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-gray-50">
             <Award className="h-3.5 w-3.5" /> Xem Quyền Lợi
          </button>
       </div>
    </div>
  );
};

export default GreenPassport;
