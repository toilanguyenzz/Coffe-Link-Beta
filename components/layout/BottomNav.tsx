import React from 'react';
import { Home, HelpCircle, User, Sprout, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[900] px-4 pb-4">
      {/* Floating glassmorphism container */}
      <div
        className="mx-auto max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1), 0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        <div className="flex h-[72px] items-center justify-around px-2">

          <NavButton
            active={isActive('/')}
            onClick={() => navigate('/')}
            icon={Home}
            label="Trang chủ"
            activeColor="#16A34A"
          />

          <NavButton
            active={isActive('/hub') || isActive('/hub-leader')}
            onClick={() => navigate('/hub')}
            icon={Sprout}
            label="Vườn tược"
            activeColor="#059669"
          />

          <NavButton
            active={isActive('/market')}
            onClick={() => navigate('/market')}
            icon={ShoppingBag}
            label="Chợ"
            activeColor="#D97706"
          />

          <NavButton
            active={isActive('/consult')}
            onClick={() => navigate('/consult')}
            icon={HelpCircle}
            label="Hỗ trợ"
            activeColor="#7C3AED"
          />

          <NavButton
            active={isActive('/profile')}
            onClick={() => navigate('/profile')}
            icon={User}
            label="Cá nhân"
            activeColor="#0EA5E9"
          />

        </div>
      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  activeColor: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label, activeColor }) => (
  <button
    onClick={onClick}
    className={`
      relative flex flex-col items-center justify-center gap-1 
      min-w-[60px] py-2.5 px-3 rounded-xl
      transition-all duration-300 ease-out
      active:scale-90 cursor-pointer
      ${active
        ? 'scale-105'
        : 'hover:bg-gray-100/50'
      }
    `}
    style={active ? {
      background: `linear-gradient(135deg, ${activeColor}15 0%, ${activeColor}08 100%)`,
    } : undefined}
  >
    {/* Active indicator glow */}
    {active && (
      <div
        className="absolute inset-0 rounded-xl opacity-40 blur-md -z-10"
        style={{ backgroundColor: activeColor }}
      />
    )}

    {/* Icon container with pill background when active */}
    <div
      className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300 ease-out
        ${active ? 'scale-110' : ''}
      `}
      style={active ? {
        background: `linear-gradient(135deg, ${activeColor} 0%, ${activeColor}CC 100%)`,
        boxShadow: `0 4px 15px ${activeColor}50`,
      } : undefined}
    >
      <Icon
        className={`
          h-5 w-5 transition-all duration-300
          ${active ? 'text-white' : 'text-gray-500'}
        `}
        strokeWidth={active ? 2.5 : 1.8}
      />
    </div>

    {/* Label */}
    <span
      className={`
        text-[11px] font-semibold tracking-tight
        transition-all duration-300
        ${active ? 'opacity-100' : 'opacity-70'}
      `}
      style={{ color: active ? activeColor : '#6B7280' }}
    >
      {label}
    </span>

    {/* Active dot indicator */}
    {active && (
      <div
        className="absolute -bottom-0.5 w-1 h-1 rounded-full animate-pulse"
        style={{ backgroundColor: activeColor }}
      />
    )}
  </button>
);

export default BottomNav;
