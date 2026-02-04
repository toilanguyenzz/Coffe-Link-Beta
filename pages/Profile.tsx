/**
 * Profile.tsx - Farmer Passport UI
 * EXACT match to reference design
 */

import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  LogOut,
  Loader2,
  Shield,
  Globe,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/DemoAuthContext';

// Lazy load EUDR Map
const EudrCheckFeature = lazy(() => import('../components/features/EudrCheckFeature'));

const FARMER_DATA = {
  name: 'TRẦN VĂN MINH',
  displayName: 'Bác Minh',
  avatar: 'https://i.pravatar.cc/300?img=11',
};

const MapPlaceholder: React.FC = () => (
  <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
    <p className="text-white/60 text-sm">Đang tải bản đồ...</p>
  </div>
);

const Profile: React.FC = () => {
  const { logout } = useAuth(); // Get logout from context
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(() => {
    const savedStatus = localStorage.getItem('eudr_status');
    return savedStatus === 'safe' || savedStatus === 'warning';
  });

  const [showFullMap, setShowFullMap] = useState(false);

  const handleComplete = (status: 'safe' | 'warning' | 'legal_risk' | 'violation' | 'drawing' | 'scanning', geojson: any) => {
    localStorage.setItem('eudr_status', status);
    localStorage.setItem('eudr_timestamp', new Date().toISOString());
    localStorage.setItem('eudr_geojson', JSON.stringify(geojson));

    if (status === 'safe' || status === 'warning') {
      setIsVerified(true);
      setTimeout(() => setShowFullMap(false), 2000);
    }
  };

  const handleLogout = () => {
    // Direct logout for smoother UX (or replace with custom modal later)
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* UNIFIED GRADIENT BACKGROUND - matching other tabs */}
      {/* PREMIUM DYNAMIC BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 via-green-500 to-green-50" />
        {/* Animated orbs for depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-white/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[-20%] w-[60%] h-[40%] bg-emerald-400/20 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-0 w-32 h-32 bg-yellow-200/10 rounded-full blur-[80px]" />
      </div>

      {/* Max-width container for mobile-like appearance */}
      <div className="max-w-md mx-auto min-h-screen relative z-10">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PREMIUM HEADER */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="relative px-6 pt-12 pb-24 overflow-hidden">
          <div className="relative z-10">
            {/* Header Top row */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-white text-2xl font-black tracking-tight">Cá Nhân</h1>
              <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Farmer Passport</span>
              </div>
            </div>

            {/* Profile Info Card - Minimalist Glassmorphism */}
            <div className="flex items-center gap-5">
              {/* Avatar with Ring */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-[32px] overflow-hidden ring-4 ring-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={FARMER_DATA.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-emerald-600 shadow-lg" />
              </div>

              {/* Name & Title */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white text-2xl font-black">{FARMER_DATA.displayName}</h2>
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-white/80 text-sm font-semibold tracking-wide uppercase">{FARMER_DATA.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-100 bg-emerald-700/30 px-2 py-0.5 rounded-lg border border-emerald-400/20">
                    <span className="text-[10px] font-bold">VIP FARMER</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/60">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[11px] font-medium">Gia Lai, VN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* FEATURE CARDS GRID */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="px-6 -mt-16 relative z-20 mb-8">
          {/* EUDR Verification Premium Card */}
          <button
            onClick={() => setShowFullMap(true)}
            className="w-full relative overflow-hidden group bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all duration-500 border border-white/50"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-blue-500/10 transition-colors" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10 group-hover:bg-emerald-500/10 transition-colors" />

            <div className="flex items-center gap-6 relative z-10">
              {/* Icon with animated glass effect */}
              <div className="relative">
                <div className="w-18 h-18 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500 p-4">
                  <Shield className="w-full h-full text-white" strokeWidth={2.5} />
                </div>
                {/* Status indicator pulse */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>

              {/* Text Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-gray-900 font-extrabold text-xl tracking-tight">Xác Thực</h3>
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider">Tình trạng: An toàn</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium leading-tight mb-2">
                  Tiêu chuẩn EUDR & Truy xuất nguồn gốc
                </p>
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold">Dữ liệu đã được đồng bộ 2026</span>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <Globe className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SETTINGS SECTION */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="px-6">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Cài Đặt</h3>

          <div className="bg-white rounded-3xl shadow-lg overflow-hidden divide-y divide-gray-100">
            {/* Profile Settings */}
            <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900 font-semibold text-sm">Thông Tin Cá Nhân</div>
                <div className="text-gray-500 text-xs">Chỉnh sửa hồ sơ</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            {/* Privacy */}
            <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900 font-semibold text-sm">Bảo Mật</div>
                <div className="text-gray-500 text-xs">Quyền riêng tư</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            {/* Language */}
            <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌐</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900 font-semibold text-sm">Ngôn Ngữ</div>
                <div className="text-gray-500 text-xs">Tiếng Việt</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            {/* About */}
            <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">ℹ️</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900 font-semibold text-sm">Về Ứng Dụng</div>
                <div className="text-gray-500 text-xs">Phiên bản 1.0.0</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* LOGOUT BUTTON */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="px-6 mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform"
          >
            <LogOut className="w-6 h-6 text-white" strokeWidth={2.5} />
            <span className="text-white text-lg font-bold">Đăng Xuất</span>
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-6"></div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* FULLSCREEN MAP OVERLAY */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {showFullMap && (
          <div className="fixed inset-0 z-[9999] bg-slate-900">
            <div className="absolute top-4 right-4 z-[10000]">
              <button
                onClick={() => setShowFullMap(false)}
                className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full h-full">
              <Suspense fallback={<MapPlaceholder />}>
                <EudrCheckFeature
                  onComplete={handleComplete}
                  onCancel={() => setShowFullMap(false)}
                  farmerName={FARMER_DATA.displayName}
                  farmId="CF-GL-2026-889"
                />
              </Suspense>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
