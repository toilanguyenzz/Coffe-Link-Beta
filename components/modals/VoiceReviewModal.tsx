
import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  Wallet, 
  CalendarClock, 
  Edit3,
  ArrowRightLeft
} from 'lucide-react';
import { VoiceCommandResult } from '../../hooks/useSmartVoiceProcessor';

interface VoiceReviewModalProps {
  isOpen: boolean;
  initialData: VoiceCommandResult | null;
  onClose: () => void;
  onConfirm: (data: FinalReviewData) => void;
}

export interface FinalReviewData {
  title: string;
  note: string;
  amount: number;
  isFinancialRecord: boolean;
  transactionType: 'income' | 'expense';
  category: string;
}

const VoiceReviewModal: React.FC<VoiceReviewModalProps> = ({ isOpen, initialData, onClose, onConfirm }) => {
  // --- STATE ---
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState<string>('0');
  const [isFinancialRecord, setIsFinancialRecord] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');

  // --- INITIALIZE STATE FROM AI DATA ---
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.parsedData.title);
      setNote(initialData.originalText); // Giữ nguyên câu nói gốc làm ghi chú
      setAmount(initialData.parsedData.amount.toString());
      setCategory(initialData.parsedData.category);
      
      // Smart Toggle Logic
      const hasMoney = initialData.parsedData.amount > 0;
      const isTransaction = initialData.detectedAction !== 'LOG_ONLY';
      
      setIsFinancialRecord(hasMoney && isTransaction);
      
      if (initialData.detectedAction === 'INCOME') setTransactionType('income');
      else setTransactionType('expense');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onConfirm({
      title,
      note,
      amount: parseInt(amount.replace(/,/g, '')) || 0,
      isFinancialRecord,
      transactionType,
      category
    });
  };

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, '')) || 0;
    return num.toLocaleString('vi-VN');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value.replace(/\D/g, ''));
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#F8FAFC] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
            <div>
                <h3 className="text-lg font-black text-gray-800">Xác nhận thông tin</h3>
                <p className="text-[10px] text-gray-400 font-medium">Kiểm tra lại trước khi lưu</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
            
            {/* SECTION 1: DIARY LOG */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <CalendarClock className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Nhật Ký Canh Tác</span>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Công việc / Hoạt động</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                            />
                            <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Chi tiết (Câu nói gốc)</label>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-green-500 outline-none shadow-sm resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="h-px w-full bg-gray-200 border-t border-dashed border-gray-300"></div>

            {/* SECTION 2: FINANCE TOGGLE (CRITICAL LOGIC) */}
            <div className={`rounded-2xl border-2 transition-all duration-300 p-5 ${isFinancialRecord ? (transactionType === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'bg-gray-50 border-gray-100'}`}>
                
                {/* 2.1 The Switch */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isFinancialRecord ? 'bg-white shadow-sm' : 'bg-gray-200'}`}>
                            <Wallet className={`h-5 w-5 ${isFinancialRecord ? (transactionType === 'income' ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-800">Ghi sổ Thu/Chi?</p>
                            <p className="text-[10px] text-gray-500 font-medium">Tự động trừ/cộng tiền trong ví</p>
                        </div>
                    </div>
                    
                    {/* Custom Toggle Switch */}
                    <button 
                        onClick={() => setIsFinancialRecord(!isFinancialRecord)}
                        className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none ${isFinancialRecord ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${isFinancialRecord ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {/* 2.2 Financial Details (Conditional) */}
                {isFinancialRecord && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        {/* Type Selector */}
                        <div className="flex bg-white/50 p-1 rounded-xl">
                            <button 
                                onClick={() => setTransactionType('expense')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${transactionType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Khoản Chi 🔴
                            </button>
                            <button 
                                onClick={() => setTransactionType('income')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${transactionType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Khoản Thu 🟢
                            </button>
                        </div>

                        {/* Amount Input */}
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Số tiền thực tế</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={formatCurrency(amount)}
                                    onChange={handleAmountChange}
                                    className={`w-full bg-white border-none rounded-xl pl-4 pr-12 py-3 text-xl font-black focus:ring-2 outline-none shadow-sm ${transactionType === 'income' ? 'text-green-600 focus:ring-green-200' : 'text-red-600 focus:ring-red-200'}`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">VNĐ</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>

        {/* FOOTER */}
        <div className="bg-white p-4 border-t border-gray-100 flex gap-3 sticky bottom-0">
            <button 
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
                Hủy bỏ
            </button>
            <button 
                onClick={handleSave}
                className="flex-[2] py-3.5 rounded-xl bg-green-600 text-white text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
                <CheckCircle2 className="h-4 w-4" /> Lưu Tất Cả
            </button>
        </div>

      </div>
    </div>
  );
};

export default VoiceReviewModal;
