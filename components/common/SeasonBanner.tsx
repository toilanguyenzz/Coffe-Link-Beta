/**
 * SeasonBanner.tsx
 * Banner hiển thị chế độ mùa vụ - UI thay đổi theo MODE
 * CARE mode: Xanh lá
 * HARVEST mode: Đỏ rực
 */

import React from 'react';
import { useHub } from '../../contexts/HubContext';
import { Leaf, AlertTriangle } from 'lucide-react';

const SeasonBanner: React.FC = () => {
    const { currentHub, seasonMode, loading } = useHub();

    // Không hiện nếu chưa load xong hoặc chưa có Hub
    if (loading || !currentHub) return null;

    const isHarvestMode = seasonMode === 'HARVEST';

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '8px 16px',
                background: isHarvestMode
                    ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                    : 'linear-gradient(90deg, #16a34a, #22c55e)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500,
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
        >
            {isHarvestMode ? (
                <>
                    <AlertTriangle size={16} />
                    <span>🔴 MÙA THU HOẠCH - {currentHub.name}</span>
                </>
            ) : (
                <>
                    <Leaf size={16} />
                    <span>🌱 Mùa chăm sóc - {currentHub.name}</span>
                </>
            )}
        </div>
    );
};

export default SeasonBanner;
