import React, { useState } from 'react';
import { Calendar, Calculator, Save, ChevronDown, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
}

interface DailyLedgerProps {
  onSave: (transaction: Transaction) => void;
}

const CATEGORIES = {
  expense: ["Phân bón", "Thuốc BVTV", "Nhân công", "Xăng dầu", "Điện nước", "Khác"],
  income: ["Bán Cà phê", "Bán Hồ tiêu", "Bán Sầu riêng", "Xen canh", "Khác"]
};

const DailyLedger: React.FC<DailyLedgerProps> = ({ onSave }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(CATEGORIES.expense[0]);
  const [amountStr, setAmountStr] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  
  // State cho chế độ xem lại (Review Mode)
  const [isReviewing, setIsReviewing] = useState(false);
  const [parsedAmount, setParsedAmount] = useState<number>(0);

  // Smart Calculator Logic
  const calculateValue = (str: string): number => {
    try {
      if (!str || !/[0-9+\-*/.]/.test(str)) return 0;
      // eslint-disable-next-line no-eval
      const result = eval(str.replace(/[^0-9+\-*/.]/g, ''));
      if (!isNaN(result) && isFinite(result)) {
        return Math.floor(result);
      }
    } catch (error) {
      return 0;
    }
    return 0;
  };

  const handleCalculate = () => {
    const result = calculateValue(amountStr);
    if (result > 0) {
      setAmountStr(result.toString());
      setIsCalculating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isReviewing) {
        handleConfirmSave();
      } else {
        handleNextStep();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountStr(val);
    if (/[\+\-\*\/]/.test(val)) {
        setIsCalculating(true);
    } else {
        setIsCalculating(false);
    }
  };

  // Bước 1: Chuyển sang chế độ xem lại
  const handleNextStep = () => {
    let finalAmount = calculateValue(amountStr);
    
    // Fallback nếu người dùng nhập số thường
    if (finalAmount === 0) {
        finalAmount = parseFloat(amountStr.replace(/,/g, ''));
    }

    if (!finalAmount || finalAmount <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ");
        return;
    }

    setParsedAmount(finalAmount);
    setAmountStr(finalAmount.toString()); // Cập nhật lại input hiển thị số đã tính
    setIsReviewing(true);
  };

  // Nút Back: Quay lại sửa
  const handleBack = () => {
    setIsReviewing(false);
  };

  // Nút Lưu: Thực hiện lưu thật
  const handleConfirmSave = () => {
    const newTransaction: Transaction = {
      id: Date.now(),
      date,
      type,
      category,
      amount: parsedAmount,
      note
    };

    onSave(newTransaction);
    
    // Reset form
    setAmountStr("");
    setNote("");
    setIsReviewing(false);
  };

  const activeColor = type === 'expense' ? 'bg-red-500 shadow-red-200' : 'bg-green-600 shadow-green-200';
  const activeText = type === 'expense' ? 'text-red-600' : 'text-green-600';
  const activeLight = type === 'expense' ? 'bg-red-50' : 'bg-green-50';

  // ---------------- RENDER: REVIEW MODE ----------------
  if (isReviewing) {
    return (
        <div className="rounded-[2.5rem] bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Xác nhận giao dịch</p>
                <p className={`text-3xl font-black tracking-tighter ${activeText}`}>
                    {parsedAmount.toLocaleString('vi-VN')} <span className="text-sm font-bold text-gray-400">VNĐ</span>
                </p>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Loại:</span>
                    <span className={`font-bold uppercase ${activeText}`}>
                        {type === 'expense' ? 'Khoản Chi 🔴' : 'Khoản Thu 🟢'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Danh mục:</span>
                    <span className="font-bold text-gray-800">{category}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Ngày:</span>
                    <span className="font-bold text-gray-800">{date}</span>
                </div>
                {note && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Ghi chú:</span>
                        <span className="font-bold text-gray-800 text-right max-w-[60%]">{note}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center rounded-2xl py-3 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </button>
                <button 
                    onClick={handleConfirmSave}
                    className={`flex-1 flex items-center justify-center rounded-2xl py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 ${activeColor}`}
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Lưu ngay
                </button>
            </div>
        </div>
    );
  }

  // ---------------- RENDER: INPUT MODE ----------------
  return (
    <div className="rounded-[2.5rem] bg-white p-6 shadow-xl border border-gray-100">
      {/* 1. Toggle Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-1.5 mb-6">
        <button
          onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
          className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            type === 'expense' ? 'bg-white text-red-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Khoản Chi 🔴
        </button>
        <button
          onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
          className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            type === 'income' ? 'bg-white text-green-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Khoản Thu 🟢
        </button>
      </div>

      {/* 2. Input Form */}
      <div className="space-y-4">
        {/* Date & Category Row */}
        <div className="flex gap-3">
            <div className="relative w-1/3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50 py-3 pl-9 pr-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-gray-200 border-none"
                />
            </div>
            <div className="relative w-2/3">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-2xl bg-gray-50 py-3 pl-4 pr-8 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-gray-200 border-none"
                >
                    {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
        </div>

        {/* Smart Amount Input */}
        <div className="relative">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Số tiền (Nhập phép tính: 5*820)
            </label>
            <div className="relative">
                <input 
                    type="text" 
                    value={amountStr}
                    onChange={handleInputChange}
                    onBlur={handleCalculate}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    className={`w-full rounded-2xl border-none px-4 py-4 text-2xl font-black focus:ring-2 ${activeLight} ${activeText} ${isCalculating ? 'ring-2 ring-blue-300' : ''}`}
                />
                <button 
                    onClick={handleCalculate}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all ${isCalculating ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}
                >
                    <Calculator className="h-5 w-5" />
                </button>
            </div>
            {isCalculating && (
                <p className="mt-1 text-[10px] text-blue-500 font-bold italic text-right">Nhấn Enter để tính...</p>
            )}
        </div>

        {/* Note */}
        <div>
            <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (VD: Mua chịu nhà Năm Hùng)..."
                className="w-full rounded-2xl bg-gray-50 py-3.5 px-4 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-gray-200 border-none"
            />
        </div>

        {/* Continue Button */}
        <button 
            onClick={handleNextStep}
            className={`flex w-full items-center justify-center rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${activeColor}`}
        >
            Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DailyLedger;