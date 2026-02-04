/**
 * BiologicalClock.tsx
 * 
 * Đồng hồ sinh học 24 giờ cho cây trồng
 * Hiển thị múi màu theo khung giờ nông vụ tối ưu
 * 
 * - 🟢 6h - 9h: Giờ vàng phun thuốc (gió lặng, mát)
 * - 🔴 10h - 14h: Cấm phun (nắng gắt, thuốc bốc hơi)
 * - ⚫ 15h - 17h: Cảnh báo mưa dông
 * - 🔵 18h - 5h: Nghỉ ngơi
 */

import React, { useState, useEffect } from 'react';

interface TimeZone {
    startHour: number;
    endHour: number;
    color: string;
    label: string;
    emoji: string;
}

const TIME_ZONES: TimeZone[] = [
    { startHour: 6, endHour: 9, color: '#22c55e', label: 'Giờ vàng phun thuốc', emoji: '💧' },
    { startHour: 9, endHour: 10, color: '#84cc16', label: 'Còn được', emoji: '✅' },
    { startHour: 10, endHour: 14, color: '#ef4444', label: 'Cấm phun thuốc', emoji: '🚫' },
    { startHour: 14, endHour: 15, color: '#f97316', label: 'Nắng gắt', emoji: '☀️' },
    { startHour: 15, endHour: 17, color: '#6b7280', label: 'Cảnh báo mưa dông', emoji: '⛈️' },
    { startHour: 17, endHour: 18, color: '#8b5cf6', label: 'Chiều tối', emoji: '🌅' },
    { startHour: 18, endHour: 6, color: '#1e3a5f', label: 'Nghỉ ngơi', emoji: '🌙' },
];

interface BiologicalClockProps {
    size?: number;
    showLabels?: boolean;
}

const BiologicalClock: React.FC<BiologicalClockProps> = ({ size = 200, showLabels = true }) => {
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentHour(now.getHours());
            setCurrentMinute(now.getMinutes());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;
    const clockRadius = radius - 10;

    // Get current time zone
    const getCurrentZone = (): TimeZone => {
        for (const zone of TIME_ZONES) {
            if (zone.startHour <= zone.endHour) {
                if (currentHour >= zone.startHour && currentHour < zone.endHour) {
                    return zone;
                }
            } else {
                // Wraps around midnight
                if (currentHour >= zone.startHour || currentHour < zone.endHour) {
                    return zone;
                }
            }
        }
        return TIME_ZONES[TIME_ZONES.length - 1];
    };

    const currentZone = getCurrentZone();

    // Convert hour to angle (0h = top, clockwise)
    const hourToAngle = (hour: number): number => {
        return ((hour - 6) / 24) * 360; // Start from 6h at top
    };

    // Draw arc path
    const describeArc = (
        cx: number,
        cy: number,
        r: number,
        startAngle: number,
        endAngle: number
    ): string => {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        return [
            'M', start.x, start.y,
            'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
            'L', cx, cy,
            'Z'
        ].join(' ');
    };

    const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: cx + r * Math.cos(angleInRadians),
            y: cy + r * Math.sin(angleInRadians),
        };
    };

    // Current hour hand position
    const hourProgress = (currentHour + currentMinute / 60) / 24;
    const handAngle = hourProgress * 360 - 90; // -90 to start from top
    const handLength = clockRadius * 0.6;
    const handEnd = polarToCartesian(centerX, centerY, handLength, handAngle + 90);

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={clockRadius}
                    fill="rgba(0, 0, 0, 0.3)"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="2"
                />

                {/* Time zone arcs */}
                {TIME_ZONES.map((zone, idx) => {
                    let startAngle = hourToAngle(zone.startHour);
                    let endAngle = hourToAngle(zone.endHour);

                    // Handle overnight zone
                    if (zone.startHour > zone.endHour) {
                        // Draw two arcs: from start to midnight and from midnight to end
                        const path1 = describeArc(centerX, centerY, clockRadius, startAngle, hourToAngle(24));
                        const path2 = describeArc(centerX, centerY, clockRadius, hourToAngle(0), endAngle);
                        return (
                            <g key={idx}>
                                <path d={path1} fill={zone.color} opacity={0.7} />
                                <path d={path2} fill={zone.color} opacity={0.7} />
                            </g>
                        );
                    }

                    const path = describeArc(centerX, centerY, clockRadius, startAngle, endAngle);
                    return <path key={idx} d={path} fill={zone.color} opacity={0.7} />;
                })}

                {/* Hour markers */}
                {[0, 6, 12, 18].map((hour) => {
                    const angle = hourToAngle(hour);
                    const markerPos = polarToCartesian(centerX, centerY, clockRadius - 15, angle);
                    return (
                        <text
                            key={hour}
                            x={markerPos.x}
                            y={markerPos.y}
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {hour}h
                        </text>
                    );
                })}

                {/* Center circle */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={clockRadius * 0.25}
                    fill="rgba(0, 0, 0, 0.8)"
                    stroke="white"
                    strokeWidth="2"
                />

                {/* Current hour hand */}
                <line
                    x1={centerX}
                    y1={centerY}
                    x2={handEnd.x}
                    y2={handEnd.y}
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
                />

                {/* Hand tip dot */}
                <circle
                    cx={handEnd.x}
                    cy={handEnd.y}
                    r="6"
                    fill="white"
                    style={{ filter: 'drop-shadow(0 0 8px white)' }}
                />

                {/* Center dot */}
                <circle cx={centerX} cy={centerY} r="8" fill="white" />
            </svg>

            {/* Current zone label */}
            {showLabels && (
                <div
                    className="mt-3 px-4 py-2 rounded-xl text-center"
                    style={{
                        background: `${currentZone.color}33`,
                        border: `2px solid ${currentZone.color}`,
                    }}
                >
                    <span className="text-lg mr-2">{currentZone.emoji}</span>
                    <span className="text-white font-bold text-sm">{currentZone.label}</span>
                </div>
            )}
        </div>
    );
};

export default BiologicalClock;
