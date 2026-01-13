import React from 'react';
import { Home, CircleDollarSign, UserSquare2, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[900] w-full max-w-[90%] sm:max-w-md">
      <div className="flex h-[4.5rem] items-center justify-between rounded-[2.5rem] bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 shadow-2xl px-6 ring-1 ring-black/5">
        
        <NavButton 
          active={isActive('/')} 
          onClick={() => navigate('/')} 
          icon={Home} 
          // label="Vườn" 
        />
        
        <NavButton 
          active={isActive('/market')} 
          onClick={() => navigate('/market')} 
          icon={ShoppingBag} 
          // label="Chợ" 
        />

        <NavButton 
          active={isActive('/finance')} 
          onClick={() => navigate('/finance')} 
          icon={CircleDollarSign} 
          // label="Tiền" 
        />
        
        <NavButton 
          active={isActive('/profile')} 
          onClick={() => navigate('/profile')} 
          icon={UserSquare2} 
          // label="Tôi" 
        />

      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon }) => (
  <button 
    onClick={onClick} 
    className="group relative flex flex-col items-center justify-center transition-all active:scale-90"
  >
    <div className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${active ? 'bg-white text-black translate-y-[-20%] shadow-lg shadow-white/20' : 'bg-transparent text-gray-400 group-hover:text-white'}`}>
       <Icon className={`h-6 w-6 transition-all ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
    </div>
    {active && (
        <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-white"></span>
    )}
  </button>
);

export default BottomNav;