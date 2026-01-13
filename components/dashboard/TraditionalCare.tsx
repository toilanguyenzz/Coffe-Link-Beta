
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [rainProbability] = useState<number>(80); 
  const isTrafficLightGreen = rainProbability < 60;

  return (
    <div className="space-y-6">
      {/* 1. VIVID WEATHER CARD (Red/Green Theme) */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-6 text-white shadow-2xl transition-all duration-500 ${
        isTrafficLightGreen 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200' 
          : 'bg-gradient-to-br from-[#EA580C] to-[#C2410C] shadow-orange-200'
      }`}>
        {/* Texture & blobs */}
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md border border-white/20">
                   {isTrafficLightGreen ? <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" /> : <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-300 animate-pulse" />}
                   {isTrafficLightGreen ? 'Đèn Xanh' : 'Đèn Đỏ'}
                </span>
              </div>
              
              <h2 className="text-3xl font-black tracking-tighter leading-none">
                {isTrafficLightGreen ? 'Thời Tiết Vàng' : 'Cảnh Báo Mưa'}
              </h2>
              
              <div className="mt-2 flex items-center text-xs font-medium text-white/90">
                {isTrafficLightGreen ? (
                  <>
                    <CloudSun className="mr-1.5 h-4 w-4" /> Nắng đẹp • 31°C
                  </>
                ) : (
                  <>
                    <CloudRain className="mr-1.5 h-4 w-4" /> Mưa lớn • Độ ẩm 92%
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
              {isTrafficLightGreen ? <CloudSun className="h-8 w-8 text-yellow-300" /> : <Zap className="h-8 w-8 text-yellow-300" />}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-4 backdrop-blur-md border border-white/10">
            <div className="flex items-start">
              {isTrafficLightGreen ? (
                <CheckCircle2 className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-emerald-200" />
              ) : (
                <AlertTriangle className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-white" />
              )}
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {isTrafficLightGreen ? 'Khuyến nghị: Bón phân ngay' : 'Tạm hoãn bón phân'}
                </p>
                <p className="mt-1 text-[10px] text-white/80 leading-relaxed">
                  {isTrafficLightGreen 
                    ? 'Đất đủ ẩm, rễ hấp thu mạnh nhất trong 24h tới.' 
                    : 'Tránh rửa trôi phân bón do mưa lớn.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GOM ĐƠN (Group Buy) - Bento Card Style */}
      {isTrafficLightGreen && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative overflow-hidden rounded-[2rem] bg-white p-1 shadow-xl shadow-orange-500/10 border border-orange-100">
              <div className="rounded-[1.7rem] bg-gradient-to-br from-orange-50 to-white p-5">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <Users className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-orange-700">Gom Đơn Giá Sỉ</span>
                     </div>
                     <span className="flex items-center text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                        <Timer className="mr-1 h-3 w-3" /> 14:00 kết thúc
                     </span>
                  </div>

                  <div className="flex gap-4">
                     <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-gray-100">
                        <PackageIcon />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-black text-gray-800 line-clamp-1">NPK Phú Mỹ 16-16-8</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Giá thị trường: <span className="line-through">850k</span></p>
                        <p className="text-lg font-black text-orange-600">820k <span className="text-[10px] font-medium text-gray-400">/bao</span></p>
                     </div>
                  </div>

                  <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>Đã gom: 45</span>
                          <span>Mục tiêu: 50</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full w-[90%] bg-gradient-to-r from-orange-500 to-red-500 rounded-full relative">
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={() => navigate('/market')}
                    className="mt-4 w-full rounded-xl bg-orange-600 py-3 text-xs font-black uppercase text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-700 active:scale-95"
                  >
                     Tham Gia Ngay
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* 3. DỊCH VỤ - Immersive Cards */}
      <div className="grid grid-cols-2 gap-3">
            <button className="group relative h-40 overflow-hidden rounded-[2rem] shadow-sm transition-all active:scale-95">
                <img 
                    src="https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=600&auto=format&fit=crop" 
                    alt="Nông dân" 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="mb-1 inline-flex rounded-lg bg-orange-500 p-1.5 text-white">
                        <UserCheck className="h-3 w-3" />
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-wide">Thuê Công</p>
                </div>
            </button>

            <button className="group relative h-40 overflow-hidden rounded-[2rem] shadow-sm transition-all active:scale-95">
                <img 
                    src="https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=600&auto=format&fit=crop" 
                    alt="Drone" 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="mb-1 inline-flex rounded-lg bg-blue-500 p-1.5 text-white">
                        <ScanLine className="h-3 w-3" />
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-wide">Thuê Drone</p>
                </div>
            </button>
      </div>

      {/* 4. MARKET PRICES & ALERTS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[2rem] bg-white p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase text-gray-400">Đạm (Ure)</p>
                <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <div>
                <p className="text-2xl font-black text-gray-800">540k</p>
                <p className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">Giảm nhẹ</p>
            </div>
        </div>
        <div className="rounded-[2rem] bg-white p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase text-gray-400">Kali</p>
                <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <div>
                <p className="text-2xl font-black text-gray-800">780k</p>
                <p className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block">+15k</p>
            </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-orange-50 p-5 border border-orange-100">
         <div className="flex items-center gap-2 mb-2 text-orange-800">
             <Bug className="h-4 w-4" />
             <h3 className="text-sm font-black uppercase tracking-wide">Cảnh Báo Sâu Bệnh</h3>
         </div>
         <p className="text-xs text-orange-700 leading-relaxed font-medium">
             Khu vực đang có dịch <span className="font-bold underline">Rệp Sáp</span> bùng phát. Hãy kiểm tra kỹ các cành non.
         </p>
      </div>
    </div>
  );
};

const PackageIcon = () => (
  <svg className="w-full h-full text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.5 4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export default TraditionalCare;
