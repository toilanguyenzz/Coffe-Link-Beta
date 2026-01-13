
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mic, Sprout, Tractor, ClipboardList, Bell, QrCode } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

// Unified Components
import CareView from '../components/dashboard/CareView';
import HarvestView from '../components/dashboard/HarvestView';
import PlanningView from '../components/dashboard/PlanningView';

type SeasonMode = 'care' | 'harvest' | 'planning';

const Dashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [season, setSeason] = useState<SeasonMode>('care');
  const [triggerVoice, setTriggerVoice] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Dynamic Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const handleFabClick = () => {
    setSeason('planning');
    setTimeout(() => {
        setTriggerVoice(true);
        setTimeout(() => setTriggerVoice(false), 500);
    }, 100);
  };

  // Unified Theme (Emerald/Green focused)
  const themeGradient = 'from-[#059669] via-[#10B981] to-[#34D399]';
  const buttonThemeColor = 'bg-[#059669]';
  const activePillClass = 'bg-emerald-100 text-emerald-800';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* 1. Header Section - Unified "My Garden" */}
      <div className={`relative w-full overflow-hidden pb-8 pt-14 rounded-b-[2.5rem] shadow-2xl bg-gradient-to-br ${themeGradient}`}>
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 mix-blend-overlay"></div>
        
        <div className="relative z-10 mx-auto max-w-md px-6">
           <div className="flex items-center justify-between text-white">
              <div className="flex flex-col">
                 <p className="text-sm font-medium opacity-90 mb-0.5">{greeting},</p>
                 <h1 className="text-2xl font-black tracking-tight leading-none drop-shadow-md">
                   {userProfile?.displayName || 'Nông dân'}
                 </h1>
                 <div className="mt-2 flex items-center gap-2">
                     <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold backdrop-blur-md border border-white/20 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse"></span>
                        Vườn Của Tôi
                     </span>
                     <span className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold backdrop-blur-md border border-white/10 shadow-sm">
                        ID: {userProfile?.farmerId}
                     </span>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors border border-white/20">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                 </button>
                 <button onClick={() => logout()} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 hover:bg-red-500/20 transition-colors">
                    <LogOut className="h-5 w-5" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 -mt-6 relative z-20">
        {/* 2. Mode Selector - Glassy Pill */}
        <div className="mb-6 flex bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-1.5 border border-white/50">
            {[
                { id: 'care', label: 'Chăm Sóc', icon: Sprout },
                { id: 'harvest', label: 'Thu Hoạch', icon: Tractor },
                { id: 'planning', label: 'Kế Hoạch', icon: ClipboardList }
            ].map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => setSeason(mode.id as SeasonMode)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${
                        season === mode.id 
                        ? `${activePillClass} font-black shadow-sm ring-1 ring-black/5 scale-[1.02]` 
                        : 'text-gray-400 font-medium hover:bg-gray-50'
                    }`}
                >
                    <mode.icon className={`h-5 w-5 mb-1 ${season === mode.id ? 'scale-110' : ''}`} />
                    <span className="text-[10px] uppercase tracking-wide">{mode.label}</span>
                </button>
            ))}
        </div>

        {/* 3. Main Content - Animated Entry */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {season === 'planning' ? (
                <PlanningView farmingType="organic" autoStartVoice={triggerVoice} />
            ) : season === 'care' ? (
                <CareView />
            ) : (
                <HarvestView />
            )}
        </div>
      </div>

      {/* Floating Action Button (Mic) */}
      <button 
        className={`fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-90 hover:scale-105 ${buttonThemeColor} ${season === 'planning' ? 'ring-4 ring-offset-2 ring-gray-200 animate-pulse' : ''} shadow-lg shadow-green-900/20`}
        onClick={handleFabClick}
        title="Nói để lập kế hoạch"
      >
        <div className={`absolute inset-0 rounded-full bg-white opacity-0 ${season === 'planning' ? 'animate-ping opacity-20' : ''}`}></div>
        <Mic className="h-7 w-7 relative z-10" />
      </button>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
