import React, { useId, useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    generateMockJRCZone,
    generateMockVNForestZone,
    zoneToLeafletCoords,
    getZoneCenter,
    JRC_ZONE_STYLE,
    VN_FOREST_STYLE
} from '../../data/mockForestData';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom GPS Marker Icon
const gpsIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF94" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#000000" opacity="0.8"/>
      <circle cx="12" cy="12" r="3" fill="#00FF94"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Zone label icon creator
const createZoneLabelIcon = (text: string, bgColor: string, borderColor: string) => new L.DivIcon({
    className: 'zone-label-icon',
    html: `
    <div style="
      background: ${bgColor};
      color: white;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: bold;
      white-space: nowrap;
      border: 2px solid ${borderColor};
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      ${text}
    </div>
  `,
    iconSize: [160, 30],
    iconAnchor: [80, 15],
});

// Component to recenter map
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

interface FarmMapProps {
    center: [number, number];
    farmPolygon: number[][];
    markerPosition: [number, number];
    showEudrZones?: boolean; // NEW: Option to show EUDR zones
}

const FarmMap: React.FC<FarmMapProps> = ({ center, farmPolygon, markerPosition, showEudrZones = true }) => {
    // Use React's useId for a stable, unique key that persists across re-renders
    const uniqueId = useId();
    // Track if component has mounted to prevent double initialization in React 18 Strict Mode
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate EUDR zones based on center
    const jrcZone = generateMockJRCZone(center[0], center[1]);
    const vnZone = generateMockVNForestZone(center[0], center[1]);
    const jrcLeafletCoords = zoneToLeafletCoords(jrcZone);
    const vnLeafletCoords = zoneToLeafletCoords(vnZone);
    const jrcCenter = getZoneCenter(jrcZone);
    const vnCenter = getZoneCenter(vnZone);

    useEffect(() => {
        // Delay mounting to ensure DOM is ready and prevent double initialization
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);

        return () => {
            clearTimeout(timer);
            setIsMounted(false);
        };
    }, []);

    if (!isMounted) {
        // Return a placeholder while waiting for proper mount
        return (
            <div
                ref={containerRef}
                style={{ height: '100%', width: '100%', backgroundColor: '#064E3B' }}
            />
        );
    }

    return (
        <MapContainer
            key={`farm-map-${uniqueId}`}
            center={center}
            zoom={17}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            dragging={true}
            touchZoom={true}
        >
            <RecenterMap center={center} />

            {/* Satellite Tile Layer */}
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
                maxZoom={19}
            />

            {/* EUDR Zones */}
            {showEudrZones && (
                <>
                    {/* JRC EU Zone (Red) */}
                    <Polygon
                        positions={jrcLeafletCoords}
                        pathOptions={{
                            color: JRC_ZONE_STYLE.strokeColor,
                            weight: JRC_ZONE_STYLE.weight,
                            fillOpacity: 0.25,
                            fillColor: JRC_ZONE_STYLE.fillColor,
                            dashArray: JRC_ZONE_STYLE.dashArray,
                        }}
                    />
                    <Marker
                        position={jrcCenter}
                        icon={createZoneLabelIcon('🇪🇺 JRC EU ZONE', 'rgba(220, 38, 38, 0.9)', '#FCA5A5')}
                    />

                    {/* VN Forest Zone (Green) */}
                    <Polygon
                        positions={vnLeafletCoords}
                        pathOptions={{
                            color: VN_FOREST_STYLE.strokeColor,
                            weight: VN_FOREST_STYLE.weight,
                            fillOpacity: 0.25,
                            fillColor: VN_FOREST_STYLE.fillColor,
                            dashArray: VN_FOREST_STYLE.dashArray,
                        }}
                    />
                    <Marker
                        position={vnCenter}
                        icon={createZoneLabelIcon('🇻🇳 RỪNG VN', 'rgba(22, 163, 74, 0.9)', '#86EFAC')}
                    />
                </>
            )}

            {/* Farm Polygon - NEON GREEN GLOWING */}
            <Polygon
                positions={farmPolygon as [number, number][]}
                pathOptions={{
                    color: '#00FF94',
                    weight: 4,
                    fillOpacity: 0.2,
                    fillColor: '#00FF94',
                }}
            />

            {/* User GPS Marker */}
            <Marker position={markerPosition} icon={gpsIcon} />
        </MapContainer>
    );
};

export default FarmMap;

