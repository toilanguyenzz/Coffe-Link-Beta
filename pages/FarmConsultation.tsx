/**
 * FarmConsultation.tsx - Tư Vấn AI
 * Premium Redesign - 100% Match Mockup
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzePlantDisease, PlantAnalysisResult, PlantDoctorError } from '../services/PlantDoctorService';
import BottomNav from '../components/layout/BottomNav';
import {
    Loader2, AlertCircle, X, FlaskConical, ShieldAlert, Sprout,
    Camera, Video, Bug, Brain, Lightbulb, CheckCircle2, ChevronRight
} from 'lucide-react';
import { PlantCondition } from '../services/ConsultationService';

const FarmConsultation: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Condition state
    const [condition, setCondition] = useState<PlantCondition>('normal');

    // Disease Scanner State
    const [showScanner, setShowScanner] = useState(false);
    const [scanStep, setScanStep] = useState<'idle' | 'analyzing' | 'result' | 'error'>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<PlantAnalysisResult | null>(null);
    const [scanError, setScanError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Ảnh quá lớn (Max 5MB).");
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

    const conditionOptions: { value: PlantCondition; label: string; emoji: string; color: string }[] = [
        { value: 'wilted', label: 'KÉM', emoji: '😣', color: 'text-gray-400' },
        { value: 'normal', label: 'BÌNH THƯỜNG', emoji: '😐', color: 'text-green-600' },
        { value: 'healthy', label: 'TỐT', emoji: '😊', color: 'text-gray-400' },
    ];

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden font-sans">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* BACKGROUND IMAGE - Forest Theme */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/images/coffee_plantation_hero.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                {/* Gradient fade at bottom for content */}
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[#e9efe9] via-[#e9efe9]/90 to-transparent" />
            </div>

            {/* Max-width container */}
            <div className="max-w-md mx-auto min-h-screen relative z-10 flex flex-col">

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* HEADER SECTION */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="pt-12 px-6 pb-6 text-center">
                    {/* Brain Icon */}
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-lg ring-1 ring-white/30">
                        <Brain className="w-9 h-9 text-white" />
                    </div>

                    <h1 className="text-white text-3xl font-black mb-2 tracking-tight drop-shadow-md">
                        Tư Vấn AI
                    </h1>

                    <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[280px] mx-auto drop-shadow-sm mb-6">
                        Bác sĩ cây trồng thông minh, phát hiện bệnh và hỗ trợ 24/7.
                    </p>

                    {/* Stats Pills */}
                    <div className="flex gap-3 justify-center">
                        <div className="flex flex-col items-center bg-[#f0fdf4]/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm min-w-[90px]">
                            <span className="text-green-800 font-black text-xl">98%</span>
                            <span className="text-[10px] font-bold text-green-700/70 uppercase">CHÍNH XÁC</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#f0fdf4]/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm min-w-[90px]">
                            <span className="text-green-800 font-black text-xl">24/7</span>
                            <span className="text-[10px] font-bold text-green-700/70 uppercase">HỖ TRỢ AI</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#f0fdf4]/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm min-w-[90px]">
                            <span className="text-green-800 font-black text-xl">50+</span>
                            <span className="text-[10px] font-bold text-green-700/70 uppercase">LOẠI BỆNH</span>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* MAIN CONTENT CARD */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="flex-1 bg-[#e9efe9]/95 backdrop-blur-sm rounded-t-[40px] px-5 pt-8 pb-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-4">

                    <div className="space-y-4">
                        {/* Card 1: Chẩn đoán bệnh lá */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-[#f2f7f2] rounded-[32px] p-4 flex items-center pr-6 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group border border-white"
                        >
                            <div className="w-20 h-20 bg-[#22c55e] rounded-[24px] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mr-5 flex-shrink-0">
                                <Camera className="w-9 h-9 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="text-[#064e3b] text-xl font-bold mb-1">
                                    Chẩn đoán bệnh lá
                                </h3>
                                <p className="text-gray-500 text-sm font-medium leading-snug">
                                    Chụp ảnh lá cây để AI phân tích chuyên sâu
                                </p>
                            </div>
                            <ChevronRight className="text-gray-300 w-6 h-6" />
                        </button>

                        {/* Card 2: Khảo sát toàn vườn */}
                        <button
                            onClick={() => navigate('/scan')}
                            className="w-full bg-[#f2f7f2] rounded-[32px] p-4 flex items-center pr-6 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group border border-white"
                        >
                            <div className="w-20 h-20 bg-[#8b5cf6] rounded-[24px] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mr-5 flex-shrink-0">
                                <Video className="w-9 h-9 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="text-[#064e3b] text-xl font-bold mb-1">
                                    Khảo sát toàn vườn
                                </h3>
                                <p className="text-gray-500 text-sm font-medium leading-snug">
                                    Quét video để đánh giá sức khỏe tổng thể
                                </p>
                            </div>
                            <ChevronRight className="text-gray-300 w-6 h-6" />
                        </button>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {/* SLIDER SECTION */}
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    <div className="mt-8 mb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-[#166534] text-white p-1 rounded-md">
                                <Bug className="w-4 h-4" />
                            </span>
                            <h3 className="text-[#166534] font-bold text-lg">Tình trạng vườn hôm nay</h3>
                        </div>

                        <div className="relative px-4">
                            {/* Track */}
                            <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-yellow-400 to-green-500 rounded-full" />

                            {/* Steps */}
                            <div className="flex justify-between -mt-10 relative">
                                {conditionOptions.map((opt) => {
                                    const isSelected = condition === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setCondition(opt.value)}
                                            className="flex flex-col items-center group focus:outline-none"
                                        >
                                            {/* Emoji Knob - Large if selected */}
                                            <div
                                                className={`
                                                    rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-4 border-[#e9efe9]
                                                    ${isSelected ? 'w-16 h-16 text-4xl -translate-y-2 bg-[#facc15]' : 'w-12 h-12 text-2xl bg-white grayscale opacity-70'}
                                                `}
                                            >
                                                {opt.emoji}
                                                {/* Green dot indicator for selected */}
                                                {isSelected && (
                                                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                                )}
                                            </div>

                                            {/* Label */}
                                            <span
                                                className={`
                                                    mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors
                                                    ${isSelected ? 'text-green-600' : 'text-gray-400'}
                                                `}
                                            >
                                                {opt.label}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {/* TIPS CARD */}
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    <div className="bg-[#dbeafe] rounded-[32px] p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center shadow-md">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[#1e3a8a] font-bold text-base">
                                Mẹo chụp ảnh hiệu quả
                            </h3>
                        </div>

                        <ul className="space-y-4 relative z-10">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                                <span className="text-[#1e3a8a]/80 text-sm font-medium leading-tight">Chụp dưới ánh sáng tự nhiên ban sáng</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                                <span className="text-[#1e3a8a]/80 text-sm font-medium leading-tight">Đảm bảo lấy nét rõ ràng, không bị mờ</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                                <span className="text-[#1e3a8a]/80 text-sm font-medium leading-tight">Chụp cận cảnh trực tiếp vùng bị bệnh</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* DISEASE SCANNER MODAL (Reused logic, styled match) */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {showScanner && (
                    <div className="fixed inset-0 z-[1000] flex flex-col bg-black/95">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 flex-shrink-0">
                            <div className="flex items-center gap-2 text-white">
                                <Bug className="h-5 w-5 text-green-400" />
                                <span className="text-sm font-bold">Agri-Doctor AI</span>
                            </div>
                            <button onClick={handleCloseScanner} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Image Preview - Limited height so button is always visible */}
                        <div className="flex-1 px-4 pb-4 overflow-hidden flex items-center justify-center min-h-0">
                            <div className="relative w-full max-h-full rounded-2xl overflow-hidden bg-gray-800 shadow-2xl border border-white/10" style={{ aspectRatio: '4/3' }}>
                                {capturedImage && (
                                    <img src={capturedImage} alt="Scan" className="h-full w-full object-cover" />
                                )}
                                {scanStep === 'analyzing' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <Loader2 className="h-16 w-16 text-green-500 animate-spin mb-4" />
                                        <p className="text-white font-bold text-lg animate-pulse">Đang phân tích...</p>
                                    </div>
                                )}
                                {scanStep === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 text-center p-6">
                                        <AlertCircle className="h-16 w-16 text-white mb-4" />
                                        <p className="text-white font-bold text-lg">{scanError}</p>
                                        <button onClick={() => fileInputRef.current?.click()} className="mt-6 px-6 py-3 bg-white text-red-900 rounded-xl font-bold">
                                            Chụp lại
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ACTION AREA - Always visible at bottom */}
                        <div className="p-6 bg-gray-900/50 backdrop-blur-md pb-10">
                            {scanStep === 'idle' && (
                                <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-[#22c55e] text-white font-bold text-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] transition-all">
                                    CHẨN ĐOÁN NGAY
                                </button>
                            )}
                            {scanStep === 'result' && aiResult && (
                                <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                                    {/* DISEASE NAME & SEVERITY HEADER */}
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 border border-white/10">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Bug className="h-5 w-5 text-red-400" />
                                                <h3 className="text-white font-bold text-lg">{aiResult.disease_name}</h3>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${aiResult.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                aiResult.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                {aiResult.severity === 'HIGH' ? 'Nặng' : aiResult.severity === 'MEDIUM' ? 'Trung Bình' : 'Nhẹ'}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{aiResult.diagnosis}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-gray-500 text-xs">Độ tin cậy:</span>
                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${aiResult.confidence}%` }}></div>
                                            </div>
                                            <span className="text-green-400 text-xs font-bold">{aiResult.confidence}%</span>
                                        </div>
                                    </div>

                                    {/* GROUP BUY OPPORTUNITY CARD - Only show if chemical treatment exists */}
                                    {aiResult.treatment.chemical && (
                                        <div
                                            onClick={() => navigate(`/market?tab=supplies&search=${encodeURIComponent(aiResult.treatment.chemical.split(' ')[0])}`)}
                                            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="bg-white/20 p-2 rounded-lg">
                                                    <span className="text-2xl">🔥</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm">Mua Chung Giá Sỉ!</h4>
                                                    <p className="text-white/90 text-xs mt-0.5">
                                                        <span className="font-bold bg-white/20 px-1 rounded">50+ nông dân</span> cũng cần <b>{aiResult.treatment.chemical}</b>
                                                    </p>
                                                    <span className="inline-block mt-1 text-[10px] font-bold bg-white text-orange-600 px-2 py-0.5 rounded-full">GIẢM 15%</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-white self-center" />
                                            </div>
                                        </div>
                                    )}

                                    {/* TREATMENT OPTIONS */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Chemical Treatment */}
                                        {aiResult.treatment.chemical && (
                                            <div className="bg-purple-900/50 rounded-xl p-3 border border-purple-500/20">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <FlaskConical className="h-3.5 w-3.5 text-purple-400" />
                                                    <span className="text-purple-300 text-[10px] font-bold uppercase">Thuốc BVTV</span>
                                                </div>
                                                <p className="text-white text-xs">{aiResult.treatment.chemical}</p>
                                            </div>
                                        )}

                                        {/* Biological Treatment */}
                                        {aiResult.treatment.biological && (
                                            <div className="bg-green-900/50 rounded-xl p-3 border border-green-500/20">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Sprout className="h-3.5 w-3.5 text-green-400" />
                                                    <span className="text-green-300 text-[10px] font-bold uppercase">Sinh học</span>
                                                </div>
                                                <p className="text-white text-xs">{aiResult.treatment.biological}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PROCEDURE */}
                                    {aiResult.treatment.procedure && (
                                        <div className="bg-blue-900/50 rounded-xl p-3 border border-blue-500/20">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                                                <span className="text-blue-300 text-[10px] font-bold uppercase">Quy trình xử lý</span>
                                            </div>
                                            <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">{aiResult.treatment.procedure}</p>
                                        </div>
                                    )}

                                    {/* PREVENTION */}
                                    {aiResult.prevention && (
                                        <div className="bg-amber-900/50 rounded-xl p-3 border border-amber-500/20">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                                                <span className="text-amber-300 text-[10px] font-bold uppercase">Phòng ngừa</span>
                                            </div>
                                            <p className="text-white text-xs leading-relaxed">{aiResult.prevention}</p>
                                        </div>
                                    )}

                                    {/* CLOSE / RETRY BUTTONS */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold text-sm hover:bg-gray-600 transition-colors"
                                        >
                                            Chụp lại
                                        </button>
                                        <button
                                            onClick={handleCloseScanner}
                                            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-500 transition-colors"
                                        >
                                            Hoàn tất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <BottomNav />
            </div>
        </div>
    );
};

export default FarmConsultation;
