/**
 * Dashboard.tsx - Home Screen
 * Premium design matching reference EXACTLY
 * 
 * Design elements:
 * 1. Background: Coffee farm with bokeh effect (green leaves + red cherries)
 * 2. Header: Avatar + Greeting + Points + Bell
 * 3. Main Card: Realistic leaf + "ĐẤT ĐỦ ẨM" + Weather stats
 * 4. Function Cards: Real images (fertilizer bag, drone, AI camera)
 * 5. CTA: Green pill button
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/DemoAuthContext';
import { Bell, ChevronRight, Pencil, Cloud, Sun, CloudRain, Zap, Umbrella, MousePointerClick } from 'lucide-react';

// Views
import CommunityWeatherHub from '../components/weather/CommunityWeatherHub';
import PlanningView from '../components/dashboard/PlanningView';
import HarvestView from '../components/dashboard/HarvestView';

// Green Credit System
import RewardCelebration from '../components/common/RewardCelebration';
import { useGreenPoints } from '../contexts/GreenPointsContext';

type ViewMode = 'home' | 'weather' | 'planning' | 'harvest';

// Premium background - Coffee farm with bokeh
const FARM_BOKEH_BG = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80';

// Realistic leaf image
const LEAF_IMAGE = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop';

// Function card images  
const FERTILIZER_BAG = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&auto=format&fit=crop';
const DRONE_SERVICE = 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&auto=format&fit=crop';
const AI_CAMERA = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { balance, lastTransaction, clearLastTransaction } = useGreenPoints();
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [greeting, setGreeting] = useState('');

  // Simulated weather/soil data
  const [weatherData] = useState({
    soilMoisture: 60,
    temperature: 28,
    windSpeed: 12,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Chào buổi sáng');
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều');
    } else {
      setGreeting('Chào buổi tối');
    }
  }, []);

  const firstName = userProfile?.displayName?.split(' ').pop() || 'Minh';

  // Function cards data
  const functionCards = [
    {
      id: 'buy-supplies',
      image: FERTILIZER_BAG,
      iconBg: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      icon: '🌱',
      title: 'Mua vật tư',
      subtitle: 'Giá NPK đang giảm.\nGom đơn ngay?',
      onClick: () => navigate('/market'),
    },
    {
      id: 'call-service',
      image: DRONE_SERVICE,
      iconBg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      icon: '🚁',
      title: 'Gọi Dịch vụ',
      subtitle: 'Đặt lịch phun\nthuốc',
      onClick: () => navigate('/consult'),
    },
    {
      id: 'scan-disease',
      image: AI_CAMERA,
      iconBg: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
      icon: '📷',
      title: 'Soi bệnh cây',
      subtitle: 'Chụp ảnh kiểm tra\nsâu bệnh',
      hasAI: true,
      onClick: () => navigate('/consult'),
    },
  ];

  // Render home view
  // Render home view
  const renderHomeView = () => (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* COFFEE PRICE CARD - Orange/Peach gradient with chart */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="px-4 mb-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <button
          onClick={() => setCurrentView('harvest')}
          className="w-full rounded-[28px] overflow-hidden relative group active:scale-[0.98] transition-all text-left"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fcd34d 60%, #fbbf24 100%)',
            boxShadow: '0 20px 50px rgba(251, 191, 36, 0.25), 0 8px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Decorative chart line in background */}
          <svg
            className="absolute top-0 right-0 w-2/3 h-full opacity-30"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Chart area fill */}
            <path
              d="M0 80 Q30 75, 50 60 T100 50 T150 30 T200 20 L200 100 L0 100 Z"
              fill="url(#chartGradient)"
            />
            {/* Chart line */}
            <path
              d="M0 80 Q30 75, 50 60 T100 50 T150 30 T200 20"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-chart-draw"
            />
            {/* Data points */}
            <circle cx="50" cy="60" r="3" fill="#f97316" className="animate-pulse" />
            <circle cx="100" cy="50" r="3" fill="#f97316" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
            <circle cx="150" cy="30" r="3" fill="#f97316" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          </svg>

          {/* Content */}
          <div className="relative z-10 p-5">
            <div className="flex justify-between items-start mb-1">
              <p className="text-amber-800/80 text-sm font-semibold">Coffee Price</p>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700/60 bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
                <MousePointerClick className="w-3 h-3" /> Chạm để xem
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-amber-900 tracking-tight">117.500</span>
              <span className="text-xl font-bold text-amber-800">đ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-800/90 text-sm font-medium">Giá Robusta</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
              >
                +2.5%
              </span>
            </div>
          </div>

          {/* Hover glow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MAIN WEATHER/SOIL CARD - ULTRA PREMIUM GLASS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="px-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div
          className="rounded-[36px] overflow-hidden relative group transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Internal Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-green-400/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Weather Icon Section - Trendy 3D Sun */}
          <div className="flex flex-col items-center pt-8 pb-6 relative z-10">
            {/* Dynamic Weather Icon Container */}
            <div className="relative mb-4 animate-float-slow group-hover:scale-110 transition-transform duration-500 ease-out">
              <div
                className="w-40 h-40 relative"
                style={{
                  filter: 'drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))',
                }}
              >
                {/* 3D Sun Composition */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#FFF7ED" />
                      <stop offset="40%" stopColor="#FDBA74" />
                      <stop offset="100%" stopColor="#F97316" />
                    </radialGradient>
                    <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                    </filter>
                  </defs>

                  {/* Rotating Rays - Outer */}
                  <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px', animationDuration: '20s' }}>
                    {[...Array(12)].map((_, i) => (
                      <path
                        key={i}
                        d="M100 20 L100 0"
                        stroke="#FDBA74"
                        strokeWidth="4"
                        strokeLinecap="round"
                        transform={`rotate(${i * 30} 100 100)`}
                        className="opacity-60"
                      />
                    ))}
                  </g>

                  {/* Rotating Rays - Inner */}
                  <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px', animationDuration: '10s', animationDirection: 'reverse' }}>
                    {[...Array(8)].map((_, i) => (
                      <path
                        key={i}
                        d="M100 40 L100 30"
                        stroke="#F97316"
                        strokeWidth="6"
                        strokeLinecap="round"
                        transform={`rotate(${i * 45} 100 100)`}
                      />
                    ))}
                  </g>

                  {/* Main Sun Body */}
                  <circle cx="100" cy="100" r="50" fill="url(#sunGradient)" />
                  <circle cx="100" cy="100" r="45" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                </svg>

                {/* Lens Flares / Sparkles */}
                <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full blur-[1px] animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-yellow-100 rounded-full blur-[1px] animate-pulse" />
              </div>
            </div>

            {/* Weather Status Text - Gradient & Trendy */}
            <h1
              className="text-4xl font-black mb-2 tracking-tight uppercase text-center leading-none"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                background: 'linear-gradient(to right, #ea580c, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 10px rgba(234, 88, 12, 0.2))'
              }}
            >
              NẮNG GẮT
            </h1>

            {/* Capability/Prediction Badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full shadow-sm">
                <Sun className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-orange-700 text-xs font-bold uppercase tracking-wide">UV Cực Đại</span>
              </div>

              <p className="text-gray-500 text-sm font-medium text-center max-w-[80%]">
                Dự báo: <span className="text-blue-500 font-bold">Mưa rào</span> lúc <span className="bg-blue-100/80 px-1.5 py-0.5 rounded text-blue-700 font-bold">16:30</span>
              </p>
            </div>
          </div>



          {/* Weather Stats Row - Enhanced */}
          <div className="grid grid-cols-3 gap-2 px-4 pb-6">
            {/* Soil Moisture */}
            <div className="flex flex-col items-center p-3 rounded-2xl transition-colors hover:bg-blue-50/80 group/stat">
              <div className="mb-2 p-2.5 rounded-xl bg-blue-100/50 text-blue-500 group-hover/stat:bg-blue-500 group-hover/stat:text-white transition-all shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-gray-800 tracking-tight">{weatherData.soilMoisture}%</span>
              <span className="text-xs font-semibold text-gray-400">Độ ẩm đất</span>
            </div>

            {/* Temperature */}
            <div className="flex flex-col items-center p-3 rounded-2xl transition-colors hover:bg-yellow-50/80 group/stat">
              <div className="mb-2 p-2.5 rounded-xl bg-yellow-100/50 text-yellow-500 group-hover/stat:bg-yellow-500 group-hover/stat:text-white transition-all shadow-sm">
                <svg className="w-6 h-6 animate-spin-slow" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-2xl font-black text-gray-800 tracking-tight">{weatherData.temperature}°C</span>
              <span className="text-xs font-semibold text-gray-400">Nhiệt độ</span>
            </div>

            {/* Wind Speed */}
            <div className="flex flex-col items-center p-3 rounded-2xl transition-colors hover:bg-cyan-50/80 group/stat">
              <div className="mb-2 p-2.5 rounded-xl bg-cyan-100/50 text-cyan-500 group-hover/stat:bg-cyan-500 group-hover/stat:text-white transition-all shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2M12.59 19.41A2 2 0 1 0 14 16H2M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
                </svg>
              </div>
              <span className="text-2xl font-black text-gray-800 tracking-tight">{weatherData.windSpeed} <span className="text-sm font-bold">km/h</span></span>
              <span className="text-xs font-semibold text-gray-400">Tốc độ gió</span>
            </div>
          </div>
        </div>
      </div >

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* "XEM DỰ BÁO CHI TIẾT" BUTTON - Enhanced */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="px-4 mb-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => setCurrentView('weather')}
          className="w-full bg-white/90 backdrop-blur-md rounded-2xl py-4 px-6 flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white"
          style={{
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-800 text-sm">Xem dự báo chi tiết</div>
              <div className="text-xs text-gray-400">Thời tiết 7 ngày tới</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3 FUNCTION CARDS - Matching reference exactly with Premium Polish */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {functionCards.map((card, index) => (
            <button
              key={card.id}
              onClick={card.onClick}
              className="bg-white/95 backdrop-blur-sm rounded-[24px] p-3 pb-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-[0.97] transition-all text-left relative overflow-hidden animate-fade-in-up group"
              style={{
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
                animationDelay: `${0.3 + index * 0.1}s`
              }}
            >
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50 opacity-50" />

              <div className="relative z-10">
                {/* Icon with background */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-xl relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300"
                  style={{ background: card.iconBg }}
                >
                  <span style={{ filter: 'brightness(0) invert(1)', fontSize: '24px' }}>
                    {card.icon}
                  </span>
                  {/* AI Badge */}
                  {card.hasAI && (
                    <div
                      className="absolute -bottom-px -right-px w-6 h-6 rounded-tl-xl flex items-center justify-center animate-shine overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #1f2937 0%, #000000 100%)' }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <span className="text-[9px] text-white font-black relative z-10 tracking-wider">AI</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-gray-900 font-extrabold text-sm mb-1 leading-tight group-hover:text-green-600 transition-colors">
                  {card.title}
                </h3>

                {/* Subtitle */}
                <p className="text-gray-500 text-[10px] leading-relaxed whitespace-pre-line font-medium">
                  {card.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* "GHI NHẬT KÝ BÓN PHÂN" CTA BUTTON - Green pill */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="px-4 pb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <button
          onClick={() => setCurrentView('planning')}
          className="w-full py-4 px-6 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all animate-pulse-ring relative z-10 hover:shadow-green-500/50 hover:shadow-2xl hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            boxShadow: '0 8px 25px rgba(22, 163, 74, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Pencil className="w-5 h-5 text-white" />
          <span className="text-white text-base font-bold tracking-wide">Ghi Nhật Ký Bón Phân</span>
        </button>
      </div>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'weather':
        return (
          <div className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-4 text-white/90 flex items-center gap-2 hover:text-white transition-colors text-sm font-medium"
            >
              ← Quay lại trang chủ
            </button>
            <h2 className="text-white text-xl font-bold mb-4">Dự Báo Thời Tiết</h2>
            <CommunityWeatherHub
              farmerName={userProfile?.displayName || 'Bác Nông Dân'}
              farmerId={userProfile?.id || 'demo-user'}
              location="Chư Păh, Gia Lai"
            />
          </div>
        );
      case 'planning':
        return <PlanningView farmingType="organic" onBack={() => setCurrentView('home')} />;
      case 'harvest':
        return (
          <div className="px-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-4 text-white/90 flex items-center gap-2 hover:text-white transition-colors text-sm font-medium"
            >
              ← Quay lại trang chủ
            </button>
            <HarvestView />
          </div>
        );
      default:
        return renderHomeView();
    }
  };

  return (
    <div className="min-h-screen pb-24 overflow-hidden relative">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PREMIUM 3D BACKGROUND - Real coffee plantation with effects */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="premium-bg-container">
        {/* Real coffee plantation hero image with Ken Burns effect */}
        <img
          src="/images/coffee_plantation_hero.png"
          alt="Coffee Plantation"
          className="premium-bg-image"
        />

        {/* Animated light rays from top-left (golden hour effect) */}
        <div className="premium-light-rays" />

        {/* Floating coffee cherries - 3D depth effect */}
        <div
          className="floating-particle particle-cherry"
          style={{
            width: '12px',
            height: '12px',
            top: '15%',
            left: '10%',
            animation: 'floatParticle1 8s ease-in-out infinite',
          }}
        />
        <div
          className="floating-particle particle-cherry"
          style={{
            width: '8px',
            height: '8px',
            top: '25%',
            right: '15%',
            animation: 'floatParticle2 10s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
        <div
          className="floating-particle particle-cherry"
          style={{
            width: '10px',
            height: '10px',
            top: '35%',
            left: '25%',
            animation: 'floatParticle3 7s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
        <div
          className="floating-particle particle-cherry"
          style={{
            width: '6px',
            height: '6px',
            top: '20%',
            right: '30%',
            animation: 'floatParticle1 9s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        />

        {/* Floating leaves - depth layers */}
        <div
          className="floating-particle particle-leaf"
          style={{
            width: '16px',
            height: '10px',
            top: '12%',
            left: '60%',
            animation: 'floatParticle2 12s ease-in-out infinite',
          }}
        />
        <div
          className="floating-particle particle-leaf"
          style={{
            width: '14px',
            height: '8px',
            top: '30%',
            right: '8%',
            animation: 'floatParticle1 11s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />
        <div
          className="floating-particle particle-leaf"
          style={{
            width: '20px',
            height: '12px',
            top: '8%',
            left: '35%',
            animation: 'floatParticle3 14s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />

        {/* Ambient glow particles for 3D depth */}
        <div
          className="floating-particle particle-glow"
          style={{
            width: '100px',
            height: '100px',
            top: '5%',
            left: '-5%',
          }}
        />
        <div
          className="floating-particle particle-glow"
          style={{
            width: '80px',
            height: '80px',
            top: '15%',
            right: '5%',
            animationDelay: '2s',
          }}
        />

        {/* Glassmorphism overlay - smooth transition to content */}
        <div className="premium-bg-overlay" />

        {/* Extra depth blur at bottom for content readability */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{
            background: 'linear-gradient(to top, rgba(245, 250, 242, 0.95) 0%, rgba(245, 250, 242, 0.7) 40%, transparent 100%)',
            backdropFilter: 'blur(2px)',
          }}
        />
      </div>

      {/* Max-width container */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER - Matching reference exactly */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="px-4 pt-5 pb-5 flex items-center justify-between">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-11 h-11 rounded-full overflow-hidden"
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '2px solid rgba(255,255,255,0.5)',
                }}
              >
                <img
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-800 text-sm font-semibold">
                  {greeting}
                </span>
                <span className="text-base">👋</span>
              </div>
              <span className="text-gray-700 text-sm font-medium">
                ({firstName})
              </span>
            </div>
          </div>

          {/* Right: Points + Bell */}
          <div className="flex items-center gap-2.5">
            {/* Green Points Badge - matching reference */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Check icon */}
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-gray-800 font-bold text-sm">
                {(balance?.points || 1000).toLocaleString()}
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
          {renderContent()}
        </div>
      </div>

      {/* Reward Celebration Overlay */}
      {lastTransaction && lastTransaction.amount > 0 && (
        <RewardCelebration
          transaction={lastTransaction}
          onComplete={clearLastTransaction}
        />
      )}
    </div>
  );
};

export default Dashboard;
