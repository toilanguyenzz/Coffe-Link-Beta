/**
 * DemoHubContext.tsx - Hub Context cho Demo Mode
 * Auto-assign mock hub, skip GPS
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Hub, SeasonMode } from '../types';
import { useDemoAuth } from './DemoAuthContext';
import * as MockDataService from '../services/MockDataService';

interface DemoHubContextType {
    currentHub: Hub | null;
    seasonMode: SeasonMode;
    loading: boolean;
    error: string | null;

    // These are no-ops in demo mode but kept for compatibility
    locationPermission: 'granted' | 'denied' | 'prompt';
    isManualLocation: boolean;
    requestLocationAndRoute: () => void;

    // Demo specific
    switchHub: (hubId: string) => void;
    toggleSeasonMode: () => void;
}

const DemoHubContext = createContext<DemoHubContextType | undefined>(undefined);

export const useDemoHub = () => {
    const context = useContext(DemoHubContext);
    if (!context) {
        throw new Error('useDemoHub must be used within a DemoHubProvider');
    }
    return context;
};

// Alias for compatibility
export const useHub = useDemoHub;

export const DemoHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userProfile } = useDemoAuth();
    const [currentHub, setCurrentHub] = useState<Hub | null>(null);
    const [seasonMode, setSeasonMode] = useState<SeasonMode>('CARE');
    const [loading, setLoading] = useState(true);

    // Auto-load hub based on user profile
    useEffect(() => {
        if (userProfile?.hubId) {
            const hub = MockDataService.getHub(userProfile.hubId);
            if (hub) {
                setCurrentHub(hub);
                setSeasonMode(hub.seasonMode);
            }
        } else {
            // Default to first hub for demo
            const allHubs = MockDataService.getAllHubs();
            if (allHubs.length > 0) {
                setCurrentHub(allHubs[0]);
                setSeasonMode(allHubs[0].seasonMode);
            }
        }
        setLoading(false);
    }, [userProfile]);

    const switchHub = useCallback((hubId: string) => {
        const hub = MockDataService.getHub(hubId);
        if (hub) {
            setCurrentHub(hub);
            setSeasonMode(hub.seasonMode);
        }
    }, []);

    const toggleSeasonMode = useCallback(() => {
        setSeasonMode(prev => prev === 'CARE' ? 'HARVEST' : 'CARE');
    }, []);

    // No-op for demo
    const requestLocationAndRoute = useCallback(() => {
        console.log('[Demo Mode] GPS request skipped - using mock hub');
    }, []);

    const value: DemoHubContextType = {
        currentHub,
        seasonMode,
        loading,
        error: null,
        locationPermission: 'granted',
        isManualLocation: false,
        requestLocationAndRoute,
        switchHub,
        toggleSeasonMode
    };

    return (
        <DemoHubContext.Provider value={value}>
            {children}
        </DemoHubContext.Provider>
    );
};

// Export alias
export const HubProvider = DemoHubProvider;
