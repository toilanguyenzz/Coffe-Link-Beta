/**
 * FarmDataContext.tsx
 * 
 * React Context for sharing farm data across the application.
 * This allows the Profile (map) page to share farm boundary data
 * with the Consultation page automatically.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// --- TYPES ---

export interface FarmBoundary {
    coordinates: [number, number][];  // Polygon points [lat, lng][]
    areaHectares: number;
    areaSquareMeters: number;
    centerPoint: { lat: number; lng: number };
}

export interface FarmInfo {
    boundary: FarmBoundary | null;
    treeCount: number;
    lastUpdated: Date | null;
}

interface FarmDataContextType {
    farmInfo: FarmInfo;
    setFarmBoundary: (boundary: FarmBoundary) => void;
    setTreeCount: (count: number) => void;
    hasFarmData: boolean;
    clearFarmData: () => void;
}

// --- DEFAULT VALUES ---

const defaultFarmInfo: FarmInfo = {
    boundary: null,
    treeCount: 0,
    lastUpdated: null,
};

// --- CONTEXT ---

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

// --- PROVIDER ---

interface FarmDataProviderProps {
    children: ReactNode;
}

export const FarmDataProvider: React.FC<FarmDataProviderProps> = ({ children }) => {
    const [farmInfo, setFarmInfo] = useState<FarmInfo>(defaultFarmInfo);

    const setFarmBoundary = useCallback((boundary: FarmBoundary) => {
        setFarmInfo(prev => ({
            ...prev,
            boundary,
            lastUpdated: new Date(),
        }));
    }, []);

    const setTreeCount = useCallback((count: number) => {
        setFarmInfo(prev => ({
            ...prev,
            treeCount: count,
            lastUpdated: new Date(),
        }));
    }, []);

    const clearFarmData = useCallback(() => {
        setFarmInfo(defaultFarmInfo);
    }, []);

    const hasFarmData = farmInfo.boundary !== null && farmInfo.boundary.areaHectares > 0;

    return (
        <FarmDataContext.Provider
            value={{
                farmInfo,
                setFarmBoundary,
                setTreeCount,
                hasFarmData,
                clearFarmData,
            }}
        >
            {children}
        </FarmDataContext.Provider>
    );
};

// --- HOOK ---

export const useFarmData = (): FarmDataContextType => {
    const context = useContext(FarmDataContext);
    if (context === undefined) {
        throw new Error('useFarmData must be used within a FarmDataProvider');
    }
    return context;
};

// --- UTILITY: Calculate center point from polygon ---

export const calculatePolygonCenter = (coordinates: [number, number][]): { lat: number; lng: number } => {
    if (coordinates.length === 0) {
        return { lat: 0, lng: 0 };
    }

    const sum = coordinates.reduce(
        (acc, [lat, lng]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }),
        { lat: 0, lng: 0 }
    );

    return {
        lat: sum.lat / coordinates.length,
        lng: sum.lng / coordinates.length,
    };
};

export default FarmDataContext;
