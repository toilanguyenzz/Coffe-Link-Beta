import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HubProvider } from './contexts/HubContext';
import { ToolsProvider } from './contexts/ToolsContext';
import { DiaryProvider } from './contexts/DiaryContext';
import { FarmDataProvider } from './contexts/FarmDataContext';
import { ReminderProvider } from './contexts/ReminderContext';
import { GreenPointsProvider } from './contexts/GreenPointsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';

// Farmer Pages
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Survey from './pages/Survey';
import FarmConsultation from './pages/FarmConsultation';
import GardenScanner from './pages/GardenScanner';
import FarmSetup from './pages/FarmSetup';
import HubDashboard from './pages/HubDashboard';
import HubLeaderDashboard from './pages/HubLeaderDashboard';
import Workers from './pages/Workers';
import EudrCheck from './pages/EudrCheck';

// Agent Components
import AgentHomeDashboard from './components/agent/AgentHomeDashboard';
import PurchaseFlow from './components/agent/PurchaseFlow';
import DebtLedger from './components/agent/DebtLedger';
import InventoryDashboard from './components/agent/InventoryDashboard';

// Navigators
import FarmerNavigator from './components/navigation/FarmerNavigator';
import MerchantNavigator from './components/navigation/MerchantNavigator';

// Common Components
import ReminderToast from './components/common/ReminderToast';
import WeatherAlertBanner from './components/common/WeatherAlertBanner';
// import GlobalVoiceFAB from './components/voice/GlobalVoiceFAB';

const RoleBasedRoutes = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // AGENT / MERCHANT STACK
  // ---------------------------------------------------------
  if (userProfile.role === 'agent') {
    return (
      <Routes>
        <Route element={<MerchantNavigator />}>
          <Route path="merchant/dashboard" element={<AgentHomeDashboard />} />
          <Route path="merchant/purchase" element={<PurchaseFlow />} />
          <Route path="merchant/ledger" element={<DebtLedger />} />
          <Route path="merchant/inventory" element={<InventoryDashboard />} />

          {/* Redirect /agent to new structure if needed, or catch-all to dashboard */}
          <Route path="*" element={<Navigate to="/merchant/dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  // FARMER STACK (Default)
  // ---------------------------------------------------------
  return (
    <Routes>
      <Route element={<FarmerNavigator />}>
        {/* Helper to redirect legacy root to Dashboard or EudrCheck */}
        <Route path="/" element={<EudrCheck />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/consult" element={<FarmConsultation />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/scan" element={<GardenScanner />} />
        <Route path="/farm-setup" element={<FarmSetup />} />

        {/* Hub Related */}
        <Route path="/hub" element={<HubDashboard />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/hub-leader" element={<HubLeaderDashboard />} />
        <Route path="/eudr-check" element={<EudrCheck />} />

        {/* Catch all for farmers */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HubProvider>
        <ToolsProvider>
          <DiaryProvider>
            <FarmDataProvider>
              <ReminderProvider>
                <GreenPointsProvider>
                  {/* Global Components */}
                  <ReminderToast />
                  <WeatherAlertBanner />


                  <Router>
                    {/* GlobalVoiceFAB temporarily disabled - causing crash */}
                    {/* <GlobalVoiceFAB /> */}
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Onboarding is special, might overlap both? For now keep it separate or protected */}
                      <Route
                        path="/onboarding"
                        element={
                          <ProtectedRoute>
                            <Onboarding />
                          </ProtectedRoute>
                        }
                      />

                      {/* Main Role-Based Gateway */}
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute>
                            <RoleBasedRoutes />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Router>
                </GreenPointsProvider>
              </ReminderProvider>
            </FarmDataProvider>
          </DiaryProvider>
        </ToolsProvider>
      </HubProvider>
    </AuthProvider>
  );
}
