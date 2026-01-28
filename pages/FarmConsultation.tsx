/**
 * FarmConsultation.tsx - Tư Vấn AI
 * EXACT match to reference design
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzePlantDisease, PlantAnalysisResult, PlantDoctorError } from '../services/PlantDoctorService';
import BottomNav from '../components/layout/BottomNav';
import {
    Loader2, AlertCircle, X, FlaskConical, ShieldAlert, Sprout,
    Camera, Video, Bug
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

    const conditionOptions: { value: PlantCondition; label: string; emoji: string }[] = [
        { value: 'wilted', label: 'Kém', emoji: '😣' },
        { value: 'normal', label: 'Bình thường', emoji: '😐' },
        { value: 'healthy', label: 'Tốt', emoji: '😊' },
    ];

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden">
            {/* UNIFIED GRADIENT BACKGROUND - matching other tabs */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-green-600 via-green-500 to-green-100" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-green-400/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl transform -translate-x-1/2" />
            </div>

            {/* Max-width container for mobile-like appearance */}
            <div className="max-w-md mx-auto min-h-screen relative z-10">

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
                {/* HEADER WITH GRADIENT */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="relative px-6 pt-8 pb-32 overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Sprout className="w-6 h-6  text-white" />
                            </div>
                            <h1 className="text-white text-2xl font-bold">Tư Vấn AI</h1>
                        </div>

                        <p className="text-white/90 text-sm leading-relaxed mb-2">
                            Bác sĩ cây trồng thông minh, phát hiện bệnh nhanh chóng và đưa ra phương án điều trị hiệu quả
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-3 mt-6">
                            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                                <div className="text-white text-2xl font-bold">98%</div>
                                <div className="text-white/80 text-xs">Độ chính xác</div>
                            </div>
                            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                                <div className="text-white text-2xl font-bold">24/7</div>
                                <div className="text-white/80 text-xs">Hỗ trợ AI</div>
                            </div>
                            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                                <div className="text-white text-2xl font-bold">50+</div>
                                <div className="text-white/80 text-xs">Loại bệnh</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* FLOATING ACTION CARDS */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="px-5 -mt-20 relative z-20 space-y-4">

                    {/* Card 1: Chụp ảnh lá - Premium design */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group w-full bg-white rounded-3xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300 overflow-hidden"
                    >
                        <div className="relative p-6">
                            {/* Gradient background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-400/20 to-green-500/20 rounded-full blur-2xl"></div>

                            <div className="relative flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Camera className="w-8 h-8 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-gray-900 text-lg font-bold mb-1">
                                        Chẩn đoán bệnh lá
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Chụp ảnh lá cây để AI phân tích
                                    </p>
                                </div>
                                <div className="text-green-500 group-hover:translate-x-1 transition-transform">
                                    →
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Card 2: Quay video vườn - Premium design */}
                    <button
                        onClick={() => navigate('/scan')}
                        className="group w-full bg-white rounded-3xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300 overflow-hidden"
                    >
                        <div className="relative p-6">
                            {/* Gradient background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-2xl"></div>

                            <div className="relative flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Video className="w-8 h-8 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-gray-900 text-lg font-bold mb-1">
                                        Khảo sát toàn vườn
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Quét video để phân tích tổng thể
                                    </p>
                                </div>
                                <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                                    →
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {/* FARM CONDITION TRACKER - Premium Card */}
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Sprout className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-gray-900 text-lg font-bold">
                                Tình trạng vườn hôm nay
                            </h3>
                        </div>

                        {/* Emoji selector with premium design */}
                        <div className="relative">
                            {/* Progress bar background */}
                            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full"></div>

                            <div className="relative flex items-center justify-between px-2">
                                {conditionOptions.map((opt, index) => {
                                    const isSelected = condition === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setCondition(opt.value)}
                                            className="relative z-10 flex flex-col items-center gap-3 transition-all duration-300"
                                        >
                                            <div
                                                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${isSelected
                                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/50 scale-110 ring-4 ring-green-200'
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {opt.emoji}
                                                {isSelected && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-sm font-semibold transition-all ${isSelected ? 'text-green-600 scale-105' : 'text-gray-500'
                                                }`}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {/* HELPFUL TIPS SECTION */}
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">💡</span>
                            </div>
                            <h3 className="text-gray-900 text-base font-bold">
                                Mẹo chụp ảnh hiệu quả
                            </h3>
                        </div>

                        <ul className="space-y-2.5">
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Chụp lá bị bệnh dưới ánh sáng tự nhiên</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Đảm bảo hình ảnh rõ nét, không bị mờ</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Chụp cận cảnh vùng bị bệnh</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom spacing */}
                <div className="h-6"></div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* DISEASE SCANNER MODAL */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {showScanner && (
                    <div className="fixed inset-0 z-[1000] flex flex-col bg-black/95">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5">
                            <div className="flex items-center gap-2 text-white">
                                <Bug className="h-5 w-5 text-purple-400" />
                                <span className="text-sm font-bold">Agri-Doctor</span>
                            </div>
                            <button onClick={handleCloseScanner} className="rounded-full bg-white/10 p-2 text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="flex-1 p-5">
                            <div className="relative w-full h-full rounded-3xl overflow-hidden">
                                <img src={capturedImage!} alt="Scan" className="h-full w-full object-cover" />

                                {scanStep === 'analyzing' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                        <Loader2 className="h-12 w-12 text-white animate-spin" />
                                        <p className="text-white font-bold mt-4">Đang chẩn đoán...</p>
                                    </div>
                                )}

                                {scanStep === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 px-6 text-center">
                                        <AlertCircle className="h-12 w-12 text-white mb-4" />
                                        <p className="text-white font-bold">{scanError}</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-4 px-6 py-3 rounded-xl bg-white text-red-900 font-bold"
                                        >
                                            Chụp lại
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="p-5">
                            {scanStep === 'idle' && (
                                <button
                                    onClick={handleAnalyze}
                                    className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold text-lg"
                                >
                                    Bắt Đầu Chẩn Đoán
                                </button>
                            )}

                            {scanStep === 'result' && aiResult && (
                                <div className="bg-gray-900 rounded-2xl p-5 max-h-[50vh] overflow-y-auto">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Bug className="w-8 h-8 text-orange-500" />
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{aiResult.disease_name}</h3>
                                            <p className="text-gray-400 text-sm">{aiResult.diagnosis}</p>
                                        </div>
                                    </div>

                                    {aiResult.treatment.chemical && (
                                        <div className="bg-gray-800 rounded-xl p-3 mb-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FlaskConical className="h-4 w-4 text-purple-400" />
                                                <span className="text-purple-300 text-xs font-bold">Thuốc BVTV</span>
                                            </div>
                                            <p className="text-white text-sm">{aiResult.treatment.chemical}</p>
                                        </div>
                                    )}

                                    {aiResult.treatment.biological && (
                                        <div className="bg-green-900/30 rounded-xl p-3 mb-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Sprout className="h-4 w-4 text-green-400" />
                                                <span className="text-green-300 text-xs font-bold">Sinh học</span>
                                            </div>
                                            <p className="text-white text-sm">{aiResult.treatment.biological}</p>
                                        </div>
                                    )}

                                    <div className="bg-blue-900/30 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldAlert className="h-4 w-4 text-blue-400" />
                                            <span className="text-blue-300 text-xs font-bold">Phòng ngừa</span>
                                        </div>
                                        <p className="text-white text-sm">{aiResult.prevention}</p>
                                    </div>

                                    <button
                                        onClick={handleCloseScanner}
                                        className="w-full mt-4 py-3 rounded-xl bg-gray-700 text-white font-bold"
                                    >
                                        Đóng
                                    </button>
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
