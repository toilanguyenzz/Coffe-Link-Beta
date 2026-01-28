/**
 * LandCertificateScanner.tsx - Quét Sổ đỏ với OCR
 * Chuyển đổi VN-2000 → WGS-84
 */

import React, { useState, useRef, useCallback } from 'react';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import * as VN2000Converter from '../../services/VN2000Converter';
import * as EUDRChecker from '../../services/EUDRChecker';
import * as RewardSystem from '../../services/RewardSystem';
import * as LocalStorage from '../../services/LocalStorageService';
import { Camera, Upload, X, CheckCircle, AlertCircle, MapPin, FileText, Loader2, Sparkles } from 'lucide-react';

interface LandCertificateScannerProps {
    onComplete?: (garden: LocalStorage.GardenLocal) => void;
    onClose: () => void;
}

// Mock OCR result for demo (in production, use Tesseract.js)
const MOCK_OCR_RESULT = `
BẢNG TỌA ĐỘ CÁC ĐIỂM GÓC RANH
Hệ tọa độ: VN-2000, KTT: 108°15'
Điểm 1: X = 1551234.56, Y = 543210.78
Điểm 2: X = 1551345.67, Y = 543310.89
Điểm 3: X = 1551256.78, Y = 543420.90
Điểm 4: X = 1551145.89, Y = 543320.81
Diện tích: 12,500 m²
`;

