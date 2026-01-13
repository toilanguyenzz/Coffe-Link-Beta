
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { IntercroppingTree } from '../../types';
import { Leaf, Plus, TreePine, Trees, Sprout, TrendingUp, X, Loader2 } from 'lucide-react';

const CarbonWallet: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [treeType, setTreeType] = useState<IntercroppingTree['type']>('Coffee');
  const [count, setCount] = useState<string>('');
  const [year, setYear] = useState<string>('2022');

  const trees = userProfile?.intercropping || [];

  // Carbon Calculation Constants (Estimated kg CO2/tree/year)
  const CO2_FACTORS = {
    'Coffee': 15, // Cà phê hấp thụ thấp hơn cây ăn trái lớn
    'Durian': 50,
    'Avocado': 30,
    'Cassia': 40,
    'Pepper': 15,
    'Other': 20
  };

  const CARBON_PRICE_PER_TON = 500000; // VNĐ

  // Calculate Total Asset
  const totalTrees = trees.reduce((sum, t) => sum + t.count, 0);
  const estimatedCO2 = trees.reduce((sum, t) => {
    const factor = CO2_FACTORS[t.type] || 20;
    // Simplified logic: Annual sequestration * count. In real app, consider biomass growth curve.
    return sum + (factor * t.count); 
  }, 0);
  
  // Projected Value for 2027 (3 years from now)
  const projectedCO2_2027 = estimatedCO2 * 3; 
  const projectedValue = (projectedCO2_2027 / 1000) * CARBON_PRICE_PER_TON;

  const handleAddTree = async () => {
    if (!currentUser || !count) return;
    setLoading(true);
    try {
      const newTree: IntercroppingTree = {
        id: Date.now().toString(),
        type: treeType,
        name: treeType === 'Coffee' ? 'Cà phê' : treeType === 'Durian' ? 'Sầu riêng' : treeType === 'Avocado' ? 'Bơ' : 'Khác',
        count: parseInt(count),
        plantYear: parseInt(year)
      };

      const updatedList = [...trees, newTree];
      await updateDoc(doc(db, 'users', currentUser.uid), {
        intercropping: updatedList
      });

      await refreshProfile();
      setIsAdding(false);
      setCount('');
    } catch (e) {
      console.error(e);
      alert("Lỗi khi thêm cây.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] bg-gradient-to-br from-teal-800 to-green-900 p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decor */}
      <div className="absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                 <Leaf className="h-5 w-5 text-teal-200" />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest">Ví Carbon</h3>
                 <p className="text-[10px] text-teal-200">Tài sản tương lai (2027)</p>
              </div>
           </div>
           <button 
             onClick={() => setIsAdding(true)}
             className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal-900 hover:bg-teal-50"
           >
             <Plus className="h-5 w-5" />
           </button>
        </div>

        {/* Big Number */}
        <div className="mb-6">
           <p className="text-[10px] font-bold uppercase tracking-widest text-teal-200/70 mb-1">Giá trị quy đổi dự kiến</p>
           <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tighter">
                {projectedValue > 0 ? projectedValue.toLocaleString('vi-VN') : '0'}
              </span>
              <span className="text-xs font-bold text-teal-200">VNĐ</span>
           </div>
           <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-[10px] font-medium backdrop-blur-sm border border-white/10">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span>Dựa trên {totalTrees} cây & khả năng hấp thụ {Math.round(projectedCO2_2027/1000)} tấn CO2</span>
           </div>
        </div>

        {/* Tree List Preview */}
        {trees.length > 0 ? (
           <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {trees.map(t => (
                 <div key={t.id} className="flex min-w-[100px] flex-col items-center justify-center rounded-2xl bg-white/10 p-3 border border-white/10 backdrop-blur-sm">
                    {t.type === 'Durian' ? <TreePine className="h-5 w-5 text-yellow-200 mb-1" /> : 
                     t.type === 'Coffee' ? <Sprout className="h-5 w-5 text-orange-200 mb-1" /> :
                     <Trees className="h-5 w-5 text-green-200 mb-1" />}
                    <span className="text-xs font-bold">{t.name}</span>
                    <span className="text-[10px] text-white/70">x{t.count}</span>
                 </div>
              ))}
           </div>
        ) : (
           <div className="rounded-2xl bg-white/5 p-4 text-center border border-white/5 border-dashed">
              <p className="text-xs text-teal-200/70">Chưa có cây nào. Thêm ngay để tích lũy tín chỉ!</p>
           </div>
        )}
      </div>

      {/* Add Tree Modal */}
      {isAdding && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="w-full bg-white rounded-3xl p-5 text-gray-800 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-sm font-black uppercase text-gray-700">Khai báo cây trồng</h4>
                 <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-red-500"><X className="h-5 w-5"/></button>
              </div>
              
              <div className="space-y-3">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Loại cây</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                       {['Coffee', 'Avocado', 'Durian'].map((t) => (
                          <button 
                            key={t}
                            onClick={() => setTreeType(t as any)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${treeType === t ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                          >
                             {t === 'Coffee' ? 'Cà phê' : t === 'Avocado' ? 'Bơ' : 'Sầu riêng'}
                          </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Số lượng</label>
                        <input 
                            type="number" 
                            value={count} 
                            onChange={e => setCount(e.target.value)}
                            className="w-full mt-1 bg-gray-50 rounded-xl px-3 py-2 text-sm font-bold border-none focus:ring-2 focus:ring-green-500"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Năm trồng</label>
                        <input 
                            type="number" 
                            value={year} 
                            onChange={e => setYear(e.target.value)}
                            className="w-full mt-1 bg-gray-50 rounded-xl px-3 py-2 text-sm font-bold border-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                 </div>

                 <button 
                    onClick={handleAddTree}
                    disabled={loading}
                    className="w-full mt-2 bg-green-700 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg active:scale-95"
                 >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto"/> : 'Lưu vào ví'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CarbonWallet;
