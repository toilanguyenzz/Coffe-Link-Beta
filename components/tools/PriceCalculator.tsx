
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/DemoAuthContext';
import { getDistanceFromLatLonInMeters } from '../../utils/geoUtils';
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    Droplets,
    Scale,
    Bean,
    Sprout,
    AlertCircle,
    RefreshCw,
    Clock,
    MapPin,
    CheckCircle2,
    Info,
    Radar
} from 'lucide-react';

const SmartPriceCalculator: React.FC = () => {
    const { userProfile } = useAuth();

    // --- STATE ---
    const [coffeeType, setCoffeeType] = useState<'robusta' | 'arabica'>('robusta');
    const [formType, setFormType] = useState<'fresh' | 'green'>('green'); // Tươi vs Nhân
    const [province, setProvince] = useState<string>('daklak'); // Default Province
    const [isAutoDetected, setIsAutoDetected] = useState(false);

    const [weight, setWeight] = useState<string>('1000'); // kg
    const [moisture, setMoisture] = useState<string>('15.0');
    const [impurities, setImpurities] = useState<string>('1.0');

    // --- DATA: PROVINCES & DIFFERENTIALS ---
    // Coordinates used for auto-detection (Centroids of coffee regions)
    const PROVINCES = [
        { id: 'daklak', name: 'Đắk Lắk', diff: 0, lat: 12.679, lng: 108.044 },
        { id: 'lamdong', name: 'Lâm Đồng', diff: -600, lat: 11.575, lng: 107.806 },
        { id: 'gialai', name: 'Gia Lai', diff: -300, lat: 13.975, lng: 108.000 },
        { id: 'kontum', name: 'Kon Tum', diff: -300, lat: 14.354, lng: 108.007 },
        { id: 'daknong', name: 'Đắk Nông', diff: -200, lat: 12.000, lng: 107.693 },
    ];

    // --- PRICE LOGIC (SIMULATED DAILY FEED) ---
    const TODAY_BASE_ROBUSTA = 121500;
    const TODAY_BASE_ARABICA = 145000;
    const FRESH_RATIO = 4.5; // 1kg Nhân = 4.5kg Tươi

    const [livePrice, setLivePrice] = useState<number>(TODAY_BASE_ROBUSTA);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Market Trend Simulation
    const [marketTrend, setMarketTrend] = useState<{
        direction: 'up' | 'down';
        value: number; // USD/Tonne
        percentage: number;
    }>({ direction: 'up', value: 24, percentage: 0.8 });

    // --- AUTO-DETECT LOCATION EFFECT ---
    useEffect(() => {
        if (userProfile?.gardenLocation?.lat && userProfile?.gardenLocation?.lng) {
            const userLat = userProfile.gardenLocation.lat;
            const userLng = userProfile.gardenLocation.lng;

            let minDistance = Infinity;
            let closestId = 'daklak';

            PROVINCES.forEach(p => {
                const dist = getDistanceFromLatLonInMeters(userLat, userLng, p.lat, p.lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestId = p.id;
                }
            });

            // Chỉ tự động chọn nếu chưa chọn thủ công hoặc lần đầu load
            // Ở đây ta ưu tiên vị trí vườn
            setProvince(closestId);
            setIsAutoDetected(true);
        }
    }, [userProfile]);

    // Update price when dependency changes
    useEffect(() => {
        updatePrice();
    }, [coffeeType, province]);

    const updatePrice = (simulateNetworkDelay = false) => {
        if (simulateNetworkDelay) setIsRefreshing(true);

        const delay = simulateNetworkDelay ? 800 : 0;

        setTimeout(() => {
            // 1. Determine Base Price
            let base = coffeeType === 'robusta' ? TODAY_BASE_ROBUSTA : TODAY_BASE_ARABICA;

            // 2. Apply Province Differential
            const selectedProvince = PROVINCES.find(p => p.id === province);
            if (selectedProvince) {
                base += selectedProvince.diff;
            }

            // 3. Add small random fluctuation for "Live" feel
            if (simulateNetworkDelay) {
                const fluctuation = Math.floor(Math.random() * 500) - 200;
                base += fluctuation;

                setMarketTrend({
                    direction: Math.random() > 0.4 ? 'up' : 'down',
                    value: Math.floor(Math.random() * 30) + 10,
                    percentage: Number((Math.random() * 1.5).toFixed(2))
                });
            }

            setLivePrice(base);
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, delay);
    };

    const handleRefresh = () => {
        updatePrice(true);
    };

    // --- CALCULATION LOGIC (TCVN 4193:2014) ---
    const calculateTotal = () => {
        const w = parseFloat(weight) || 0;
        const m = parseFloat(moisture) || 0;
        const i = parseFloat(impurities) || 0;

        // 1. Determine Unit Price
        let unitPrice = livePrice;
        if (formType === 'fresh') {
            unitPrice = Math.floor(livePrice / FRESH_RATIO);
        }

        // 2. Calculate Deductions (Only for Green Bean)
        let deductWeight = 0;
        let penaltyMoney = 0;

        if (formType === 'green') {
            if (m > 15) {
                deductWeight += w * ((m - 15) * 1.1) / 100;
            }
            if (i > 1) {
                deductWeight += w * ((i - 1) / 100);
            }
        }

        const netWeight = Math.max(0, w - deductWeight);
        const totalMoney = netWeight * unitPrice;

        if (formType === 'green') {
            penaltyMoney = deductWeight * unitPrice;
        }

        return {
            unitPrice,
            netWeight,
            totalMoney,
            deductWeight,
            penaltyMoney
        };
    };

    const result = calculateTotal();

    // Format Helpers
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };
    const formatCurrency = (val: number) => {
        return Math.floor(val).toLocaleString('vi-VN');
    }

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 transition-all hover:shadow-2xl">

            {/* HEADER: LOCATION & PRICE */}
            <div className="bg-[#F8FAFC] px-6 py-5 border-b border-gray-100">

                {/* Top Row: Location Selector */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-1 p-1 rounded-xl border transition-all ${isAutoDetected ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className={`p-1.5 rounded-lg ${isAutoDetected ? 'bg-green-100' : 'bg-red-50'}`}>
                            {isAutoDetected ? <Radar className="h-3.5 w-3.5 text-green-600 animate-pulse" /> : <MapPin className="h-3.5 w-3.5 text-red-500" />}
                        </div>
                        <select
                            value={province}
                            onChange={(e) => {
                                setProvince(e.target.value);
                                setIsAutoDetected(false); // Disable auto flag if manually changed
                            }}
                            className="bg-transparent text-xs font-bold text-gray-700 outline-none pr-2 py-1 appearance-none cursor-pointer hover:text-green-700"
                        >
                            {PROVINCES.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {isAutoDetected && <span className="text-[9px] font-bold text-green-600 pr-2">Theo vườn của bạn</span>}
                        {!isAutoDetected && <Info className="h-3 w-3 text-gray-400 mr-2" />}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                            <Clock className="h-3 w-3" /> {formatTime(lastUpdated)}
                        </span>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-green-600 active:scale-90 transition-all"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Main Price Display */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-black tracking-tighter ${isRefreshing ? 'opacity-50' : 'text-gray-900'}`}>
                                {formatCurrency(livePrice)}
                            </span>
                            <span className="text-sm font-bold text-gray-400">₫</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-medium text-gray-400">Giá tại {PROVINCES.find(p => p.id === province)?.name}</p>
                            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                            <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                <CheckCircle2 className="h-2.5 w-2.5 text-blue-600" />
                                <span className="text-[9px] font-bold text-blue-600">TCVN 4193:2014</span>
                            </div>
                        </div>
                    </div>

                    {/* Reference Trend */}
                    <div className={`flex flex-col items-end ${marketTrend.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                            {marketTrend.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="text-xs font-black">
                                {marketTrend.direction === 'up' ? '+' : '-'}{marketTrend.value} USD
                            </span>
                        </div>
                        <span className="text-[8px] font-bold text-gray-300 mt-1 uppercase tracking-wide">
                            Sàn {coffeeType === 'robusta' ? 'London' : 'New York'} ({marketTrend.percentage}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* CONTROL TABS */}
                <div className="space-y-3">
                    {/* Coffee Type */}
                    <div className="flex rounded-xl bg-gray-50 p-1 border border-gray-100">
                        {(['robusta', 'arabica'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setCoffeeType(t)}
                                className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${coffeeType === t
                                        ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t === 'robusta' ? 'Robusta (Vối)' : 'Arabica (Chè)'}
                            </button>
                        ))}
                    </div>

                    {/* Form Type */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFormType('green')}
                            className={`group flex-1 flex flex-col items-center justify-center rounded-2xl border-2 py-3 transition-all duration-300 active:scale-95 ${formType === 'green'
                                    ? 'border-green-500 bg-green-50/50 text-green-700'
                                    : 'border-gray-100 bg-white text-gray-400 grayscale hover:grayscale-0'
                                }`}
                        >
                            <Bean className={`h-5 w-5 mb-1 transition-transform group-hover:scale-110 ${formType === 'green' ? 'fill-current' : ''}`} />
                            <span className="text-xs font-bold">Cà Nhân</span>
                        </button>
                        <button
                            onClick={() => setFormType('fresh')}
                            className={`group flex-1 flex flex-col items-center justify-center rounded-2xl border-2 py-3 transition-all duration-300 active:scale-95 ${formType === 'fresh'
                                    ? 'border-red-500 bg-red-50/50 text-red-700'
                                    : 'border-gray-100 bg-white text-gray-400 grayscale hover:grayscale-0'
                                }`}
                        >
                            <Sprout className={`h-5 w-5 mb-1 transition-transform group-hover:scale-110 ${formType === 'fresh' ? 'fill-current' : ''}`} />
                            <span className="text-xs font-bold">Cà Tươi</span>
                        </button>
                    </div>
                </div>

                {/* INPUT FIELDS */}
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 group-focus-within:text-green-600 transition-colors">
                            Khối lượng tịnh
                        </label>
                        <div className="relative mt-1">
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full rounded-2xl bg-gray-50 border-none px-5 py-4 text-3xl font-black text-gray-800 focus:ring-2 focus:ring-green-500 shadow-inner transition-all"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg bg-white px-2 py-1 text-xs font-bold text-gray-400 shadow-sm">
                                KG
                            </div>
                        </div>
                    </div>

                    {formType === 'green' ? (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                    <Droplets className="h-3 w-3" /> Độ ẩm %
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={moisture}
                                    onChange={(e) => setMoisture(e.target.value)}
                                    className={`mt-1 w-full rounded-2xl border-none px-4 py-3 text-lg font-bold shadow-inner focus:ring-2 transition-colors ${parseFloat(moisture) > 15
                                            ? 'bg-red-50 text-red-600 focus:ring-red-500'
                                            : 'bg-gray-50 text-gray-800 focus:ring-green-500'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                    <Scale className="h-3 w-3" /> Tạp chất %
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={impurities}
                                    onChange={(e) => setImpurities(e.target.value)}
                                    className="mt-1 w-full rounded-2xl bg-gray-50 border-none px-4 py-3 text-lg font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-orange-50 p-3 flex items-start gap-3 border border-orange-100 animate-in fade-in zoom-in-95">
                            <div className="p-1.5 bg-orange-100 rounded-full text-orange-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-xs text-orange-800 font-medium leading-relaxed mt-0.5">
                                Giá cà tươi tự động quy đổi: <span className="font-bold">1kg Nhân ≈ {FRESH_RATIO}kg Tươi</span>.
                                Không áp dụng trừ tạp/độ ẩm.
                            </p>
                        </div>
                    )}
                </div>

                {/* DEDUCTION SUMMARY */}
                {formType === 'green' && result.deductWeight > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 border border-red-100 animate-pulse">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-[10px] font-bold uppercase text-red-600">Trừ lùi (Ẩm + Tạp)</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-xs font-black text-red-600">-{result.deductWeight.toFixed(1)} kg</span>
                            <span className="block text-[9px] font-medium text-red-400">≈ -{formatCurrency(result.penaltyMoney)} đ</span>
                        </div>
                    </div>
                )}

                {/* FINAL RESULT */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-700 to-emerald-900 p-6 text-white shadow-xl shadow-green-200 transform transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 h-32 w-32 -translate-y-10 translate-x-10 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 h-24 w-24 translate-y-5 -translate-x-5 rounded-full bg-black/10 blur-xl"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-end opacity-80 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Thực nhận</span>
                            <span className="text-[10px] font-medium text-emerald-100">{formType === 'fresh' ? 'Cà Tươi' : 'Cà Nhân'} • {result.netWeight.toFixed(1)} Kg</span>
                        </div>

                        <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-black tracking-tighter shadow-black drop-shadow-md">
                                {formatCurrency(result.totalMoney)}
                            </span>
                            <span className="text-sm font-bold opacity-60">VNĐ</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 backdrop-blur-md">
                                <span className="text-[9px] font-medium text-white/90">Giá {PROVINCES.find(p => p.id === province)?.name}</span>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-200 hover:text-white transition-colors">
                                Lưu sổ sách &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartPriceCalculator;
