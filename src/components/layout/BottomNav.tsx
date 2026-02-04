import React from 'react';
import { Home, HelpCircle, User, Sprout, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ', color: '#22C55E' },
    { path: '/hub', icon: Sprout, label: 'Vườn tược', color: '#10B981', altPath: '/hub-leader' },
    { path: '/market', icon: ShoppingBag, label: 'Chợ', color: '#F59E0B' },
    { path: '/consult', icon: HelpCircle, label: 'Hỗ trợ', color: '#8B5CF6' },
    { path: '/profile', icon: User, label: 'Cá nhân', color: '#0EA5E9' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[900] px-3 pb-3 pointer-events-none">
      {/* Premium floating glass container */}
      <div
        className="mx-auto max-w-md pointer-events-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(28,28,30,0.95) 0%, rgba(44,44,46,0.9) 100%)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderRadius: '28px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex h-[76px] items-center justify-around px-2">
          {navItems.map((item) => {
            const active = isActive(item.path) || (item.altPath && isActive(item.altPath));
            return (
              <NavButton
                key={item.path}
                active={!!active}
                onClick={() => navigate(item.path)}
                icon={item.icon}
                label={item.label}
                activeColor={item.color}
              />
            );
          })}
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
      group relative flex flex-col items-center justify-center gap-1
      min-w-[56px] py-2 px-1 rounded-2xl cursor-pointer
      transition-all duration-300 ease-out
      active:scale-90
      ${active ? 'translate-y-[-4px]' : 'hover:bg-white/5'}
    `}
  >
    {/* Glow effect behind active icon */}
    {active && (
      <div
        className="absolute top-1 w-10 h-10 rounded-full blur-lg opacity-50"
        style={{ backgroundColor: activeColor }}
      />
    )}

    {/* Icon container */}
    <div
      className={`
        relative flex items-center justify-center
        w-11 h-11 rounded-full
        transition-all duration-300 ease-out
      `}
      style={active ? {
        background: `linear-gradient(145deg, ${activeColor}, ${activeColor}DD)`,
        boxShadow: `0 4px 20px ${activeColor}60, 0 2px 8px ${activeColor}40`,
      } : {
        background: 'transparent',
      }}
    >
      <Icon
        className={`
          w-5 h-5 transition-all duration-300
          ${active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-gray-300'}
        `}
        strokeWidth={active ? 2.5 : 2}
      />
    </div>

    {/* Label */}
    <span
      className={`
        text-[10px] font-medium tracking-tight
        transition-all duration-300
      `}
      style={{
        color: active ? activeColor : 'rgba(156,163,175,0.9)',
        textShadow: active ? `0 0 10px ${activeColor}40` : 'none',
      }}
    >
      {label}
    </span>

    {/* Active dot indicator */}
    {active && (
      <div
        className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: activeColor,
          boxShadow: `0 0 8px ${activeColor}`,
        }}
      />
    )}
  </button>
);

export default BottomNav;