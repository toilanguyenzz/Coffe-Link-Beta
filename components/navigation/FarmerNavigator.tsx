import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Sprout, ShoppingBag, HelpCircle, User } from 'lucide-react';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import { DauDauBubble } from '../mascot';


// Tab configuration - order matters for swipe navigation
const TABS = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/hub', icon: Sprout, label: 'Vườn tược' },
    { path: '/market', icon: ShoppingBag, label: 'Chợ' },
    { path: '/consult', icon: HelpCircle, label: 'Hỗ trợ' },
    { path: '/profile', icon: User, label: 'Cá nhân' },
];

// Auto-hide delay in milliseconds
const NAV_HIDE_DELAY = 2500;

const FarmerNavigator: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-hide nav state
    const [isNavVisible, setIsNavVisible] = useState(true);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollY = useRef(0);

    // Find current tab index
    const currentIndex = useMemo(() => {
        const idx = TABS.findIndex(tab => tab.path === location.pathname);
        return idx >= 0 ? idx : 0;
    }, [location.pathname]);

    // Show nav and reset hide timer
    const showNav = useCallback(() => {
        setIsNavVisible(true);

        // Clear existing timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        // Set new hide timeout
        hideTimeoutRef.current = setTimeout(() => {
            setIsNavVisible(false);
        }, NAV_HIDE_DELAY);
    }, []);

    // Handle scroll - show on scroll up, hide on scroll down
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY.current - 10) {
                // Scrolling UP - show nav
                showNav();
            } else if (currentScrollY > lastScrollY.current + 50) {
                // Scrolling DOWN - hide nav
                setIsNavVisible(false);
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                }
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showNav]);

    // Handle tap anywhere to show nav
    useEffect(() => {
        const handleTap = () => {
            showNav();
        };

        document.addEventListener('touchstart', handleTap);
        document.addEventListener('click', handleTap);

        return () => {
            document.removeEventListener('touchstart', handleTap);
            document.removeEventListener('click', handleTap);
        };
    }, [showNav]);

    // Show nav on page change
    useEffect(() => {
        showNav();
    }, [location.pathname, showNav]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    // Navigate to adjacent tab with animation
    const navigateToTab = (direction: 'left' | 'right') => {
        if (isAnimating) return;

        const newIndex = direction === 'left'
            ? Math.min(currentIndex + 1, TABS.length - 1)
            : Math.max(currentIndex - 1, 0);

        if (newIndex !== currentIndex) {
            setSlideDirection(direction);
            setIsAnimating(true);

            // Small delay for animation feel
            setTimeout(() => {
                navigate(TABS[newIndex].path);
            }, 50);
        }
    };

    // Reset animation state after navigation
    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setSlideDirection(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [location.pathname, isAnimating]);

    // Swipe handlers
    const { onTouchStart, onTouchEnd } = useSwipeNavigation({
        threshold: 60,
        onSwipeLeft: () => navigateToTab('left'),
        onSwipeRight: () => navigateToTab('right'),
    });

    const isActive = (path: string) => location.pathname === path;

    // Animation classes
    const getAnimationClass = () => {
        if (!isAnimating || !slideDirection) return '';
        return slideDirection === 'left'
            ? 'animate-slide-in-right'
            : 'animate-slide-in-left';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Swipeable Content Area - More padding for bigger nav */}
            <div
                className={`pb-28 ${getAnimationClass()}`}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <Outlet />
            </div>

            {/* Đậu Đậu Mascot Bubble - Above Bottom Nav */}
            <DauDauBubble />

            {/* Bottom Navigation Bar - Auto-hiding with smooth animation */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[900] px-3 pb-2 transition-transform duration-300 ease-out ${isNavVisible ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                <div
                    className="mx-auto max-w-md rounded-3xl shadow-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(28,28,30,0.98) 0%, rgba(44,44,46,0.95) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                >
                    <div className="flex h-20 items-center justify-around px-2 relative">
                        {/* Animated indicator bar */}
                        <div
                            className="absolute top-0 h-1 rounded-full bg-[#22C55E] transition-all duration-300 ease-out"
                            style={{
                                width: `${100 / TABS.length - 4}%`,
                                left: `${(currentIndex * 100) / TABS.length + 2}%`,
                            }}
                        />

                        {TABS.map((tab) => (
                            <NavButton
                                key={tab.path}
                                active={isActive(tab.path)}
                                onClick={() => {
                                    if (location.pathname !== tab.path) {
                                        const targetIndex = TABS.findIndex(t => t.path === tab.path);
                                        setSlideDirection(targetIndex > currentIndex ? 'left' : 'right');
                                        setIsAnimating(true);
                                        setTimeout(() => navigate(tab.path), 50);
                                    }
                                }}
                                icon={tab.icon}
                                label={tab.label}
                            />
                        ))}
                    </div>
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
        className={`flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl transition-all duration-200 min-w-[60px] ${active ? 'bg-white/10' : 'hover:bg-white/5 active:scale-95'
            }`}
    >
        <div className={`p-2 rounded-xl transition-all duration-200 ${active ? 'bg-[#22C55E]' : ''}`}>
            <Icon
                className={`h-5 w-5 transition-colors duration-200 ${active ? 'text-white' : 'text-gray-400'
                    }`}
                strokeWidth={active ? 2.5 : 2}
            />
        </div>
        <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? 'text-white' : 'text-gray-500'
            }`}>
            {label}
        </span>
    </button>
);

export default FarmerNavigator;

