/**
 * FarmConsultation.tsx
 * 
 * AI-powered farm consultation page.
 * Features:
 * - Soi Sâu Bệnh (AI Disease Scanner) - NEW!
 * - Auto-loads farm area from map data
 * - User inputs tree count
 * - Condition slider (Héo - Bình thường - Tốt)
 * - One-tap consultation with beautiful result cards
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarmData } from '../contexts/FarmDataContext';
import { getFullWeatherReport, FullWeatherReport } from '../services/WeatherService';
import { generateAIConsultation } from '../services/AIConsultationService';
import { ConsultationResult, PlantCondition } from '../services/ConsultationService';
import { analyzePlantDisease, PlantAnalysisResult, PlantDoctorError } from '../services/PlantDoctorService';
import ConsultationResultCard from '../components/consultation/ConsultationResultCard';
import BottomNav from '../components/layout/BottomNav';
import {
    MapPin, Trees, Sparkles, Loader2, ChevronRight,
    Frown, Meh, Smile, RefreshCw, Cloud, AlertCircle,
    Video, ScanLine, Bug, X, FlaskConical, ShieldAlert, Sprout, Camera
} from 'lucide-react';

// Mock farm data for demo (when no farm is drawn)
const DEMO_FARM = {
    areaHectares: 1.8,
    areaSquareMeters: 18000,
    centerPoint: { lat: 12.6667, lng: 108.0500 },
    treeCount: 1200,
};

const FarmConsultation: React.FC = () => {
    const { farmInfo, hasFarmData } = useFarmData();
    const navigate = useNavigate();

    // Form state
    const [treeCount, setTreeCount] = useState<number>(DEMO_FARM.treeCount);
    const [condition, setCondition] = useState<PlantCondition>('normal');

    // Loading/result state
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ConsultationResult | null>(null);
    const [weather, setWeather] = useState<FullWeatherReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Disease Scanner State
    const [showScanner, setShowScanner] = useState(false);
    const [scanStep, setScanStep] = useState<'idle' | 'analyzing' | 'result' | 'error'>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<PlantAnalysisResult | null>(null);
    const [scanError, setScanError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get farm area (from context or demo)
    const farmArea = hasFarmData
        ? farmInfo.boundary!.areaHectares
        : DEMO_FARM.areaHectares;

    const farmCenter = hasFarmData
        ? farmInfo.boundary!.centerPoint
        : DEMO_FARM.centerPoint;

    // Fetch weather on mount
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const report = await getFullWeatherReport(farmCenter.lat, farmCenter.lng);
                setWeather(report);
            } catch (err) {
                console.error('Weather fetch failed:', err);
            }
        };
        fetchWeather();
    }, [farmCenter.lat, farmCenter.lng]);

    // Handle consultation
    const handleConsult = useCallback(async () => {
        if (treeCount <= 0) {
            setError('Vui lòng nhập số lượng cây hợp lệ');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const weatherReport = await getFullWeatherReport(farmCenter.lat, farmCenter.lng);
            setWeather(weatherReport);

            const consultResult = await generateAIConsultation(
                {
                    areaHectares: farmArea,
                    treeCount,
                    condition,
                    centerCoords: farmCenter,
                },
                weatherReport
            );

            setResult(consultResult);
        } catch (err) {
            console.error('Consultation error:', err);
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [treeCount, condition, farmArea, farmCenter]);

    // Disease Scanner Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Ảnh quá lớn (Max 5MB). Vui lòng chọn ảnh khác.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
                setShowScanner(true);
                setScanStep('idle');
                setAiResult(null);
                setScanError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!capturedImage) return;
        setScanStep('analyzing');
        setScanError('');

        try {
            const result = await analyzePlantDisease(capturedImage);
            setAiResult(result);
            setScanStep('result');
        } catch (error: any) {
            setScanStep('error');
            if (error instanceof PlantDoctorError) {
                setScanError(error.message);
            } else {
                setScanError("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        }
    };

    const handleCloseScanner = () => {
        setShowScanner(false);
        setCapturedImage(null);
        setAiResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Condition options
    const conditionOptions: { value: PlantCondition; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'wilted', label: 'Héo', icon: <Frown className="h-5 w-5" />, color: 'text-red-500 bg-red-50 border-red-200' },
        { value: 'normal', label: 'Bình thường', icon: <Meh className="h-5 w-5" />, color: 'text-amber-500 bg-amber-50 border-amber-200' },
        { value: 'healthy', label: 'Tốt', icon: <Smile className="h-5 w-5" />, color: 'text-green-500 bg-green-50 border-green-200' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pb-32">
            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 pt-14 pb-8 rounded-b-[2.5rem] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />

                <div className="relative z-10 px-6 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Tư Vấn AI</h1>
                            <p className="text-white/70 text-sm">Khuyến nghị chăm sóc thông minh</p>
                        </div>
                    </div>

                    {weather && (
                        <div className="mt-4 flex items-center gap-2 text-white/80 text-sm">
                            <Cloud className="h-4 w-4" />
                            <span>{weather.current.temperature}°C, {weather.current.description}</span>
                            <span className="text-white/50">•</span>
                            <span>{weather.season.seasonName}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-5 -mt-6 max-w-md mx-auto relative z-20">
                {/* SOI SÂU BỆNH - Disease Scanner Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-4 bg-gradient-to-r from-purple-600 via-violet-606 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                            <Bug className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-black text-lg flex items-center gap-2">
                                🔬 Soi Sâu Bệnh
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                                    AI
                                </span>
                            </p>
                            <p className="text-white/80 text-sm">
                                Chụp ảnh lá → AI chẩn đoán bệnh
                            </p>
                        </div>
                        <Camera className="h-6 w-6 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                </button>

                {/* Video Scan Card */}
                <button
                    onClick={() => navigate('/scan')}
                    className="w-full mb-5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-5 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                            <Video className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-black text-lg flex items-center gap-2">
                                📹 Quét Vườn AI
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                    MỚI
                                </span>
                            </p>
                            <p className="text-white/80 text-sm">
                                Quay video 15s → AI phát hiện bệnh
                            </p>
                        </div>
                        <ScanLine className="h-6 w-6 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                </button>

                {/* Farm Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vườn của bạn</p>
                            <p className="text-lg font-bold text-gray-800">
                                {farmArea.toFixed(2)} Ha
                                <span className="text-sm text-gray-400 font-normal ml-2">
                                    ({(farmArea * 10000).toLocaleString()} m²)
                                </span>
                            </p>
                        </div>
                        {!hasFarmData && (
                            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                Demo
                            </span>
                        )}
                    </div>

                    {!hasFarmData && (
                        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                            💡 Vào tab <strong>Hồ Sơ</strong> để vẽ ranh giới vườn thực tế của bạn.
                        </p>
                    )}
                </div>

                {/* Tree Count Input */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Trees className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Số lượng cây</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={treeCount}
                            onChange={(e) => setTreeCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="flex-1 text-3xl font-black text-gray-800 bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100 focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                            placeholder="1000"
                        />
                        <span className="text-gray-400 font-medium">cây</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                        {[500, 1000, 1500, 2000].map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setTreeCount(preset)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${treeCount === preset
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Condition Selector */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border border-gray-100">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
                        Tình trạng cây hiện tại
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                        {conditionOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setCondition(opt.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${condition === opt.value
                                    ? `${opt.color} ring-2 ring-offset-2 ring-current scale-105`
                                    : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {opt.icon}
                                <span className="text-xs font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Consult Button */}
                <button
                    onClick={handleConsult}
                    disabled={isLoading || treeCount <= 0}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Đang phân tích...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5" />
                            Tư vấn ngay
                            <ChevronRight className="h-5 w-5" />
                        </>
                    )}
                </button>

                {/* Results */}
                {result && (
                    <div className="mt-6">
                        <ConsultationResultCard result={result} treeCount={treeCount} />
                        <button
                            onClick={handleConsult}
                            className="w-full mt-4 py-3 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Tư vấn lại
                        </button>
                    </div>
                )}
            </div>

            {/* DISEASE SCANNER MODAL */}
            {showScanner && (
                <div className="fixed inset-0 z-[1000] flex flex-col bg-black/95 animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center gap-2 text-white">
                            <div className="p-1.5 rounded-full bg-purple-500/20 border border-purple-500/50">
                                <Bug className="h-4 w-4 text-purple-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Agri-Doctor</span>
                        </div>
                        <button onClick={handleCloseScanner} className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Image Area */}
                    <div className={`relative flex-1 bg-black flex flex-col items-center justify-center p-6 transition-all duration-500 ${scanStep === 'result' ? 'flex-[0.4]' : 'flex-1'}`}>
                        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl">
                            <img src={capturedImage!} alt="Scan" className="h-full w-full object-cover" />

                            {/* Analyzing Overlay */}
                            {scanStep === 'analyzing' && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl animate-pulse opacity-50"></div>
                                        <Loader2 className="relative h-12 w-12 text-white animate-spin" />
                                    </div>
                                    <p className="text-white font-bold tracking-widest uppercase mt-4 animate-pulse text-xs">Đang chẩn đoán...</p>
                                </div>
                            )}

                            {/* Error Overlay */}
                            {scanStep === 'error' && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md px-6 text-center">
                                    <AlertCircle className="h-12 w-12 text-white mb-4" />
                                    <p className="text-white font-bold mb-2">Không thể phân tích</p>
                                    <p className="text-white/80 text-xs mb-6">{scanError}</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 rounded-xl bg-white text-red-900 font-bold text-xs uppercase tracking-widest shadow-lg"
                                    >
                                        Chụp lại ảnh khác
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Result Area */}
                    <div className={`bg-[#111] border-t border-white/10 transition-all duration-500 ${scanStep === 'result' ? 'flex-1 p-0 overflow-hidden' : 'p-8 min-h-[120px]'}`}>
                        {scanStep === 'idle' ? (
                            <button
                                onClick={handleAnalyze}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-purple-900/50 hover:scale-[1.02] transition-transform active:scale-95"
                            >
                                Bắt Đầu Chẩn Đoán
                            </button>
                        ) : scanStep === 'result' && aiResult ? (
                            <div className="h-full overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                                {/* Diagnosis Header */}
                                <div className="flex items-start gap-4">
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${aiResult.severity === 'HIGH' ? 'bg-red-500 shadow-red-500/30' :
                                        aiResult.severity === 'MEDIUM' ? 'bg-orange-500 shadow-orange-500/30' :
                                            'bg-green-500 shadow-green-500/30'
                                        }`}>
                                        <Bug className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black text-white leading-tight">{aiResult.disease_name}</h3>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${aiResult.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                aiResult.severity === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                Độ tin cậy: {aiResult.confidence}%
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-400 mt-1 leading-relaxed">
                                            {aiResult.diagnosis}
                                        </p>
                                    </div>
                                </div>

                                {/* Treatment Plan */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Phác đồ điều trị</h4>

                                    {aiResult.treatment.chemical && (
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FlaskConical className="h-4 w-4 text-purple-400" />
                                                <span className="text-xs font-bold text-purple-200 uppercase">Thuốc BVTV</span>
                                            </div>
                                            <p className="text-sm font-bold text-white">{aiResult.treatment.chemical}</p>
                                        </div>
                                    )}

                                    {aiResult.treatment.biological && (
                                        <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sprout className="h-4 w-4 text-green-400" />
                                                <span className="text-xs font-bold text-green-200 uppercase">Sinh học</span>
                                            </div>
                                            <p className="text-sm font-bold text-white">{aiResult.treatment.biological}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Procedure */}
                                <div className="bg-gray-900 rounded-xl p-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Quy trình</h4>
                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                        {aiResult.treatment.procedure}
                                    </p>
                                </div>

                                {/* Prevention */}
                                <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1">
                                        <ShieldAlert className="h-3 w-3" /> Phòng ngừa
                                    </h4>
                                    <p className="text-sm text-blue-100 leading-relaxed">
                                        {aiResult.prevention}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 pb-8 flex gap-3">
                                    <button
                                        onClick={handleCloseScanner}
                                        className="flex-1 py-3.5 rounded-xl bg-gray-800 text-white text-xs font-bold uppercase"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="flex-[2] py-3.5 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-900/50"
                                    >
                                        Lưu vào nhật ký
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default FarmConsultation;
