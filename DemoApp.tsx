import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DemoAuthProvider, useDemoAuth } from './contexts/DemoAuthContext';
import { DemoHubProvider } from './contexts/DemoHubContext';
import { ToolsProvider } from './contexts/ToolsContext';
import { DiaryProvider } from './contexts/DiaryContext';
import { FarmDataProvider } from './contexts/FarmDataContext';
import { ReminderProvider } from './contexts/ReminderContext';
import { GreenPointsProvider } from './contexts/GreenPointsContext';
import { MascotProvider } from './contexts/MascotContext';

// Pages
import DemoLogin from './pages/auth/DemoLogin';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import FarmConsultation from './pages/FarmConsultation';
import GardenScanner from './pages/GardenScanner';
import FarmSetup from './pages/FarmSetup';
import HubDashboard from './pages/HubDashboard';
import HubLeaderDashboard from './pages/HubLeaderDashboard';
import Workers from './pages/Workers';
import WorkerManagerScreen from './pages/WorkerManagerScreen';
import EudrCheck from './pages/EudrCheck';

// Labor Manager Components
import AdvanceLog from './components/labor/AdvanceLog';
import SmartCalculator from './components/labor/SmartCalculator';
import DigitalReceipt from './components/labor/DigitalReceipt';

// Labor Lite Components (Simple Worker Tracking)
import SimpleLaborHome from './components/labor-lite/SimpleLaborHome';
import SimpleCalculation from './components/labor-lite/SimpleCalculation';
import NewSession from './components/labor-lite/NewSession';

// Agent Components
import AgentHomeDashboard from './components/agent/AgentHomeDashboard';
import PurchaseFlow from './components/agent/PurchaseFlow';
import DebtLedger from './components/agent/DebtLedger';
import InventoryDashboard from './components/agent/InventoryDashboard';

// Navigators
import FarmerNavigator from './components/navigation/FarmerNavigator';
import MerchantNavigator from './components/navigation/MerchantNavigator';

// Components
import ReminderToast from './components/common/ReminderToast';
import WeatherAlertBanner from './components/common/WeatherAlertBanner';


// Role Based Routing Logic
const RoleBasedDemoRoutes: React.FC = () => {
    const { userProfile, loading } = useDemoAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    // MERCHANT / AGENT STACK
    if (userProfile.role === 'agent') {
        return (
            <Routes>
                <Route element={<MerchantNavigator />}>
                    <Route path="merchant/dashboard" element={<AgentHomeDashboard />} />
                    <Route path="merchant/purchase" element={<PurchaseFlow />} />
                    <Route path="merchant/ledger" element={<DebtLedger />} />
                    <Route path="merchant/inventory" element={<InventoryDashboard />} />

                    {/* Default redirect for Agent */}
                    <Route path="*" element={<Navigate to="/merchant/dashboard" replace />} />
                </Route>
            </Routes>
        );
    }

    // FARMER / HUB LEADER STACK (Default)
    return (
        <Routes>
            <Route element={<FarmerNavigator />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="market" element={<Marketplace />} />
                <Route path="consult" element={<FarmConsultation />} />
                <Route path="finance" element={<Finance />} />
                <Route path="profile" element={<Profile />} />
                <Route path="scan" element={<GardenScanner />} />
                <Route path="farm-setup" element={<FarmSetup />} />

                {/* Hub & Labor Routes */}
                <Route path="hub" element={<HubDashboard />} />
                <Route path="workers" element={<Workers />} />
                <Route path="hub-leader" element={<HubLeaderDashboard />} />

                {/* Labor Manager */}
                <Route path="labor/advances" element={<AdvanceLog />} />
                <Route path="labor/calculator" element={<SmartCalculator />} />
                <Route path="labor/receipt" element={<DigitalReceipt />} />

                {/* Labor Lite */}
                <Route path="labor-lite" element={<SimpleLaborHome />} />
                <Route path="labor-lite/calculate" element={<SimpleCalculation />} />
                <Route path="labor-lite/new" element={<NewSession />} />

                <Route path="worker-manager" element={<WorkerManagerScreen />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default function DemoApp() {
    return (
        <DemoAuthProvider>
            <DemoHubProvider>
                <ToolsProvider>
                    <DiaryProvider>
                        <FarmDataProvider>
                            <ReminderProvider>
                                <GreenPointsProvider>
                                    <MascotProvider>
                                        {/* Global Components */}
                                        <ReminderToast />
                                        <WeatherAlertBanner />

                                        <Router>
                                            <Routes>
                                                <Route path="/login" element={<DemoLogin />} />

                                                {/* Main Role-Based Gateway */}
                                                <Route path="/*" element={<RoleBasedDemoRoutes />} />
                                            </Routes>
                                        </Router>
                                    </MascotProvider>
                                </GreenPointsProvider>
                            </ReminderProvider>
                        </FarmDataProvider>
                    </DiaryProvider>
                </ToolsProvider>
            </DemoHubProvider>
        </DemoAuthProvider>
    );
}
