import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Sprout, ShoppingBag, HelpCircle, User } from 'lucide-react';

const FarmerNavigator: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content Area */}
            <div className="pb-20">
                <Outlet />
            </div>

            {/* Bottom Navigation Bar - Only for Farmers */}
            <div className="fixed bottom-0 left-0 right-0 z-[900] bg-white border-t border-gray-200 pb-safe">
                <div className="mx-auto flex h-16 max-w-screen-sm items-center justify-around px-2">
                    <NavButton
                        active={isActive('/')} // Home
                        onClick={() => navigate('/')}
                        icon={Home}
                        label="Trang chủ"
                    />

                    <NavButton
                        active={isActive('/hub') || isActive('/hub-leader')}
                        onClick={() => navigate('/hub')}
                        icon={Sprout}
                        label="Vườn tược"
                    />

                    <NavButton
                        active={isActive('/market')}
                        onClick={() => navigate('/market')}
                        icon={ShoppingBag}
                        label="Chợ"
                    />

                    {/* <NavButton
                        active={isActive('/consult')}
                        onClick={() => navigate('/consult')}
                        icon={HelpCircle}
                        label="Hỗ trợ"
                    /> */}

                    <NavButton
                        active={isActive('/profile')}
                        onClick={() => navigate('/profile')}
                        icon={User}
                        label="Cá nhân"
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
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2 transition-all active:scale-95 min-w-[60px]"
    >
        <Icon
            className={`h-6 w-6 transition-colors ${active ? 'text-[#2E7D32]' : 'text-gray-400'
                }`}
            strokeWidth={active ? 2.5 : 2}
        />
        <span className={`text-[10px] font-medium transition-colors ${active ? 'text-[#2E7D32]' : 'text-gray-500'
            }`}>
            {label}
        </span>
    </button>
);

export default FarmerNavigator;
