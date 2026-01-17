import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToolsProvider } from './contexts/ToolsContext';
import { DiaryProvider } from './contexts/DiaryContext';
import { FarmDataProvider } from './contexts/FarmDataContext';
import { ReminderProvider } from './contexts/ReminderContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Survey from './pages/Survey';
import FarmConsultation from './pages/FarmConsultation';
import GardenScanner from './pages/GardenScanner';
import FarmSetup from './pages/FarmSetup';
import ReminderToast from './components/common/ReminderToast';
import WeatherAlertBanner from './components/common/WeatherAlertBanner';
import GlobalVoiceFAB from './components/voice/GlobalVoiceFAB';

export default function App() {
  return (
    <AuthProvider>
      <ToolsProvider>
        <DiaryProvider>
          <FarmDataProvider>
            <ReminderProvider>
              {/* Global Components */}
              <ReminderToast />
              <WeatherAlertBanner />

              <Router>
                {/* Global Voice FAB - Hiện ở tất cả các trang */}
                <GlobalVoiceFAB />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/market"
                    element={
                      <ProtectedRoute>
                        <Marketplace />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/consult"
                    element={
                      <ProtectedRoute>
                        <FarmConsultation />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/finance"
                    element={
                      <ProtectedRoute>
                        <Finance />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/survey"
                    element={
                      <ProtectedRoute>
                        <Survey />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/scan"
                    element={
                      <ProtectedRoute>
                        <GardenScanner />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />

                  <Route
                    path="/farm-setup"
                    element={
                      <ProtectedRoute>
                        <FarmSetup />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Router>
            </ReminderProvider>
          </FarmDataProvider>
        </DiaryProvider>
      </ToolsProvider>
    </AuthProvider>
  );
}