const LandCertificateScanner: React.FC<LandCertificateScannerProps> = ({ onComplete, onClose }) => {
    const { userProfile } = useDemoAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'upload' | 'processing' | 'preview' | 'success'>('upload');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<VN2000Converter.ParsedCertificateData | null>(null);
    const [wgs84Coords, setWgs84Coords] = useState<VN2000Converter.WGS84Coordinate[]>([]);
    const [areaHa, setAreaHa] = useState<number>(0);
    const [eudrResult, setEudrResult] = useState<EUDRChecker.EUDRCheckResult | null>(null);
    const [plantingYear, setPlantingYear] = useState<number>(2018);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview image
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
            processImage();
        };
        reader.readAsDataURL(file);
    }, []);

    const processImage = useCallback(() => {
        setStep('processing');

        // Simulate OCR processing (in production, use Tesseract.js)
        setTimeout(() => {
            // Parse mock result
            const parsed = VN2000Converter.parseLandCertificate(MOCK_OCR_RESULT);
            setExtractedData(parsed);

            // Convert to WGS-84
            if (parsed.coordinates.length >= 3) {
                const converted = VN2000Converter.convertCoordinatesBatch(parsed.coordinates);
                setWgs84Coords(converted);

                // Calculate area
                const calculatedArea = EUDRChecker.calculatePolygonArea(converted);
                setAreaHa(calculatedArea || (parsed.area ? parsed.area / 10000 : 0));
            }

            setStep('preview');
        }, 2000);
    }, []);

    const handleCheckEUDR = useCallback(() => {
        if (wgs84Coords.length < 3) return;

        const mockGarden = {
            id: '',
            name: '',
            boundary: wgs84Coords,
            center: {
                lat: wgs84Coords.reduce((sum, c) => sum + c.lat, 0) / wgs84Coords.length,
                lng: wgs84Coords.reduce((sum, c) => sum + c.lng, 0) / wgs84Coords.length
            },
            metrics: { areaSqM: areaHa * 10000, areaHa, estimatedTrees: Math.floor(areaHa * 10000 / 9) }
        };

        const result = EUDRChecker.checkEUDRCompliance(mockGarden, plantingYear, areaHa);
        setEudrResult(result);
    }, [wgs84Coords, plantingYear, areaHa]);

    const handleSave = useCallback(() => {
        if (!userProfile || wgs84Coords.length < 3) return;

        const garden: LocalStorage.GardenLocal = {
            id: `garden_${Date.now()}`,
            userId: userProfile.uid,
            name: 'Vườn từ Sổ đỏ',
            boundary: wgs84Coords,
            center: {
                lat: wgs84Coords.reduce((sum, c) => sum + c.lat, 0) / wgs84Coords.length,
                lng: wgs84Coords.reduce((sum, c) => sum + c.lng, 0) / wgs84Coords.length
            },
            areaHa,
            plantingYear,
            eudrStatus: eudrResult?.isCompliant ? 'passed' : 'pending',
            sourceType: 'certificate_scan',
            createdAt: new Date().toISOString()
        };

        LocalStorage.saveGarden(garden);

        // Award points
        RewardSystem.addPoints(userProfile.uid, 'SCAN_CERTIFICATE');
        if (eudrResult?.isCompliant) {
            RewardSystem.addPoints(userProfile.uid, 'EUDR_COMPLIANT');
        }

        setStep('success');
        setTimeout(() => {
            onComplete?.(garden);
        }, 2000);
    }, [userProfile, wgs84Coords, areaHa, plantingYear, eudrResult, onComplete]);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white rounded-t-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10 rounded-t-[2rem]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold">Quét Sổ Đỏ</h2>
                            <p className="text-xs text-gray-500">OCR + VN-2000 → WGS-84</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Upload Step */}
                {step === 'upload' && (
                    <div className="p-6 space-y-5">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="font-bold text-blue-800 mb-2">Hướng dẫn</h3>
                            <ol className="text-sm text-blue-700 space-y-1">
                                <li>1. Chụp ảnh mặt sau Sổ đỏ (có bảng tọa độ)</li>
                                <li>2. Đảm bảo ảnh rõ nét, đủ sáng</li>
                                <li>3. App sẽ tự đọc và chuyển đổi tọa độ</li>
                            </ol>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-green-300 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors"
                        >
                            <Camera className="h-8 w-8 text-green-600" />
                            <span className="font-bold text-green-700">Chụp ảnh Sổ đỏ</span>
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-3 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <Upload className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-600">Hoặc chọn ảnh từ thư viện</span>
                        </button>

                        {/* Demo button */}
                        <button
                            onClick={() => {
                                setImagePreview('/demo-sodo.jpg');
                                processImage();
                            }}
                            className="w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-medium"
                        >
                            🎯 Demo: Dùng ảnh mẫu
                        </button>
                    </div>
                )}

                {/* Processing Step */}
                {step === 'processing' && (
                    <div className="p-6 text-center space-y-5">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Đang xử lý...</h3>
                            <p className="text-gray-500 text-sm">Đọc tọa độ VN-2000 và chuyển đổi</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-600">OCR nhận diện văn bản...</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-600">Chuyển đổi VN-2000 → WGS-84...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview Step */}
                {step === 'preview' && extractedData && (
                    <div className="p-6 space-y-5">
                        {/* Extracted Coordinates */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-bold text-green-800">Đã nhận diện {extractedData.coordinates.length} điểm tọa độ</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                {wgs84Coords.slice(0, 4).map((coord, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-green-500" />
                                        <span className="font-mono">{coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Area */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Diện tích</span>
                                <span className="font-bold text-lg">{areaHa.toFixed(2)} ha</span>
                            </div>
                        </div>

                        {/* Planting Year */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Năm bắt đầu trồng cà phê
                            </label>
                            <select
                                value={plantingYear}
                                onChange={e => setPlantingYear(parseInt(e.target.value))}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                            >
                                {Array.from({ length: 40 }, (_, i) => 2024 - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* EUDR Check */}
                        {!eudrResult ? (
                            <button
                                onClick={handleCheckEUDR}
                                className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-bold"
                            >
                                🌍 Kiểm tra EUDR
                            </button>
                        ) : (
                            <div className={`rounded-xl p-4 ${eudrResult.isCompliant ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {eudrResult.isCompliant ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                    )}
                                    <span className={`font-bold ${eudrResult.isCompliant ? 'text-green-800' : 'text-amber-800'}`}>
                                        {eudrResult.isCompliant ? 'EUDR Compliant ✓' : 'Cần bổ sung thông tin'}
                                    </span>
                                </div>
                                <div className="text-sm space-y-1">
                                    {Object.entries(eudrResult.checks).map(([key, value]: [string, { passed: boolean; message: string }]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <span className={value.passed ? 'text-green-500' : 'text-gray-400'}>
                                                {value.passed ? '✓' : '○'}
                                            </span>
                                            <span className="text-gray-600">{value.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={20} />
                            Lưu vườn
                        </button>
                    </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="p-6 text-center space-y-5">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Lưu thành công!</h3>
                            <p className="text-gray-500">Vườn đã được thêm vào hồ sơ của bạn</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-amber-800">
                                <Sparkles className="inline h-4 w-4 mr-1" />
                                Bạn nhận được <strong>+30</strong> điểm thưởng!
                                {eudrResult?.isCompliant && ' +100 điểm EUDR!'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandCertificateScanner;
