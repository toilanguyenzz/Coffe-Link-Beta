import React, { useState, useCallback } from 'react';
import { X, MapPin, ChevronRight } from 'lucide-react';

// Đơn vị diện tích địa phương và hệ số quy đổi sang m²
const AREA_UNITS = [
    { id: 'hecta', name: 'Hecta', shortName: 'Ha', factor: 10000, description: 'Chuẩn quốc tế' },
    { id: 'sao_bac_bo', name: 'Sào Bắc Bộ', shortName: 'Sào BB', factor: 360, description: 'Miền Bắc' },
    { id: 'sao_tay_nguyen', name: 'Sào Tây Nguyên', shortName: 'Sào TN', factor: 500, description: 'Tây Nguyên' },
    { id: 'cong_dat', name: 'Công đất', shortName: 'Công', factor: 1000, description: 'Miền Nam' },
] as const;

type AreaUnitId = typeof AREA_UNITS[number]['id'];

interface SmartInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (targetAreaHa: number, targetAreaM2: number, displayValue: number, unitId: AreaUnitId) => void;
}

const SmartInputModal: React.FC<SmartInputModalProps> = ({ isOpen, onClose, onStart }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [selectedUnit, setSelectedUnit] = useState<AreaUnitId>('hecta');

    const selectedUnitData = AREA_UNITS.find(u => u.id === selectedUnit)!;

    // Tính diện tích quy đổi
    const numValue = parseFloat(inputValue) || 0;
    const areaInM2 = numValue * selectedUnitData.factor;
    const areaInHa = areaInM2 / 10000;

    const handleStart = useCallback(() => {
        if (numValue > 0) {
            onStart(areaInHa, areaInM2, numValue, selectedUnit);
        }
    }, [numValue, areaInHa, areaInM2, selectedUnit, onStart]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Chỉ cho phép số và dấu chấm
        if (/^\d*\.?\d*$/.test(value)) {
            setInputValue(value);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Floating Card */}
            <div
                className="relative w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                style={{
                    background: 'linear-gradient(180deg, #0A1F1C 0%, #000000 100%)',
                    border: '2px solid rgba(0, 255, 148, 0.3)',
                    boxShadow: '0 0 40px rgba(0, 255, 148, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#00FF94]/10">
                            <MapPin className="h-5 w-5 text-[#00FF94]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Khởi Tạo Vườn</h2>
                            <p className="text-xs text-white/50">Bước 1/5</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5 text-white/50" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-6">
                    {/* Question */}
                    <p className="text-white/80 text-center text-base">
                        Bác ước lượng vườn này rộng khoảng bao nhiêu?
                    </p>

                    {/* Input Field */}
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="VD: 1.2"
                            className="w-full px-5 py-4 text-2xl font-bold text-center text-white bg-white/5 border-2 border-white/20 rounded-xl focus:border-[#00FF94] focus:outline-none focus:ring-0 transition-colors placeholder:text-white/30"
                            style={{
                                boxShadow: inputValue ? '0 0 20px rgba(0, 255, 148, 0.2)' : 'none',
                            }}
                        />
                        {numValue > 0 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#00FF94] font-medium">
                                {selectedUnitData.shortName}
                            </div>
                        )}
                    </div>

                    {/* Unit Selector */}
                    <div className="space-y-2">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Chọn đơn vị</p>
                        <div className="grid grid-cols-2 gap-2">
                            {AREA_UNITS.map((unit) => (
                                <button
                                    key={unit.id}
                                    onClick={() => setSelectedUnit(unit.id)}
                                    className={`px-4 py-3 rounded-xl text-left transition-all duration-200 ${selectedUnit === unit.id
                                        ? 'bg-[#00FF94]/20 border-2 border-[#00FF94]'
                                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <span className={`text-sm font-bold ${selectedUnit === unit.id ? 'text-[#00FF94]' : 'text-white'
                                        }`}>
                                        {unit.name}
                                    </span>
                                    <span className="block text-[10px] text-white/40 mt-0.5">
                                        {unit.description} • {unit.factor.toLocaleString('vi-VN')} m²
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversion Display */}
                    {numValue > 0 && (
                        <div className="p-4 rounded-xl bg-[#00FF94]/5 border border-[#00FF94]/20">
                            <p className="text-center text-sm text-white/60">Quy đổi tương đương:</p>
                            <p className="text-center text-xl font-bold text-[#FFD700] mt-1">
                                {areaInHa >= 0.01
                                    ? `${areaInHa.toFixed(4)} Hecta`
                                    : `${areaInM2.toFixed(0)} m²`
                                }
                            </p>
                            {areaInHa >= 0.01 && (
                                <p className="text-center text-xs text-white/40 mt-1">
                                    ≈ {areaInM2.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} m²
                                </p>
                            )}
                        </div>
                    )}

                    {/* Start Button */}
                    <button
                        onClick={handleStart}
                        disabled={numValue <= 0}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: numValue > 0
                                ? 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            color: numValue > 0 ? '#000' : '#666',
                            boxShadow: numValue > 0 ? '0 0 30px rgba(0, 255, 148, 0.5)' : 'none',
                        }}
                    >
                        Bắt Đầu Vẽ
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartInputModal;
