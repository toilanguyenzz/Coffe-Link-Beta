import React, { useState } from 'react';
import { 
  CloudSun, 
  CloudRain, 
  Zap, 
  CheckCircle2, 
  Users, 
  Timer, 
  ArrowRight,
  AlertTriangle,
  UserCheck,
  ScanLine,
  FlaskConical,
  Bug,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

const TraditionalCare: React.FC = () => {
  // SIMULATION STATE: Giả lập xác suất mưa
  const [rainProbability] = useState<number>(80); 
  const isTrafficLightGreen = rainProbability < 60;

  return (
    <div className="space-y-5">
      {/* 1. TÍNH NĂNG: ĐÈN GIAO THÔNG BÓN PHÂN (TRAFFIC LIGHT) */}
      <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all duration-500 ${
        isTrafficLightGreen 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200' 
          : 'bg-gradient-to-br from-red-600 to-red-700 shadow-red-200'
      }`}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  isTrafficLightGreen ? 'bg-white text-emerald-700' : 'bg-white text-red-700'
                }`}>
                  {isTrafficLightGreen ? '🟢 Đèn Xanh' : '🔴 Đèn Đỏ'}
                </span>
                <span className="text-xs font-medium opacity-90">Hôm nay</span>
              </div>
              
              <h2 className="mt-2 text-3xl font-bold">
                {isTrafficLightGreen ? 'Thời Tiết Vàng' : 'Cảnh Báo Mưa'}
              </h2>
              
              <div className="mt-1 flex items-center text-sm font-medium opacity-90">
                {isTrafficLightGreen ? (
                  <>
                    <CloudSun className="mr-1.5 h-4 w-4" />
                    Nắng đẹp • Độ ẩm đất chuẩn
                  </>
                ) : (
                  <>
                    <CloudRain className="mr-1.5 h-4 w-4" />
                    Mưa lớn • Nguy cơ rửa trôi
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-white/20 p-2.5 backdrop-blur-md border border-white/20">
              {isTrafficLightGreen ? <CloudSun className="h-8 w-8" /> : <Zap className="h-8 w-8" />}
              <span className="mt-1 text-xs font-bold">31°C</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-black/20 p-3 backdrop-blur-md border border-white/10">
            <div className="flex items-start">
              {isTrafficLightGreen ? (
                <CheckCircle2 className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-emerald-200" />
              ) : (
                <AlertTriangle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-red-200" />
              )}
              <div>
                <p className="text-sm font-bold text-white">
                  {isTrafficLightGreen ? 'Khuyến nghị: Bón phân ngay' : 'Cảnh báo mưa lớn'}
                </p>
                <p className="mt-0.5 text-xs text-white/80 leading-relaxed">
                  {isTrafficLightGreen 
                    ? 'Đất đủ ẩm, rễ hấp thu mạnh nhất trong 24h tới. Hiệu quả tăng 30%.' 
                    : 'Không bón phân để tránh rửa trôi.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TÍNH NĂNG: GOM ĐƠN GIÁ SỈ (SMART SHOP) */}
      {isTrafficLightGreen && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between border-b border-orange-50 bg-orange-50/50 px-4 py-3">
                 <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-orange-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Gom Đơn Giá Sỉ</span>
                 </div>
                 <div className="flex items-center text-xs font-medium text-red-600 animate-pulse">
                    <Timer className="mr-1 h-3 w-3" />
                    Kết thúc: 14:00 chiều nay
                 </div>
              </div>

              <div className="flex p-4">
                 <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-50 p-2 border border-gray-100">
                    <PackageIcon />
                    <span className="mt-2 text-[10px] font-bold text-gray-500">Phân bón NPK</span>
                 </div>

                 <div className="ml-4 flex-1">
                    <div className="mb-1 flex items-start justify-between">
                       <h3 className="font-bold text-gray-900 line-clamp-1">NPK Phú Mỹ 16-16-8</h3>
                       <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">-20K/bao</span>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">Thời tiết đẹp, chốt đơn bón ngay!</p>
                    <div className="mt-3">
                       <div className="mb-1 flex justify-between text-[10px] font-medium">
                          <span className="text-orange-700">Đã có 45 bác đặt</span>
                          <span className="text-gray-400">Mục tiêu: 50</span>
                       </div>
                       <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-sm relative">
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <button className="group flex w-full items-center justify-center bg-gradient-to-r from-orange-600 to-red-600 py-3 text-sm font-bold text-white transition-all hover:from-orange-700 hover:to-red-700 active:scale-[0.98]">
                 <span>Tham Gia Gom Đơn Ngay</span>
                 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
           </div>
        </div>
      )}

      {/* 3. DỊCH VỤ NÔNG NGHIỆP */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-800">Dịch vụ Nông nghiệp</h3>
        <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center rounded-lg bg-orange-50 p-4 hover:bg-orange-100 transition-colors">
                <div className="mb-2 rounded-full bg-orange-200 p-2">
                    <UserCheck className="h-5 w-5 text-orange-700" />
                </div>
                <span className="text-sm font-medium text-orange-800">Thuê Nhân Công</span>
            </button>
            <button className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-4 hover:bg-blue-100 transition-colors">
                <div className="mb-2 rounded-full bg-blue-200 p-2">
                    <ScanLine className="h-5 w-5 text-blue-700" />
                </div>
                <span className="text-sm font-medium text-blue-800">Quét Vườn (Drone)</span>
            </button>
        </div>
      </div>

      {/* 4. GIÁ PHÂN BÓN & CẢNH BÁO SÂU BỆNH */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:border-green-200 transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">Đạm (Ure)</p>
                <TrendingDown className="h-3 w-3 text-green-500" />
            </div>
            <p className="mt-1 text-lg font-bold text-gray-800">540k</p>
            <p className="text-[10px] text-gray-400">Ổn định</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:border-red-200 transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">Kali</p>
                <TrendingUp className="h-3 w-3 text-red-500" />
            </div>
            <p className="mt-1 text-lg font-bold text-gray-800">780k</p>
            <p className="text-[10px] text-red-500">+15k hôm nay</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
         <h3 className="mb-3 flex items-center text-sm font-bold text-gray-800">
           <Bug className="mr-2 h-4 w-4 text-red-600" />
           Cảnh Báo Sâu Bệnh
        </h3>
        <div className="flex items-start rounded-lg bg-orange-50 p-3 border border-orange-100">
            <FlaskConical className="mt-0.5 mr-2 h-4 w-4 text-orange-600 shrink-0" />
            <div>
                <p className="text-sm font-bold text-gray-800">Rệp sáp bùng phát</p>
                <p className="text-xs text-gray-600 mt-1">
                   Khuyến nghị: Phun <span className="font-semibold text-orange-700">Motox 5EC</span> kèm dầu khoáng.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

const PackageIcon = () => (
  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.5 4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export default TraditionalCare;