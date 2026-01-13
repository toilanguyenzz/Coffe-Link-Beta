
import React, { useState } from 'react';
import BottomNav from '../components/layout/BottomNav';
import { agriServices } from '../data/shopData';
import { ShoppingBag, Timer, Users, ArrowRight, MapPin, Star, Zap, Loader2, Sparkles } from 'lucide-react';
import { useMarketplace } from '../hooks/useMarketplace';

const Marketplace: React.FC = () => {
  const { deals, loading, reserveSlot } = useMarketplace();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReserve = async (dealId: string) => {
    setProcessingId(dealId);
    try {
        await reserveSlot(dealId);
        alert("🎉 Chúc mừng! Bác đã giữ suất thành công.");
    } catch (error: any) {
        alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 px-6 pt-12 pb-10 text-white rounded-b-[2.5rem] shadow-xl">
        <div className="mx-auto max-w-xl">
            <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Chợ Nhà Nông</h1>
                <p className="text-sm font-medium text-green-100 opacity-90">Sàn vật tư & Dịch vụ nông nghiệp</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 flex gap-4">
                <div className="flex-1 rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-green-200">Đang gom đơn</p>
                    <p className="text-xl font-black">{deals.length > 0 ? deals.length : '...'}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-green-200">Dịch vụ quanh đây</p>
                    <p className="text-xl font-black">12</p>
                </div>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5 -mt-6">
        {/* SECTION A: SĂN DEAL GOM ĐƠN */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                    <Zap className="h-3.5 w-3.5 text-orange-600 fill-orange-600" />
                </span>
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">Săn Deal Gom Đơn</h2>
                <span className="ml-auto text-[10px] font-bold text-gray-400">Kết thúc 17:00</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : deals.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-gray-400 text-sm font-medium">Chưa có deal nào hôm nay.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {deals.map((deal) => {
                        const progress = Math.min((deal.currentQuantity / deal.maxQuantity) * 100, 100);
                        const remaining = deal.maxQuantity - deal.currentQuantity;
                        const isSoldOut = remaining <= 0;
                        const discount = deal.originalPrice > 0 
                            ? (100 - (deal.price / deal.originalPrice * 100)).toFixed(0) 
                            : '0';
                        
                        return (
                            <div key={deal.id} className={`relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] border transition-all ${deal.isPromoted ? 'border-yellow-200 ring-4 ring-yellow-50' : 'border-gray-100'}`}>
                                 {/* Promoted Badge */}
                                 {deal.isPromoted && (
                                     <div className="absolute top-0 left-0 bg-yellow-400 px-3 py-1.5 rounded-br-2xl z-10 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-yellow-900 fill-yellow-900" />
                                        <span className="text-[9px] font-black uppercase text-yellow-900 tracking-wide">Tài Trợ</span>
                                     </div>
                                 )}

                                 {/* Deal Badge */}
                                <div className="absolute top-0 right-0 rounded-bl-2xl bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-sm">
                                    -{discount}%
                                </div>

                                <div className="flex gap-4 mt-2">
                                    {/* Placeholder Image */}
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gray-50 p-2">
                                         <ShoppingBag className="h-8 w-8 text-green-600 opacity-50" />
                                    </div>

                                    <div className="flex-1 pt-1">
                                        {/* Fallback nếu không có brand */}
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{deal.brand || 'CoffeeLink'}</p>
                                        <h3 className="text-sm font-black text-gray-900 leading-tight">{deal.title}</h3>
                                        
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="text-lg font-black text-red-600">
                                                {(deal.price / 1000).toFixed(0)}k
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 line-through decoration-gray-400">
                                                {(deal.originalPrice / 1000).toFixed(0)}k
                                            </span>
                                            {deal.unit && (
                                                <span className="text-[10px] font-medium text-gray-400">/{deal.unit}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                                        <div className="flex items-center text-orange-600">
                                            <Users className="mr-1 h-3 w-3" />
                                            <span>Đã gom: {deal.currentQuantity}/{deal.maxQuantity}</span>
                                        </div>
                                        <div className={`flex items-center ${isSoldOut ? 'text-gray-400' : 'text-red-500 animate-pulse'}`}>
                                            <Timer className="mr-1 h-3 w-3" />
                                            <span>{isSoldOut ? 'Đã hết suất' : `Chỉ còn ${remaining} suất!`}</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 relative ${isSoldOut ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                                            style={{ width: `${progress}%` }}
                                        >
                                            {!isSoldOut && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleReserve(deal.id)}
                                    disabled={isSoldOut || processingId === deal.id}
                                    className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 text-xs font-black uppercase text-white shadow-lg transition-transform active:scale-95 ${
                                        isSoldOut 
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                        : 'bg-green-700 shadow-green-200'
                                    }`}
                                >
                                    {processingId === deal.id ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
                                    ) : isSoldOut ? (
                                        'Đã Hết Suất'
                                    ) : (
                                        <>Giữ suất ngay <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* SECTION B: TRẠM DỊCH VỤ (AGRI-UBER) */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">Trạm Dịch Vụ</h2>
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Xem bản đồ</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {agriServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-[1.8rem] bg-white p-4 shadow-sm border border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${service.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                    <Zap className="h-6 w-6" />
                                </div>
                                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${service.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-black text-gray-800">{service.name}</h3>
                                <p className="text-[11px] font-bold text-gray-500">{service.provider}</p>
                                <div className="mt-1 flex items-center gap-2 text-[10px]">
                                    <span className="flex items-center text-yellow-500 font-black">
                                        <Star className="mr-0.5 h-3 w-3 fill-current" /> {service.rating}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                    <span className="text-gray-400 font-medium">Cách {service.distance}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-black text-green-700">{service.price}</span>
                            <button 
                                disabled={service.status === 'busy'}
                                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    service.status === 'available' 
                                    ? 'bg-blue-600 text-white shadow-md active:scale-95' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {service.status === 'available' ? 'Gọi Ngay' : 'Đang bận'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Marketplace;
