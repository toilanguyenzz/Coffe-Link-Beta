/**
 * Dashboard.tsx - FARMER FRIENDLY VERSION
 * UI thân thiện với nông dân, dễ sử dụng
 * Background: Hình vườn cà phê trong suốt
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Sprout, Tractor, ClipboardList, Bell, Sun, Coffee } from 'lucide-react';
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
  const [greetingEmoji, setGreetingEmoji] = useState('🌅');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Chào buổi sáng');
      setGreetingEmoji('🌅');
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều');
      setGreetingEmoji('☀️');
    } else {
      setGreeting('Chào buổi tối');
      setGreetingEmoji('🌙');
    }
  }, []);

  // Listen for voice navigation
  useEffect(() => {
    const handleVoiceNavigate = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab) setSeason(tab);
    };
    window.addEventListener('voice-navigate', handleVoiceNavigate as EventListener);
    return () => window.removeEventListener('voice-navigate', handleVoiceNavigate as EventListener);
  }, []);

  return (
    <div className="min-h-screen pb-32 overflow-hidden relative">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FARM BACKGROUND - Beautiful Coffee Farm Image */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0">
        {/* Main Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-green-900 to-slate-900" />

        {/* Coffee Farm Image - Transparent Overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Green Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/60 via-green-900/70 to-slate-900/90" />

        {/* Soft Light Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FRIENDLY HEADER - Simple & Warm */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          {/* Welcome Section */}
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white/20">
              <Coffee className="w-7 h-7 text-white" />
            </div>

            <div>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <span>{greetingEmoji}</span> {greeting}
              </p>
              <h1 className="text-2xl font-bold text-white">
                {userProfile?.displayName || 'Bác nông dân'}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="relative w-11 h-11 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </button>
            <button
              onClick={() => logout()}
              className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white border border-white/20 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/10">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 text-sm">Thời tiết tốt để làm vườn</span>
            </div>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-lg rounded-2xl px-4 py-3 border border-emerald-500/30">
            <span className="text-emerald-400 font-bold text-sm">28°C</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODE SELECTOR - Big Friendly Buttons */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-md px-5">
        <div className="mb-5 flex gap-2 bg-black/20 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
          {[
            { id: 'care', label: 'Chăm Sóc', emoji: '🌱', icon: Sprout, gradient: 'from-emerald-500 to-green-600', color: 'emerald' },
            { id: 'harvest', label: 'Thu Hoạch', emoji: '🚜', icon: Tractor, gradient: 'from-orange-500 to-amber-500', color: 'orange' },
            { id: 'planning', label: 'Kế Hoạch', emoji: '📋', icon: ClipboardList, gradient: 'from-violet-500 to-purple-600', color: 'violet' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSeason(mode.id as SeasonMode)}
              className={`relative flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300 ${season === mode.id
                  ? 'bg-gradient-to-br ' + mode.gradient + ' text-white shadow-lg scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {/* Emoji for easier recognition */}
              <span className="text-2xl mb-1">{mode.emoji}</span>
              <span className={`text-xs font-bold ${season === mode.id ? 'text-white' : ''}`}>
                {mode.label}
              </span>

              {/* Active indicator */}
              {season === mode.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg" />
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MAIN CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div
          key={season}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
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

      <BottomNav />
    </div>
  );
};

export default Dashboard;
