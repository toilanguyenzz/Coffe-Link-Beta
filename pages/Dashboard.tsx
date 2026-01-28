/**
 * Dashboard.tsx - PREMIUM COFFEE FARM DASHBOARD
 * Visually rich design with coffee theme, animations, and farmer-friendly UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/DemoAuthContext';
import {
  Settings, Phone, Sun, CloudRain, Wind, Droplets,
  TrendingUp, Calendar, ShoppingCart, BookOpen,
  Coffee, Leaf, Star, ChevronRight, Thermometer
} from 'lucide-react';


// Existing Dashboard Views
import CareView from '../components/dashboard/CareView';
import HarvestView from '../components/dashboard/HarvestView';
import PlanningView from '../components/dashboard/PlanningView';
import ActionableWeatherCard from '../components/dashboard/ActionableWeatherCard';

// Green Credit System Components
import SmartWeatherCard from '../components/dashboard/SmartWeatherCard';
import GreenPointsWallet from '../components/common/GreenPointsWallet';
import RewardCelebration from '../components/common/RewardCelebration';
import { useGreenPoints } from '../contexts/GreenPointsContext';

type SeasonMode = 'home' | 'care' | 'harvest' | 'planning';

// Coffee farm images
const COFFEE_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop',
  beans: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&auto=format&fit=crop',
  farm: 'https://images.unsplash.com/photo-1524350876685-274059332603?w=400&auto=format&fit=crop',
  harvest: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop',
  cherries: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400&auto=format&fit=crop'
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { lastTransaction, clearLastTransaction, balance } = useGreenPoints();
  const [currentView, setCurrentView] = useState<SeasonMode>('home');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [coffeePrice] = useState(117500);
  const [showGreenWallet, setShowGreenWallet] = useState(false);
  const [priceChange] = useState(2.5);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Chào buổi sáng');
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều');
    } else {
      setGreeting('Chào buổi tối');
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Quick stats for the dashboard
  const quickStats = [
    { label: 'Nhiệt độ', value: '28°C', icon: Thermometer, color: 'text-orange-500' },
    { label: 'Độ ẩm', value: '75%', icon: Droplets, color: 'text-blue-500' },
    { label: 'Gió', value: '12km/h', icon: Wind, color: 'text-cyan-500' },
  ];

  // Main action cards with coffee farm theme
  const actionCards = [
    {
      id: 1,
      title: 'Giá Cà Phê Hôm Nay',
      subtitle: `${coffeePrice.toLocaleString()}đ/kg`,
      badge: `+${priceChange}%`,
      badgeColor: 'bg-green-500',
      icon: TrendingUp,
      gradient: 'from-amber-600 via-yellow-600 to-orange-500',
      image: COFFEE_IMAGES.beans,
      action: () => setCurrentView('harvest')
    },
    {
      id: 2,
      title: 'Dự Báo Thời Tiết',
      subtitle: 'Tuần này có mưa rào',
      badge: '7 ngày',
      badgeColor: 'bg-blue-500',
      icon: CloudRain,
      gradient: 'from-blue-500 via-sky-500 to-cyan-400',
      image: COFFEE_IMAGES.farm,
      action: () => setCurrentView('care')
    },
    {
      id: 3,
      title: 'Nhật Ký Mùa Vụ',
      subtitle: 'Ghi chép & theo dõi',
      badge: 'Cập nhật',
      badgeColor: 'bg-emerald-500',
      icon: BookOpen,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      image: COFFEE_IMAGES.cherries,
      action: () => setCurrentView('planning')
    },
    {
      id: 4,
      title: 'Chợ Vật Tư',
      subtitle: 'Phân bón, thuốc BVTV',
      badge: 'Giảm 15%',
      badgeColor: 'bg-red-500',
      icon: ShoppingCart,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      image: COFFEE_IMAGES.harvest,
      action: () => navigate('/market')
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'care':
        return (
          <div className="px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-4 text-white/80 flex items-center gap-2 hover:text-white transition-colors"
            >
              ← Quay lại trang chủ
            </button>
            <h2 className="text-white text-xl font-bold mb-4">🌦️ Dự Báo Thời Tiết</h2>
            <ActionableWeatherCard />
          </div>
        );
      case 'harvest':
        return (
          <div className="px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-4 text-white/80 flex items-center gap-2 hover:text-white transition-colors"
            >
              ← Quay lại trang chủ
            </button>
            <h2 className="text-white text-xl font-bold mb-4">💰 Giá Cà Phê & Thu Hoạch</h2>
            <HarvestView />
          </div>
        );
      case 'planning':
        return <PlanningView farmingType="organic" onBack={() => setCurrentView('home')} />;
      default:
        return (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GREEN POINTS WALLET - Top Right */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="absolute top-4 right-4 z-20">
              <GreenPointsWallet compact onClick={() => setShowGreenWallet(true)} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SMART WEATHER CARD - AI-Powered Advisory */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="mx-4 mb-6">
              <SmartWeatherCard
                farmerName={userProfile?.displayName || 'Bác'}
                location="Chư Păh, Gia Lai"
                onLogDiary={() => setCurrentView('planning')}
              />
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO SECTION WITH COFFEE FARM IMAGE */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative mx-4 mb-6 rounded-3xl overflow-hidden shadow-2xl">
              {/* Background Image with overlay */}
              <div className="absolute inset-0">
                <img
                  src={COFFEE_IMAGES.hero}
                  alt="Coffee Farm"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="relative p-5 pt-6 pb-8">
                {/* Greeting with animation */}
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-sm font-semibold">
                    {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <h2 className="text-white text-3xl font-bold mb-1 drop-shadow-lg">
                  {greeting}!
                </h2>
                <p className="text-white/80 text-lg font-medium mb-4">
                  {userProfile?.displayName || 'Bác Hùng'} ☕
                </p>

                {/* Weather Mini Widget */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <Sun className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-white text-xl font-bold">28°C</div>
                      <div className="text-white/70 text-xs">Nắng nhẹ</div>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  {quickStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-white text-xs font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* COFFEE PRICE HIGHLIGHT CARD */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="mx-4 mb-6">
              <div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-800 p-4 shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setCurrentView('harvest')}
              >
                {/* Animated coffee beans pattern */}
                <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
                  <img src={COFFEE_IMAGES.beans} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Coffee className="w-5 h-5 text-amber-200" />
                      <span className="text-amber-200 text-sm font-medium">Giá Robusta hôm nay</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-3xl font-bold">
                        {coffeePrice.toLocaleString()}
                      </span>
                      <span className="text-amber-200 text-lg">đ/kg</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-green-500 px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-bold">+{priceChange}%</span>
                    </div>
                    <span className="text-amber-200/70 text-xs">so với hôm qua</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ACTION CARDS GRID */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-300" />
                  Công Cụ Nhanh
                </h3>
                <span className="text-white/60 text-sm">Xem tất cả →</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {actionCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={card.action}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Card Image Background */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <img
                        src={card.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                    <div className="relative p-4">
                      {/* Badge */}
                      <div className={`absolute top-3 right-3 ${card.badgeColor} px-2 py-0.5 rounded-full`}>
                        <span className="text-white text-[10px] font-bold">{card.badge}</span>
                      </div>

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <card.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>

                      {/* Title */}
                      <h4 className="text-gray-900 font-bold text-sm mb-1 text-left">
                        {card.title}
                      </h4>
                      <p className="text-gray-500 text-xs text-left line-clamp-1">
                        {card.subtitle}
                      </p>

                      {/* Hover arrow */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FARM TIPS CAROUSEL */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="px-4 mb-6">
              <div className="bg-gradient-to-r from-green-800/80 to-emerald-700/80 backdrop-blur-sm rounded-2xl p-4 border border-green-600/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💡</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm mb-1">Mẹo Nhà Nông</h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Tháng này nên bón phân NPK cho cà phê để chuẩn bị cho mùa ra hoa.
                      Kiểm tra độ ẩm đất thường xuyên!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SUPPORT BUTTON */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="px-4 mb-4">
              <button
                className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl py-4 shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-3 relative overflow-hidden"
                onClick={() => window.open('tel:1900xxxx')}
              >
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                <Phone className="w-6 h-6 text-white relative z-10" />
                <span className="text-white text-lg font-bold relative z-10">Gọi Hỗ Trợ 24/7</span>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen pb-24 overflow-hidden relative">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PREMIUM BACKGROUND WITH COFFEE THEME */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-800 via-green-700 to-emerald-900" />

        {/* Animated morning mist effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
        </div>

        {/* Decorative blur orbs */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-yellow-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />

        {/* Coffee beans pattern overlay (subtle) */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${COFFEE_IMAGES.beans})`,
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Max-width container */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen">



        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER WITH AVATAR */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar with online indicator */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-xl">
                <img
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-green-800" />
            </div>

            {/* User info */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-lg font-bold">
                  {userProfile?.displayName?.split(' ')[0] || 'Bác Hùng'}
                </span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-white/60 text-sm">Nông dân 5 năm kinh nghiệm</p>
            </div>
          </div>

          {/* Settings button */}
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN CONTENT */}
        {renderContent()}

        {/* Bottom spacing */}
        <div className="h-6"></div>
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
