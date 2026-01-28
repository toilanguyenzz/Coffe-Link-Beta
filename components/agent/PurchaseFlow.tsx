/**
 * PurchaseFlow.tsx
 * Thu mua tab - 4-step purchase wizard
 * Step 1: Quét QR/SĐT → Step 2: EUDR Check → Step 3: Nhập lô → Step 4: Thanh toán
 */

import React, { useState } from 'react';
import {
    QrCode,
    Phone,
    Shield,
    AlertTriangle,
    CheckCircle,
    Scale,
    Droplets,
    Trash2,
    Calculator,
    Printer,
    Send,
    ArrowLeft,
    ArrowRight,
    Loader2,
    User,
    MapPin,
    Leaf
} from 'lucide-react';
import { CoffeeType, COFFEE_TYPE_LABELS, EudrStatus, DEFAULT_PRICES } from '../../types/AgentTypes';
import { formatFullCurrency } from '../../types/LedgerTypes';

// Purchase steps
type PurchaseStep = 'SCAN' | 'EUDR' | 'LOT' | 'PAYMENT';

// Mock farmer data
const MOCK_FARMERS: Record<string, any> = {
    '0359123456': {
        id: 'farmer_1',
        name: 'Nguyễn Văn Hùng',
        phone: '0359123456',
        address: 'Xã Nghĩa Hưng, Chư Păh',
        gardenArea: 2.5, // hectares
        eudrStatus: 'PASSED' as EudrStatus,
        shadeTreeCount: 50,
        qualityGrade: 'A',
        debt: 5000000, // 5 triệu
    },
    '0987654321': {
        id: 'farmer_2',
        name: 'Trần Thị Lan',
        phone: '0987654321',
        address: 'Xã Ia Sao, Ia Grai',
        gardenArea: 1.8,
        eudrStatus: 'WARNING' as EudrStatus,
        shadeTreeCount: 10,
        qualityGrade: 'B',
        debt: 0,
    },
};

