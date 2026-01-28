/**
 * DemoAuthContext.tsx - Auth Context cho Demo Mode
 * Bypass Firebase, dùng Mock Data + LocalStorage
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types';
import * as MockDataService from '../services/MockDataService';
import * as LocalStorage from '../services/LocalStorageService';

// ============ DEMO MODE FLAG ============
// Set to false to use Firebase Auth
export const DEMO_MODE = true;

interface DemoAuthContextType {
    currentUser: { uid: string; email: string; displayName: string } | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isDemoMode: boolean;

    // Demo login functions
    demoLoginAsFarmer: () => void;
    demoLoginAsHubLeader: () => void;
    demoLoginAsAgent: () => void;
    logout: () => void;
    refreshProfile: () => void;

    // Legacy compatibility
    updateFarmingMethod: (type: 'organic' | 'traditional') => Promise<void>;
    loginWithGoogle: () => Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export const useDemoAuth = () => {
    const context = useContext(DemoAuthContext);
    if (!context) {
        throw new Error('useDemoAuth must be used within a DemoAuthProvider');
    }
    return context;
};

// Alias for compatibility
export const useAuth = useDemoAuth;

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; displayName: string } | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = () => {
            if (LocalStorage.isDemoMode()) {
                const userId = LocalStorage.getCurrentUserId();
                if (userId) {
                    const profile = MockDataService.getUser(userId);
                    if (profile) {
                        setCurrentUser({
                            uid: profile.uid,
                            email: profile.email,
                            displayName: profile.displayName
                        });
                        setUserProfile(profile);
                    }
                }
            }
            setLoading(false);
        };

        checkSession();
    }, []);

    const demoLoginAsFarmer = useCallback(() => {
        const profile = MockDataService.demoLogin('farmer');
        setCurrentUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName
        });
        setUserProfile(profile);
    }, []);

    const demoLoginAsHubLeader = useCallback(() => {
        const profile = MockDataService.demoLogin('hub_leader');
        setCurrentUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName
        });
        setUserProfile(profile);
    }, []);

    const demoLoginAsAgent = useCallback(() => {
        const profile = MockDataService.demoLogin('agent');
        setCurrentUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName
        });
        setUserProfile(profile);
    }, []);

    const logout = useCallback(() => {
        MockDataService.demoLogout();
        setCurrentUser(null);
        setUserProfile(null);
    }, []);

    const refreshProfile = useCallback(() => {
        const userId = LocalStorage.getCurrentUserId();
        if (userId) {
            const profile = MockDataService.getUser(userId);
            if (profile) {
                setUserProfile(profile);
            }
        }
    }, []);

    // Legacy compatibility - no-op in demo mode
    const updateFarmingMethod = async (_type: 'organic' | 'traditional') => {
        console.log('[Demo Mode] updateFarmingMethod called - no-op');
    };

    const loginWithGoogle = async () => {
        console.log('[Demo Mode] loginWithGoogle called - use demo login instead');
        demoLoginAsFarmer();
    };

    const value: DemoAuthContextType = {
        currentUser,
        userProfile,
        loading,
        isDemoMode: DEMO_MODE,
        demoLoginAsFarmer,
        demoLoginAsHubLeader,
        demoLoginAsAgent,
        logout,
        refreshProfile,
        updateFarmingMethod,
        loginWithGoogle
    };

    return (
        <DemoAuthContext.Provider value={value}>
            {!loading && children}
        </DemoAuthContext.Provider>
    );
};

// Export AuthProvider alias for easy switching
export const AuthProvider = DemoAuthProvider;
