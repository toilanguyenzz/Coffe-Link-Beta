import React, { useState } from 'react';
import { TrendingUp, Store, Phone, MapPin, Truck, Warehouse, Sun, Star, ChevronRight } from 'lucide-react';
import PriceCalculator from '../tools/PriceCalculator';

interface Trader {
  id: number;
  name: string;
  address: string;
  isGoodPrice: boolean;
  rating: number;
  priceDiff: string;
}

const TraditionalHarvest: React.FC = () => {
  const [traders, setTraders] = useState<Trader[]>([
    { id: 1, name: "Đại lý Năm Hùng", address: "Km 12, QL27, Cư Kuin", isGoodPrice: true, rating: 4, priceDiff: "+500₫" },
    { id: 2, name: "Vựa Cà phê Bảy Sánh", address: "Thôn 4, Hòa Thắng", isGoodPrice: false, rating: 3, priceDiff: "Thị trường" },
  ]);

  const handleRate = (traderId: number, newRating: number) => {
    setTraders(prev => prev.map(t => t.id === traderId ? { ...t, rating: newRating } : t));
  };

  return (
     <div className="space-y-6 pb-10">
        {/* Market Price Board - Fintech Style */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <TrendingUp className="h-24 w-24 text-gray-900" />
            </div>
            
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Niêm yết giá cà phê</h3>
            
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-gray-400">Robusta (Nhân xô)</p>
                    <div className="mt-2">
                        <span className="text-3xl font-black text-orange-600 tracking-tighter">81.200</span>
                    </div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                         <TrendingUp className="mr-0.5 h-3 w-3" /> +200₫
                    </div>
                </div>
                
                <div className="h-12 w-[1px] bg-gray-100"></div>
                
                <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-gray-400">Tươi (Tại vườn)</p>
                    <div className="mt-2">
                        <span className="text-3xl font-black text-gray-800 tracking-tighter">18.500</span>
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                         Ổn định
                    </div>
                </div>
            </div>
            <p className="mt-6 text-center text-[9px] font-medium text-gray-300 italic tracking-wide">Cập nhật: 08:30 • Đắk Lắk</p>
        </div>

        {/* Calculator Section */}
        <PriceCalculator />

        {/* Seasons Services Horizontal Scroller */}
        <div>
            <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dịch vụ mùa vụ</h3>
                <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                {[
                  { icon: Truck, label: "Tìm Xe Tải", color: "orange" },
                  { icon: Warehouse, label: "Thuê Kho", color: "blue" },
                  { icon: Sun, label: "Giám Sát Phơi", color: "yellow" }
                ].map((service, idx) => (
                  <button key={idx} className={`flex min-w-[120px] flex-col items-center justify-center rounded-[2rem] bg-white p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-50 transition-all hover:shadow-lg active:scale-95`}>
                      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-${service.color}-50 text-${service.color}-600`}>
                          <service.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tighter text-gray-800">{service.label}</span>
                  </button>
                ))}
            </div>
        </div>

        {/* Trader List - Premium Style */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đại lý tin cậy</h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-orange-600">Mở bản đồ</button>
            </div>
            
            <div className="space-y-3">
                {traders.map((trader) => (
                    <div key={trader.id} className="group relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-50 transition-all hover:shadow-xl">
                        <div className="flex items-start justify-between">
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${trader.isGoodPrice ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>
                                        <Store className="h-4 w-4" />
                                    </div>
                                    <span className="font-black text-sm text-gray-800 tracking-tight">{trader.name}</span>
                                    {trader.isGoodPrice && (
                                        <span className="rounded-full bg-green-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">Giá cao</span>
                                    )}
                                </div>
                                
                                {/* Refined Rating UI */}
                                <div className="flex items-center space-x-1.5 ml-10">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            onClick={() => handleRate(trader.id, star)}
                                            className="focus:outline-none transition-all active:scale-150"
                                        >
                                            <Star 
                                                className={`h-4 w-4 transition-colors ${star <= trader.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-100'}`} 
                                            />
                                        </button>
                                    ))}
                                    <span className="text-[10px] font-black text-gray-300 ml-1 italic">{trader.rating}/5</span>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className={`text-xs font-black ${trader.isGoodPrice ? 'text-green-600' : 'text-gray-400'}`}>
                                    {trader.priceDiff}
                                </span>
                             </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex flex-1 items-center rounded-2xl bg-gray-50 px-4 py-3">
                                <MapPin className="mr-2 h-4 w-4 text-gray-300" />
                                <span className="text-xs font-bold text-gray-500 truncate">{trader.address}</span>
                            </div>
                            <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-90 transition-all">
                                <Phone className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
     </div>
  )
}

export default TraditionalHarvest;