const PurchaseFlow: React.FC = () => {
    // Step state
    const [currentStep, setCurrentStep] = useState<PurchaseStep>('SCAN');

    // Farmer state
    const [phoneInput, setPhoneInput] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    // Lot entry state
    const [coffeeType, setCoffeeType] = useState<CoffeeType>('BEAN');
    const [weight, setWeight] = useState('');
    const [moisture, setMoisture] = useState(12);
    const [impurity, setImpurity] = useState(1);

    // Payment state
    const [applyDebt, setApplyDebt] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Calculate price based on EUDR status
    const calculatePrice = (): number => {
        if (!selectedFarmer) return 0;
        const basePrice = DEFAULT_PRICES[selectedFarmer.eudrStatus];
        // Adjust for moisture and impurity
        const moistureAdjust = moisture > 12 ? (moisture - 12) * 500 : 0;
        const impurityAdjust = impurity > 1 ? (impurity - 1) * 300 : 0;
        return Math.max(basePrice - moistureAdjust - impurityAdjust, 50000);
    };

    const pricePerKg = calculatePrice();
    const weightNum = parseFloat(weight) || 0;
    const totalAmount = pricePerKg * weightNum;
    const debtToApply = applyDebt ? Math.min(selectedFarmer?.debt || 0, totalAmount) : 0;
    const amountToPay = totalAmount - debtToApply;

    // Handler: Scan farmer
    const handleScanFarmer = () => {
        setScanning(true);
        setTimeout(() => {
            const farmer = MOCK_FARMERS[phoneInput];
            if (farmer) {
                setSelectedFarmer(farmer);
                setCurrentStep('EUDR');
            } else {
                alert('Không tìm thấy nông dân với SĐT này');
            }
            setScanning(false);
        }, 1000);
    };

    // Handler: Complete purchase
    const handleCompletePurchase = () => {
        setProcessing(true);
        setTimeout(() => {
            alert('🎉 Thu mua thành công!\n\nMã lô: LOT-' + Date.now().toString(36).toUpperCase());
            // Reset flow
            setCurrentStep('SCAN');
            setSelectedFarmer(null);
            setPhoneInput('');
            setWeight('');
            setMoisture(12);
            setImpurity(1);
            setProcessing(false);
        }, 1500);
    };

    // Go back
    const goBack = () => {
        const steps: PurchaseStep[] = ['SCAN', 'EUDR', 'LOT', 'PAYMENT'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    return (
        <div className="mt-4 space-y-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* STEP INDICATOR */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between px-2">
                {['SCAN', 'EUDR', 'LOT', 'PAYMENT'].map((step, index) => {
                    const steps: PurchaseStep[] = ['SCAN', 'EUDR', 'LOT', 'PAYMENT'];
                    const isActive = steps.indexOf(currentStep) >= index;
                    const isCurrent = currentStep === step;

                    return (
                        <React.Fragment key={step}>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isCurrent
                                        ? 'bg-emerald-500 text-white scale-110'
                                        : isActive
                                            ? 'bg-emerald-500/50 text-white'
                                            : 'bg-white/10 text-white/40'
                                    }`}
                            >
                                {index + 1}
                            </div>
                            {index < 3 && (
                                <div className={`flex-1 h-1 mx-2 rounded ${steps.indexOf(currentStep) > index ? 'bg-emerald-500' : 'bg-white/10'
                                    }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* STEP 1: QUÉT FARMER */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {currentStep === 'SCAN' && (
                <div
                    className="p-5 rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-emerald-400" />
                        Quét người bán
                    </h3>

                    {/* QR Scan Button */}
                    <button
                        className="w-full py-6 rounded-xl bg-emerald-500/20 border-2 border-dashed border-emerald-500/50 flex flex-col items-center gap-2 mb-4 active:scale-[0.98] transition-all"
                    >
                        <QrCode className="w-12 h-12 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Quét mã QR</span>
                    </button>

                    <div className="text-center text-white/40 text-sm mb-4">hoặc</div>

                    {/* Phone Input */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="Nhập SĐT nông dân"
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-emerald-400"
                            />
                        </div>
                        <button
                            onClick={handleScanFarmer}
                            disabled={!phoneInput || scanning}
                            className="px-6 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-50 flex items-center gap-2"
                        >
                            {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tìm'}
                        </button>
                    </div>

                    <p className="text-white/40 text-xs mt-3 text-center">
                        Demo: Thử SĐT <span className="text-emerald-400">0359123456</span> (EUDR OK) hoặc <span className="text-amber-400">0987654321</span> (Cảnh báo)
                    </p>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* STEP 2: EUDR CHECK */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {currentStep === 'EUDR' && selectedFarmer && (
                <div className="space-y-4">
                    {/* Farmer Info */}
                    <div
                        className="p-4 rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{selectedFarmer.name}</h4>
                                <div className="flex items-center gap-1 text-white/50 text-sm">
                                    <MapPin className="w-3 h-3" />
                                    {selectedFarmer.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EUDR Status Card */}
                    <div
                        className="p-5 rounded-2xl"
                        style={{
                            background: selectedFarmer.eudrStatus === 'PASSED'
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                            border: selectedFarmer.eudrStatus === 'PASSED'
                                ? '1px solid rgba(34, 197, 94, 0.4)'
                                : '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {selectedFarmer.eudrStatus === 'PASSED' ? (
                                <>
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                    <div>
                                        <h3 className="text-green-400 font-bold text-lg">ĐÈN XANH - EUDR Hợp lệ</h3>
                                        <p className="text-green-300/70 text-sm">Vườn đạt tiêu chuẩn xuất khẩu EU</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                    <div>
                                        <h3 className="text-red-400 font-bold text-lg">⚠️ CẢNH BÁO</h3>
                                        <p className="text-red-300/70 text-sm">Lô này chỉ bán nội địa được</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-white/50 text-xs mb-1">
                                    <Leaf className="w-3 h-3" />
                                    Cây che bóng
                                </div>
                                <p className="text-white font-bold">{selectedFarmer.shadeTreeCount} cây</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-white/50 text-xs mb-1">
                                    <Shield className="w-3 h-3" />
                                    Hạng vườn
                                </div>
                                <p className="text-white font-bold">Hạng {selectedFarmer.qualityGrade}</p>
                            </div>
                        </div>

                        {/* Suggested Price */}
                        <div className="mt-4 p-3 rounded-lg bg-black/20">
                            <p className="text-white/60 text-sm mb-1">Đề xuất giá mua:</p>
                            <p className="text-2xl font-black" style={{
                                color: selectedFarmer.eudrStatus === 'PASSED' ? '#22c55e' : '#f59e0b'
                            }}>
                                {(DEFAULT_PRICES[selectedFarmer.eudrStatus] / 1000).toFixed(0)}k <span className="text-lg font-normal text-white/50">/kg</span>
                            </p>
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => setCurrentStep('LOT')}
                        className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                        Tiếp tục nhập lô hàng
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* STEP 3: NHẬP LÔ HÀNG */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {currentStep === 'LOT' && (
                <div
                    className="p-5 rounded-2xl space-y-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-400" />
                        Nhập liệu lô hàng
                    </h3>

                    {/* Coffee Type */}
                    <div>
                        <label className="text-white/60 text-sm mb-2 block">Loại hàng</label>
                        <div className="flex gap-2">
                            {(['FRESH', 'BEAN', 'HUSK'] as CoffeeType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setCoffeeType(type)}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${coffeeType === type
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white/10 text-white/60'
                                        }`}
                                >
                                    {COFFEE_TYPE_LABELS[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="text-white/60 text-sm mb-2 block flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Khối lượng (kg)
                        </label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="VD: 500"
                            className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-xl font-bold placeholder:text-white/30 outline-none focus:border-emerald-400"
                        />
                    </div>

                    {/* Moisture Slider */}
                    <div>
                        <label className="text-white/60 text-sm mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Droplets className="w-4 h-4" />
                                Độ ẩm
                            </span>
                            <span className="text-white font-bold">{moisture}%</span>
                        </label>
                        <input
                            type="range"
                            min="8"
                            max="20"
                            value={moisture}
                            onChange={(e) => setMoisture(parseInt(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-white/40">
                            <span>8%</span>
                            <span>20%</span>
                        </div>
                    </div>

                    {/* Impurity Slider */}
                    <div>
                        <label className="text-white/60 text-sm mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Tạp chất
                            </span>
                            <span className="text-white font-bold">{impurity}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={impurity}
                            onChange={(e) => setImpurity(parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={() => setCurrentStep('PAYMENT')}
                        disabled={!weight || parseFloat(weight) <= 0}
                        className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                    >
                        Tính tiền
                        <Calculator className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* STEP 4: THANH TOÁN */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {currentStep === 'PAYMENT' && selectedFarmer && (
                <div className="space-y-4">
                    {/* Payment Summary */}
                    <div
                        className="p-5 rounded-2xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                    >
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-emerald-400" />
                            Tổng kết giao dịch
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-white/70">
                                <span>Khối lượng:</span>
                                <span className="font-bold text-white">{weight} kg</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                                <span>Đơn giá:</span>
                                <span className="font-bold text-white">{formatFullCurrency(pricePerKg)}/kg</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                                <span>Thành tiền:</span>
                                <span className="font-bold text-white">{formatFullCurrency(totalAmount)}</span>
                            </div>

                            {/* Debt Alert */}
                            {selectedFarmer.debt > 0 && (
                                <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-amber-400 font-medium text-sm">
                                                {selectedFarmer.name} đang nợ {formatFullCurrency(selectedFarmer.debt)}
                                            </p>
                                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={applyDebt}
                                                    onChange={(e) => setApplyDebt(e.target.checked)}
                                                    className="w-4 h-4 accent-amber-500"
                                                />
                                                <span className="text-white text-sm">Trừ nợ vào đơn này</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {applyDebt && debtToApply > 0 && (
                                <div className="flex justify-between text-amber-400">
                                    <span>Trừ nợ:</span>
                                    <span className="font-bold">-{formatFullCurrency(debtToApply)}</span>
                                </div>
                            )}

                            <hr className="border-white/10" />

                            <div className="flex justify-between text-lg">
                                <span className="text-white font-bold">Còn phải trả:</span>
                                <span className="text-2xl font-black text-emerald-400">
                                    {formatFullCurrency(amountToPay)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            className="py-4 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <Printer className="w-5 h-5" />
                            In hóa đơn
                        </button>
                        <button
                            className="py-4 rounded-xl bg-cyan-500/80 text-white font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                            <Send className="w-5 h-5" />
                            Gửi App
                        </button>
                    </div>

                    {/* Complete Button */}
                    <button
                        onClick={handleCompletePurchase}
                        disabled={processing}
                        className="w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-white"
                        style={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                        }}
                    >
                        {processing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-6 h-6" />
                                HOÀN TẤT THU MUA
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Back Button (for steps 2-4) */}
            {currentStep !== 'SCAN' && (
                <button
                    onClick={goBack}
                    className="w-full py-3 text-white/50 flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
            )}
        </div>
    );
};

export default PurchaseFlow;
