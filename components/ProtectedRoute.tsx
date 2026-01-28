
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/DemoAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] path:', location.pathname);
  console.log('[ProtectedRoute] user:', currentUser?.email);
  console.log('[ProtectedRoute] role:', userProfile?.role);
  console.log('[ProtectedRoute] farmingType:', userProfile?.farmingType);

  // If initial auth check is still running, show loading
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Check 1: Is user logged in?
  if (!currentUser) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check 2: Has user selected farming type?
  // Note: Skip this check for roles that don't need farmingType (agent, hub_leader)
  // Also skip if already on onboarding page to prevent loops
  const skipFarmingTypeCheck = userProfile?.role === 'agent' || userProfile?.role === 'hub_leader' || userProfile?.role === 'worker';

  console.log('[ProtectedRoute] skipFarmingTypeCheck:', skipFarmingTypeCheck);

  if (userProfile && !userProfile.farmingType && !skipFarmingTypeCheck && location.pathname !== '/onboarding') {
    console.log('[ProtectedRoute] No farming type, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Check 3: If user HAS selected farming type but tries to go to onboarding, send them home
  if (userProfile && userProfile.farmingType && location.pathname === '/onboarding') {
    console.log('[ProtectedRoute] Has farming type, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
