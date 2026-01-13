
import React from 'react';
import { Home, CircleDollarSign, UserSquare2, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[900]">
      <div className="mx-auto flex h-[4.5rem] max-w-lg items-center justify-around rounded-[2.5rem] bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 px-2">
        
        <NavButton 
          active={isActive('/')} 
          onClick={() => navigate('/')} 
          icon={Home} 
          label="Vườn" 
        />
        
        <NavButton 
          active={isActive('/market')} 
          onClick={() => navigate('/market')} 
          icon={ShoppingBag} 
          label="Chợ" 
        />

        <NavButton 
          active={isActive('/finance')} 
          onClick={() => navigate('/finance')} 
          icon={CircleDollarSign} 
          label="Tiền" 
        />
        
        <NavButton 
          active={isActive('/profile')} 
          onClick={() => navigate('/profile')} 
          icon={UserSquare2} 
          label="Tôi" 
        />

      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick} 
    className="group relative flex flex-1 flex-col items-center justify-center py-2 transition-all active:scale-90"
  >
    <div className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${active ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30 translate-y-[-10%]' : 'bg-transparent group-hover:bg-white/5'}`}>
       <Icon className={`h-5 w-5 transition-all ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} />
    </div>
    {active && (
      <span className="absolute -bottom-1 text-[9px] font-bold text-green-400 animate-in fade-in slide-in-from-bottom-2">
        {label}
      </span>
    )}
  </button>
);

export default BottomNav;
