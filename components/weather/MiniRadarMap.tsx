/**
 * MiniRadarMap.tsx
 * 
 * Bản đồ Radar mini hiển thị các cảnh báo từ nông dân hàng xóm
 * Sử dụng Leaflet để vẽ map với markers cho alerts
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import { CloudRain, Zap, X } from 'lucide-react';
import {
    getAlertsByRadius,
    formatTimeAgo,
    getAlertTypeLabel,
    type CommunityAlert,
} from '../../services/CommunityAlertService';
import 'leaflet/dist/leaflet.css';

interface MiniRadarMapProps {
    userLat: number;
    userLng: number;
    radiusKm?: number;
    onExpand?: () => void;
}

const MiniRadarMap: React.FC<MiniRadarMapProps> = ({
    userLat,
    userLng,
    radiusKm = 5,
    onExpand,
}) => {
    const [alerts, setAlerts] = useState<CommunityAlert[]>([]);

    useEffect(() => {
        // Fetch alerts on mount and periodically
        const fetchAlerts = () => {
            const nearbyAlerts = getAlertsByRadius(userLat, userLng, radiusKm);
            setAlerts(nearbyAlerts);
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s

        return () => clearInterval(interval);
    }, [userLat, userLng, radiusKm]);

    // Alert type to color mapping
    const getAlertColor = (type: CommunityAlert['type']): string => {
        const colors: Record<string, string> = {
            rain: '#3b82f6',
            storm: '#8b5cf6',
            pest: '#22c55e',
            hail: '#06b6d4',
            drought: '#f97316',
        };
        return colors[type] || '#ef4444';
    };

    return (
        <div
            className="rounded-2xl overflow-hidden relative"
            style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-bold">Radar Cộng Đồng</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs">
                        {alerts.length} cảnh báo gần đây
                    </span>
                    {alerts.length > 0 && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="h-48 relative">
                <MapContainer
                    center={[userLat, userLng]}
                    zoom={12}
                    className="h-full w-full"
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* User location (center) */}
                    <CircleMarker
                        center={[userLat, userLng]}
                        radius={8}
                        pathOptions={{
                            fillColor: '#22c55e',
                            fillOpacity: 1,
                            color: 'white',
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <span className="font-bold">📍 Vị trí của bạn</span>
                        </Popup>
                    </CircleMarker>

                    {/* Radius circle */}
                    <Circle
                        center={[userLat, userLng]}
                        radius={radiusKm * 1000}
                        pathOptions={{
                            fillColor: '#3b82f6',
                            fillOpacity: 0.1,
                            color: '#3b82f6',
                            weight: 1,
                            dashArray: '5, 5',
                        }}
                    />

                    {/* Alert markers */}
                    {alerts.map((alert) => (
                        <CircleMarker
                            key={alert.id}
                            center={alert.location}
                            radius={10}
                            pathOptions={{
                                fillColor: getAlertColor(alert.type),
                                fillOpacity: 0.8,
                                color: 'white',
                                weight: 2,
                            }}
                        >
                            <Popup>
                                <div className="text-sm p-1">
                                    <p className="font-bold">{getAlertTypeLabel(alert.type)}</p>
                                    <p className="text-gray-600">{alert.reporterName}</p>
                                    <p className="text-gray-500 text-xs">
                                        Cách {alert.distanceKm}km • {formatTimeAgo(alert.timestamp)}
                                    </p>
                                    {alert.message && (
                                        <p className="text-gray-700 mt-1 italic">"{alert.message}"</p>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>

                {/* Overlay gradient */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-white/50 text-[10px]">Mưa</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-white/50 text-[10px]">Bão</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-white/50 text-[10px]">Bạn</span>
                </div>
            </div>
        </div>
    );
};

export default MiniRadarMap;
