import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Info } from 'lucide-react';

const PriceCalculator: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number>(82500);
  const [moisture, setMoisture] = useState<number>(15.0);
  const [impurities, setImpurities] = useState<number>(1.0);
  const [blackBroken, setBlackBroken] = useState<number>(2.0);
  const [finalPrice, setFinalPrice] = useState<number>(0);

  useEffect(() => {
    let penalty = 0;
    if (moisture > 15) penalty += (moisture - 15) * 1.5;
    penalty += impurities;
    penalty += blackBroken * 0.5;
    const calculated = basePrice * (1 - (penalty / 100));
    setFinalPrice(Math.floor(calculated));
  }, [basePrice, moisture, impurities, blackBroken]);

  return (
    <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
      <div className="bg-[#F8FAFC] px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="flex items-center text-[11px] font-black uppercase tracking-widest text-gray-800">
          <Calculator className="mr-2 h-4 w-4 text-blue-600" />
          Máy tính giá chốt
        </h3>
        <Info className="h-4 w-4 text-gray-300" />
      </div>
      
      <div className="p-7">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Giá thị trường (VNĐ/kg)</label>
            <div className="relative">
                <input 
                type="number" 
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full rounded-2xl bg-gray-50 border-none px-5 py-4 text-xl font-black text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₫</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Độ ẩm (%)</label>
                <input 
                type="number" 
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className={`w-full rounded-2xl border-none px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500 ${moisture > 15 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-800'}`}
                />
            </div>
            <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Tạp chất (%)</label>
                <input 
                type="number" 
                step="0.1"
                value={impurities}
                onChange={(e) => setImpurities(Number(e.target.value))}
                className="w-full rounded-2xl bg-gray-50 border-none px-4 py-3 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-center text-white shadow-xl shadow-blue-200">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Giá chốt thực nhận</p>
            <p className="mt-3 text-4xl font-black tracking-tighter">
              {finalPrice.toLocaleString('vi-VN')}
              <span className="ml-1 text-sm font-bold opacity-60">₫/kg</span>
            </p>
            {moisture > 15 && (
               <div className="mt-4 flex items-center justify-center rounded-full bg-black/20 py-1.5 px-4 text-[9px] font-black uppercase tracking-widest text-yellow-200 border border-white/10">
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                  Bị trừ do độ ẩm cao
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;