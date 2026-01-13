import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mic, Sprout, Tractor, Package, Leaf, ClipboardList, MapPin } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

// Organic Components
import OrganicCare from '../components/dashboard/CareView';
import OrganicHarvest from '../components/dashboard/HarvestView';

// Traditional Components
import TraditionalCare from '../components/dashboard/TraditionalCare';
import TraditionalHarvest from '../components/dashboard/TraditionalHarvest';

// New Component
import PlanningView from '../components/dashboard/PlanningView';

type SeasonMode = 'care' | 'harvest' | 'planning';
type FarmingTab = 'organic' | 'traditional';

const Dashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [season, setSeason] = useState<SeasonMode>('care');
  const [activeTab, setActiveTab] = useState<FarmingTab>('organic');
  const [triggerVoice, setTriggerVoice] = useState(false);

  // Sync with user profile on load once
  useEffect(() => {
    if (userProfile?.farmingType) {
      setActiveTab(userProfile.farmingType);
    }
  }, [userProfile]);

  const switchTab = (tab: FarmingTab) => {
    setActiveTab(tab);
  };

  const handleFabClick = () => {
    setSeason('planning');
    setTimeout(() => {
        setTriggerVoice(true);
        setTimeout(() => setTriggerVoice(false), 500);
    }, 100);
  };

  const isOrganic = activeTab === 'organic';

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-32 font-sans">
      
      {/* 1. COVER IMAGE HEADER SECTION */}
      <div className="relative h-[42vh] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
         {/* Background Image */}
         <img 
            src={isOrganic 
                ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
                : "https://images.unsplash.com/photo-1625246333195-551e5051d687?q=80&w=1000&auto=format&fit=crop"
            }
            alt="Farm Cover"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
         />
         
         {/* Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>

         {/* Top Bar Content */}
         <div className="absolute top-0 left-0 right-0 pt-6 px-6 z-20">
             <div className="flex justify-between items-start">
                 <div className="flex flex-col text-white">
                     <div className="flex items-center gap-1.5 opacity-90 mb-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">Buôn Ma Thuột, VN</span>
                     </div>
                     <h1 className="text-2xl font-black tracking-tight leading-none drop-shadow-md">
                        Xin chào, {userProfile?.displayName?.split(' ').pop()}
                     </h1>
                 </div>
                 <div 
                    className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => logout()}
                 >
                    <img 
                        src={`https://ui-avatars.com/api/?name=${userProfile?.displayName}&background=random`} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                    />
                 </div>
             </div>
         </div>
         
         {/* Organic/Traditional Switcher (Integrated) */}
         <div className="absolute bottom-6 left-6 right-6 z-20">
             <div className="flex p-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
                <button
                    onClick={() => switchTab('organic')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'organic' ? 'bg-green-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                >
                    <Leaf className="h-3.5 w-3.5" /> Organic
                </button>
                <button
                    onClick={() => switchTab('traditional')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'traditional' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                >
                    <Package className="h-3.5 w-3.5" /> Truyền thống
                </button>
             </div>
         </div>
      </div>

      {/* 2. MAIN CONTENT - Overlapping the header slightly if needed, or just below */}
      <div className="mx-auto max-w-md px-5 -mt-4 relative z-10 space-y-6">
        
        {/* Season/Mode Selector - Clean Segmented Control */}
        <div className="flex justify-between items-center bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100">
            {[
                { id: 'care', label: 'Chăm Sóc', icon: Sprout },
                { id: 'harvest', label: 'Thu Hoạch', icon: Tractor },
                { id: 'planning', label: 'Kế Hoạch', icon: ClipboardList }
            ].map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => setSeason(mode.id as SeasonMode)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        season === mode.id 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <mode.icon className="h-3.5 w-3.5" />
                    {mode.label}
                </button>
            ))}
        </div>

        {/* Dynamic Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {season === 'planning' ? (
                <PlanningView farmingType={activeTab} autoStartVoice={triggerVoice} />
            ) : activeTab === 'organic' ? (
                season === 'care' ? <OrganicCare /> : <OrganicHarvest />
            ) : (
                season === 'care' ? <TraditionalCare /> : <TraditionalHarvest />
            )}
        </div>
      </div>

      {/* Floating Mic Button */}
      <button 
        className={`fixed bottom-28 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-90 hover:scale-105 ${isOrganic ? 'bg-[#1C1C1E]' : 'bg-orange-600'} ${season === 'planning' ? 'ring-4 ring-offset-2 ring-gray-200' : ''}`}
        onClick={handleFabClick}
      >
        <Mic className="h-7 w-7" />
      </button>

      <BottomNav />
    </div>
  );
};

export default Dashboard;