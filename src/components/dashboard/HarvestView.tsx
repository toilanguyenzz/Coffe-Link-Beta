import React, { useState } from 'react';
import { Truck, Warehouse, Sun, BadgeCheck, ChevronRight, Phone, Star, MapPin, ScanLine, Droplets } from 'lucide-react';
import PriceCalculator from '../tools/PriceCalculator';
import SimplePriceForecast from '../features/SimplePriceForecast';
import MoistureScannerModal from '../modals/MoistureScannerModal';

const HarvestView: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      
      {/* 0. NEW FEATURE: MOISTURE SCANNER BANNER */}
      <div 
        onClick={() => setIsScannerOpen(true)}
        className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-1 shadow-xl shadow-blue-200 cursor-pointer active:scale-95 transition-transform"
      >
         <div className="rounded-[2.3rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 right-0 h-32 w-32 translate-x-10 -translate-y-10 bg-white/10 rounded-full blur-2xl"></div>
             
             <div className="flex items-center gap-4 relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                     <ScanLine className="h-7 w-7 text-white animate-pulse" />
                 </div>
                 <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Mới</span>
                        <h3 className="text-white font-black text-sm uppercase tracking-wide">Soi Độ Ẩm AI</h3>
                     </div>
                     <p className="text-blue-100 text-xs font-medium">Chụp ảnh hạt để định giá chuẩn</p>
                 </div>
             </div>
             <div className="h-10 w-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg">
                 <Droplets className="h-5 w-5 fill-current" />
             </div>
         </div>
      </div>

      {/* 1. PRICE FORECAST */}
      <SimplePriceForecast />

      {/* 2. SMART CALCULATOR (ID for scrolling) */}
      <div id="price-calculator">
        <PriceCalculator />
      </div>

      {/* 3. LOGISTICS SERVICES */}
      <div>
        <div className="flex items-center justify-between px-2 mb-4">
             <h3 className="text-lg font-bold text-gray-800">Dịch vụ Mùa vụ</h3>
             <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"><ChevronRight className="h-4 w-4 text-gray-500" /></button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 px-2 no-scrollbar">
            {[
                { 
                  icon: Truck, 
                  label: "Tìm Xe Tải", 
                  image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop",
                  color: "orange"
                },
                { 
                  icon: Warehouse, 
                  label: "Thuê Kho", 
                  image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop",
                  color: "blue"
                },
                { 
                  icon: Sun, 
                  label: "Sân Phơi", 
                  image: "https://images.unsplash.com/photo-1621961458348-f013d182b6a2?q=80&w=400&auto=format&fit=crop",
                  color: "yellow"
                }
            ].map((s, i) => (
                <button key={i} className="group relative h-48 w-36 shrink-0 overflow-hidden rounded-[2.5rem] shadow-lg transition-all active:scale-95">
                    <img 
                      src={s.image} 
                      alt={s.label}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    <div className="relative z-10 flex h-full flex-col items-center justify-end p-4 pb-6">
                        <div className="mb-2 rounded-2xl bg-white/20 p-2.5 backdrop-blur-md border border-white/20 shadow-sm">
                            <s.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase text-white tracking-wider text-center leading-tight">{s.label}</span>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* 4. TRADER CONNECT (Unified List) */}
      <div className="rounded-[2.5rem] bg-white p-6 shadow-xl border border-gray-100">
        <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Đối tác thu mua</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Toàn bộ</span>
        </div>

        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start justify-between group p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="relative h-12 w-12 shrink-0 rounded-2xl bg-gray-100 overflow-hidden">
                            <img 
                                src={`https://randomuser.me/api/portraits/men/${i+30}.jpg`} 
                                alt="Trader" 
                                className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            />
                            {/* Badges logic */}
                            {i === 1 && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>}
                        </div>

                        {/* Info */}
                        <div>
                            <p className="text-sm font-black text-gray-900 leading-tight">
                                {i === 1 ? 'Công ty Đại Ngàn' : i === 2 ? 'Đại lý Năm Hùng' : 'Kho Cà Phê 47'}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                <MapPin className="h-3 w-3" /> Cách {i * 2}km • <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> 4.{9-i}
                            </div>
                            
                            {/* Tags */}
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {i === 1 && (
                                    <span className="flex items-center text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                        <BadgeCheck className="mr-1 h-3 w-3" /> Organic
                                    </span>
                                )}
                                {i === 2 && (
                                    <span className="flex items-center text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                                        Giá Cao
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95">
                        <Phone className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
        
        <button className="mt-6 w-full py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 border-t border-gray-100 transition-colors">
            Xem bản đồ đại lý
        </button>
      </div>

      {/* SCANNER MODAL */}
      <MoistureScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />
    </div>
  );
};

export default HarvestView;