/**
 * HubContext.tsx
 * Context quản lý state Hub cho toàn app
 * Tầng 1: Infrastructure - Hub-Centric Architecture
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Hub, SeasonMode } from '../types';
import { useAuth } from './AuthContext';
import {
    getHubById,
    getNearestHub,
    autoRouteUserToHub,
    findHubByAddress,
    assignUserToHub,
    onSeasonModeChange
} from '../services/HubService';

interface HubContextType {
    // Current Hub data
    currentHub: Hub | null;
    seasonMode: SeasonMode;
    loading: boolean;
    error: string | null;

    // Location status
    locationPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
    isManualLocation: boolean;

    // Actions
    requestLocationAndRoute: () => Promise<boolean>;
    selectHubManually: (
        provinceCode: string,
        districtCode: string,
        wardCode: string
    ) => Promise<boolean>;
    refreshHub: () => Promise<void>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export const useHub = () => {
    const context = useContext(HubContext);
    if (!context) {
        throw new Error('useHub must be used within a HubProvider');
    }
    return context;
};

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, userProfile } = useAuth();

    const [currentHub, setCurrentHub] = useState<Hub | null>(null);
    const [seasonMode, setSeasonMode] = useState<SeasonMode>('CARE');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
    const [isManualLocation, setIsManualLocation] = useState(false);

    // Load Hub khi user profile thay đổi
    useEffect(() => {
        const loadHub = async () => {
            if (!userProfile) {
                setCurrentHub(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Nếu user đã có hubId
                if (userProfile.hubId) {
                    const hub = await getHubById(userProfile.hubId);
                    if (hub) {
                        setCurrentHub(hub);
                        setSeasonMode(hub.seasonMode);
                        setIsManualLocation(userProfile.isManualLocation || false);
                    }
                }
            } catch (err) {
                console.error('Error loading hub:', err);
                setError('Không thể tải thông tin trạm');
            } finally {
                setLoading(false);
            }
        };

        loadHub();
    }, [userProfile]);

    // Realtime listener cho Season Mode
    useEffect(() => {
        if (!currentHub?.id) return;

        const unsubscribe = onSeasonModeChange(currentHub.id, (mode) => {
            setSeasonMode(mode);
        });

        return () => unsubscribe();
    }, [currentHub?.id]);

    /**
     * Request GPS permission và auto-route user
     */
    const requestLocationAndRoute = useCallback(async (): Promise<boolean> => {
        if (!currentUser) return false;

        try {
            // Check permission state
            if (navigator.permissions) {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
            }

            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        setLocationPermission('granted');
                        const { latitude, longitude } = position.coords;

                        // Auto-route to nearest hub
                        const hub = await autoRouteUserToHub(currentUser.uid, latitude, longitude);

                        if (hub) {
                            setCurrentHub(hub);
                            setSeasonMode(hub.seasonMode);
                            setIsManualLocation(false);
                            resolve(true);
                        } else {
                            setError('Không tìm thấy trạm nào trong khu vực của bạn');
                            resolve(false);
                        }
                    },
                    (err) => {
                        console.error('Geolocation error:', err);
                        setLocationPermission('denied');
                        resolve(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes cache
                    }
                );
            });
        } catch (err) {
            console.error('Error requesting location:', err);
            return false;
        }
    }, [currentUser]);

    /**
     * Chọn Hub thủ công qua địa chỉ (khi GPS denied)
     */
    const selectHubManually = useCallback(async (
        provinceCode: string,
        districtCode: string,
        wardCode: string
    ): Promise<boolean> => {
        if (!currentUser) return false;

        try {
            setLoading(true);

            // Tìm Hub theo địa chỉ
            const hub = await findHubByAddress(provinceCode, districtCode, wardCode);

            if (hub) {
                // Gán user vào Hub với flag isManual
                const success = await assignUserToHub(
                    currentUser.uid,
                    hub.id,
                    true,
                    { provinceCode, districtCode, wardCode }
                );

                if (success) {
                    setCurrentHub(hub);
                    setSeasonMode(hub.seasonMode);
                    setIsManualLocation(true);
                    return true;
                }
            }

            setError('Không tìm thấy trạm phục vụ khu vực này');
            return false;
        } catch (err) {
            console.error('Error selecting hub manually:', err);
            setError('Có lỗi xảy ra khi chọn trạm');
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    /**
     * Refresh Hub data
     */
    const refreshHub = useCallback(async () => {
        if (!userProfile?.hubId) return;

        const hub = await getHubById(userProfile.hubId);
        if (hub) {
            setCurrentHub(hub);
            setSeasonMode(hub.seasonMode);
        }
    }, [userProfile?.hubId]);

    const value = {
        currentHub,
        seasonMode,
        loading,
        error,
        locationPermission,
        isManualLocation,
        requestLocationAndRoute,
        selectHubManually,
        refreshHub
    };

    return (
        <HubContext.Provider value={value}>
            {children}
        </HubContext.Provider>
    );
};
