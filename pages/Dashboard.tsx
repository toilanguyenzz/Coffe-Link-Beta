import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Sprout, Tractor, ClipboardList, Bell, Sparkles, Crown } from 'lucide-react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPriceToast, setShowPriceToast] = useState(false);

  useEffect(() => {
    // Dynamic Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  // Listen for voice navigation events from GlobalVoiceFAB
  useEffect(() => {
    const handleVoiceNavigate = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab) setSeason(tab);
    };

    window.addEventListener('voice-navigate', handleVoiceNavigate as EventListener);
    return () => window.removeEventListener('voice-navigate', handleVoiceNavigate as EventListener);
  }, []);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0d1520] to-[#111827] pb-32 overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PREMIUM HEADER - Animated Mesh Gradient + Floating Elements */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden pb-10 pt-14">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 opacity-90" />

        {/* Animated Gradient Orbs */}
        <div
          className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-yellow-400/40 to-orange-500/30 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-300/40 to-cyan-400/30 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`, animationDelay: '1s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-soft-light" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-md px-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-white/80 mb-0.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                {greeting},
              </p>
              <h1 className="text-3xl font-black tracking-tight leading-none drop-shadow-lg">
                {userProfile?.displayName || 'Nông dân'}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                {/* Premium Badge */}
                <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 px-3 py-1.5 text-[10px] font-black backdrop-blur-xl border border-yellow-400/30 shadow-lg shadow-yellow-500/20 animate-pulse">
                  <Crown className="h-3 w-3 text-yellow-400" />
                  <span className="text-yellow-300">PRO FARMER</span>
                </span>
                {/* Garden Status */}
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur-xl border border-white/20 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                  Vườn Của Tôi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Button - Glassmorphism */}
              <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-xl hover:scale-105 hover:shadow-2xl group">
                <Bell className="h-5 w-5 group-hover:animate-bounce" />
                <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white shadow-lg animate-pulse" />
              </button>
              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/20 hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300 shadow-xl hover:scale-105"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
            <path
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
              fill="#0a0f1a"
              className="opacity-90"
            />
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODE SELECTOR - Glassmorphism Premium Tabs */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-md px-5 -mt-4 relative z-20">
        <div className="mb-6 flex bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-2 border border-white/10">
          {[
            { id: 'care', label: 'Chăm Sóc', icon: Sprout, gradient: 'from-emerald-500 to-green-600' },
            { id: 'harvest', label: 'Thu Hoạch', icon: Tractor, gradient: 'from-orange-500 to-amber-500' },
            { id: 'planning', label: 'Kế Hoạch', icon: ClipboardList, gradient: 'from-violet-500 to-purple-600' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSeason(mode.id as SeasonMode)}
              className={`relative flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl transition-all duration-500 overflow-hidden ${season === mode.id
                ? 'text-white shadow-xl scale-[1.02]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              {/* Active Background Gradient */}
              {season === mode.id && (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-90`} />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  {/* Glow Effect */}
                  <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r ${mode.gradient} blur-xl opacity-60`} />
                </>
              )}

              <mode.icon className={`relative z-10 h-6 w-6 mb-1.5 transition-all duration-300 ${season === mode.id ? 'scale-110 drop-shadow-lg' : ''
                }`} />
              <span className={`relative z-10 text-[11px] font-bold uppercase tracking-wider ${season === mode.id ? 'text-white' : ''
                }`}>
                {mode.label}
              </span>

              {/* Active Indicator Dot */}
              {season === mode.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50" />
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MAIN CONTENT - Animated Entry */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div
          key={season}
          className="animate-in fade-in slide-in-from-bottom-6 duration-700"
        >
          {season === 'planning' ? (
            <PlanningView farmingType="organic" autoStartVoice={triggerVoice} />
          ) : season === 'care' ? (
            <CareView />
          ) : (
            <HarvestView />
          )}
        </div>
      </div>



      {/* Price Toast */}
      {showPriceToast && (
        <div className="fixed top-4 left-4 right-4 z-[2000] animate-in slide-in-from-top fade-in duration-500">
          <div className="max-w-md mx-auto bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-2xl p-4">
            <div className="text-center">
              <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Giá Cà Phê Hôm Nay</p>
              <p className="text-white text-2xl font-black">120.000 đ/kg</p>
              <p className="text-white/60 text-xs mt-1">Cập nhật: 10 phút trước</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;

