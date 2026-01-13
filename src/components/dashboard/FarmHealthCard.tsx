import React from 'react';
import { GardenMetrics } from '../../types';
import { ArrowRight, MapPin, Sprout, Activity, Database } from 'lucide-react';

interface Props {
  metrics: GardenMetrics;
}

const FarmHealthCard: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-xl shadow-gray-200/50 transition-all hover:scale-[1.02] cursor-pointer border border-gray-100">
       <div className="flex gap-4">
           {/* Left Image Section */}
           <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative">
               <img 
                 src="https://images.unsplash.com/photo-1625246333195-551e5051d687?q=80&w=400&auto=format&fit=crop" 
                 alt="Field" 
                 className="h-full w-full object-cover"
               />
               <div className="absolute inset-0 bg-black/10"></div>
           </div>

           {/* Right Info Section */}
           <div className="flex-1 py-1">
               <h3 className="text-base font-black text-gray-900 leading-tight">
                   Lô Cà Phê Cao Sản R89
               </h3>
               <div className="flex items-center gap-1 mt-1 text-gray-400 text-[10px] font-bold">
                   <MapPin className="h-3 w-3" />
                   12.679°N, 108.044°E
               </div>

               {/* Status Tag */}
               <div className="mt-3 flex items-center gap-2">
                   <span className="inline-flex items-center rounded-lg bg-green-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                       Sắp thu hoạch
                   </span>
                   {metrics.ecoPotentialIndex > 50 && (
                        <span className="inline-flex items-center rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                            Organic
                        </span>
                   )}
               </div>
           </div>
       </div>

       {/* Bottom Stats Row */}
       <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
           <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
               <Sprout className="h-4 w-4 text-gray-400" />
               <span className="text-xs font-bold text-gray-700">1.2 Ha</span>
           </div>
           <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
               <Activity className="h-4 w-4 text-gray-400" />
               <span className="text-xs font-bold text-gray-700">12 Việc</span>
           </div>
           <button className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
               <ArrowRight className="h-4 w-4" />
           </button>
       </div>
    </div>
  );
};

export default FarmHealthCard;