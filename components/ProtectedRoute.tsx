
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

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
    return <Navigate to="/login" replace />;
  }

  // Check 2: Has user selected farming type?
  // Note: We skip this check if the user is already on the onboarding page to prevent loops
  if (userProfile && !userProfile.farmingType && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Check 3: If user HAS selected farming type but tries to go to onboarding, send them home
  if (userProfile && userProfile.farmingType && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
