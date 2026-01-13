
import React from 'react';
import { TrendingUp, TrendingDown, Bot, LineChart, ArrowUpRight, ArrowDownRight, BadgeCent } from 'lucide-react';

const SimplePriceForecast: React.FC = () => {
  // Mock Data: Prices for last 5 days + Today + Next 3 days
  // Sequence: D-4, D-3, D-2, D-1, Today, F+1, F+2, F+3
  const prices = [81000, 81500, 81200, 82000, 82500, 82800, 83500, 83200];
  const todayIndex = 4; // 82500

  // Chart Dimensions
  const width = 340;
  const height = 120;
  const padding = 10;

  // Normalize data for SVG
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * (width - 2 * padding) + padding;
    const y = height - ((price - minPrice) / range) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  });

  // Split paths
  const historyPoints = points.slice(0, todayIndex + 1).join(' ');
  const forecastPoints = points.slice(todayIndex).join(' ');

  // Last point coordinates for the "Today" dot
  const todayX = (todayIndex / (prices.length - 1)) * (width - 2 * padding) + padding;
  const todayY = height - ((prices[todayIndex] - minPrice) / range) * (height - 2 * padding) - padding;

  return (
    <div className="w-full space-y-6">
      
      {/* 1. AI Insight Banner (The Village Expert) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mt-2 -mr-2 h-20 w-20 rounded-full bg-white/10 blur-2xl"></div>
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
            <Bot className="h-7 w-7 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-200 mb-1">Góc nhìn AI</h3>
            <p className="text-sm font-medium leading-relaxed">
              "Chào bác, dựa trên dữ liệu, xu hướng tuần này có thể <span className="text-yellow-300 font-bold">tăng nhẹ</span> do nguồn cung đang khan hiếm. Bác có thể cân nhắc chưa bán gấp."
            </p>
          </div>
        </div>
      </div>

      {/* 2. The Simple Trend Chart (The "Hill") */}
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
             <LineChart className="h-4 w-4 text-blue-600" />
             Xu hướng giá
           </h3>
           <div className="flex gap-3 text-[10px] font-bold">
              <div className="flex items-center gap-1 text-green-700">
                 <div className="h-1 w-4 bg-green-700 rounded-full"></div> Đã qua
              </div>
              <div className="flex items-center gap-1 text-green-400">
                 <div className="h-1 w-4 bg-green-400 rounded-full border-b border-green-400 border-dashed"></div> Dự báo
              </div>
           </div>
        </div>

        {/* SVG Chart */}
        <div className="relative h-32 w-full">
           <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              {/* History Line (Solid) */}
              <polyline 
                points={historyPoints} 
                fill="none" 
                stroke="#15803d" // green-700
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Forecast Line (Dashed) */}
              <polyline 
                points={forecastPoints} 
                fill="none" 
                stroke="#4ade80" // green-400
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6, 6"
              />

              {/* Today Marker */}
              <circle cx={todayX} cy={todayY} r="6" fill="#fff" stroke="#15803d" strokeWidth="3" />
              
              {/* Today Label */}
              <g transform={`translate(${todayX}, ${todayY - 15})`}>
                 <rect x="-35" y="-20" width="70" height="20" rx="10" fill="#15803d" />
                 <text x="0" y="-6" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Hôm nay</text>
                 <polygon points="-4,0 4,0 0,6" fill="#15803d" transform="translate(0,0)" />
              </g>
           </svg>
        </div>
      </div>

      {/* 3. The "3-Day Forecast" Cards */}
      <div>
        <h3 className="mb-3 px-2 text-xs font-black uppercase tracking-widest text-gray-400">Dự báo 3 ngày tới</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
           
           {/* Card 1: Tomorrow (Up) */}
           <div className="snap-center min-w-[140px] flex-1 rounded-2xl bg-gradient-to-br from-green-50 to-white p-4 shadow-sm border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                 <BadgeCent className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày mai</p>
              <div className="mt-2 flex items-center gap-1">
                 <ArrowUpRight className="h-5 w-5 text-green-600" />
                 <span className="text-sm font-black text-green-700">Tăng nhẹ</span>
              </div>
              <p className="mt-1 text-lg font-black text-gray-800">~82.800</p>
              <div className="mt-2 rounded-lg bg-green-100/50 p-2">
                 <p className="text-[9px] font-medium text-green-800 leading-tight">
                    "Do thời tiết Brazil khô hạn ảnh hưởng sản lượng."
                 </p>
              </div>
           </div>

           {/* Card 2: Day After (Up) */}
           <div className="snap-center min-w-[140px] flex-1 rounded-2xl bg-gradient-to-br from-green-50 to-white p-4 shadow-sm border border-green-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày kia</p>
              <div className="mt-2 flex items-center gap-1">
                 <ArrowUpRight className="h-5 w-5 text-green-600" />
                 <span className="text-sm font-black text-green-700">Tăng mạnh</span>
              </div>
              <p className="mt-1 text-lg font-black text-gray-800">~83.500</p>
              <div className="mt-2 rounded-lg bg-green-100/50 p-2">
                 <p className="text-[9px] font-medium text-green-800 leading-tight">
                    "Tồn kho tại London giảm sâu kỷ lục."
                 </p>
              </div>
           </div>

           {/* Card 3: 3 Days Later (Down/Correction) */}
           <div className="snap-center min-w-[140px] flex-1 rounded-2xl bg-gradient-to-br from-red-50 to-white p-4 shadow-sm border border-red-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase">3 ngày tới</p>
              <div className="mt-2 flex items-center gap-1">
                 <ArrowDownRight className="h-5 w-5 text-red-500" />
                 <span className="text-sm font-black text-red-600">Điều chỉnh</span>
              </div>
              <p className="mt-1 text-lg font-black text-gray-800">~83.200</p>
              <div className="mt-2 rounded-lg bg-red-100/50 p-2">
                 <p className="text-[9px] font-medium text-red-800 leading-tight">
                    "Áp lực chốt lời ngắn hạn từ các quỹ."
                 </p>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
};

export default SimplePriceForecast;
