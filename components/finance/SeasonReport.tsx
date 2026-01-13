import React from 'react';
import { Transaction } from './DailyLedger';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SeasonReportProps {
  transactions: Transaction[];
}

const SeasonReport: React.FC<SeasonReportProps> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpense;
  const isProfitable = profit >= 0;

  return (
    <div className="rounded-[2.5rem] bg-gray-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Wallet className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider">Tổng Kết Vụ Mùa</h3>
         </div>
         <span className="text-[10px] font-bold text-gray-400">Niên vụ 2024-2025</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Tổng Thu</span>
            </div>
            <p className="text-lg font-black tracking-tight">{totalIncome.toLocaleString('vi-VN')}</p>
         </div>
         <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-red-400">
                <TrendingDown className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Tổng Chi</span>
            </div>
            <p className="text-lg font-black tracking-tight">{totalExpense.toLocaleString('vi-VN')}</p>
         </div>
      </div>

      <div className={`relative overflow-hidden rounded-2xl p-5 text-center transition-all ${isProfitable ? 'bg-green-600' : 'bg-red-600'}`}>
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 h-20 w-20 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/20 blur-xl"></div>
         
         <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mb-1">
            {isProfitable ? 'Lợi Nhuận Ròng (LÃI)' : 'Thâm Hụt (LỖ)'}
         </p>
         <p className="relative z-10 text-3xl font-black tracking-tighter text-white">
            {profit.toLocaleString('vi-VN')} <span className="text-xs font-medium opacity-70">VNĐ</span>
         </p>
      </div>
    </div>
  );
};

export default SeasonReport;