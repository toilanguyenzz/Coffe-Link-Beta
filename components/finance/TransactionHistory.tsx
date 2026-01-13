
import React from 'react';
import { Transaction } from './DailyLedger';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Receipt, Trash2 } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDelete?: (id: string | number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onDelete }) => {
  // Group transactions by Month
  const grouped = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const key = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort months descending (newest first)
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
     // Simple hacky sort for "Tháng M/YYYY" string
     // Better way would be to convert to Date object, but this works for simple "Tháng M"
     const [mA, yA] = a.replace('Tháng ', '').split('/').map(Number);
     const [mB, yB] = b.replace('Tháng ', '').split('/').map(Number);
     if (yA !== yB) return yB - yA;
     return mB - mA;
  });

  return (
    <div className="space-y-6">
      {sortedKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <Receipt className="h-12 w-12 text-gray-300 mb-2" />
             <p className="text-xs font-bold text-gray-400">Chưa có giao dịch nào</p>
          </div>
      ) : (
          sortedKeys.map(month => (
            <div key={month} className="animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 mb-3 px-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">{month}</h3>
              </div>
              
              <div className="space-y-3">
                {grouped[month]
                  // Sort by Date inside the month
                  .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(t => (
                  <div key={t.id} className="group relative flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-50 transition-all hover:shadow-md">
                     {/* Icon Box */}
                    <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            t.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                        }`}>
                            {t.type === 'expense' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-800">{t.category}</p>
                            <p className="text-[10px] font-medium text-gray-400 line-clamp-1">
                                {new Date(t.date).getDate()} thg {new Date(t.date).getMonth()+1} • {t.note || 'Không có ghi chú'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className={`text-sm font-black ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                {t.type === 'expense' ? '-' : '+'}{(t.amount).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-[9px] font-bold text-gray-300">VNĐ</p>
                        </div>
                        
                        {onDelete && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(t.id);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-red-100 hover:text-red-500 active:scale-90"
                                title="Xóa giao dịch"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default TransactionHistory;
