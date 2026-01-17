/**
 * CareView.tsx - SIMPLE VERSION
 * Dashboard thông minh với 3 khối chính:
 * 1. Actionable Weather (Dự báo - bấm vào xem 3 ngày)
 * 2. Market Ticker (Bảng giá thị trường)
 * 3. Disease Alert (Cảnh báo dịch bệnh)
 */

import React from 'react';

// Smart Dashboard Components
import ActionableWeatherCard from './ActionableWeatherCard';
import MarketTickerCard from './MarketTickerCard';
import DiseaseAlertCard from './DiseaseAlertCard';

const CareView: React.FC = () => {
    return (
        <div className="space-y-5 pb-10">
            {/* 1. ACTIONABLE WEATHER */}
            <ActionableWeatherCard />

            {/* 2. MARKET TICKER */}
            <MarketTickerCard />

            {/* 3. DISEASE ALERT */}
            <DiseaseAlertCard />
        </div>
    );
};

export default CareView;
