import React, { useState, useCallback, useEffect } from 'react';
import { X, Trees, ChevronRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Loại cà phê phổ biến
const COFFEE_TYPES = [
    { id: 'robusta', name: 'Robusta', description: 'Cà phê vối, chịu nóng tốt' },
    { id: 'arabica', name: 'Arabica', description: 'Cà phê chè, hương vị cao cấp' },
    { id: 'chari', name: 'Chari / Liberica', description: 'Cà phê mít, ít phổ biến' },
] as const;

type CoffeeTypeId = typeof COFFEE_TYPES[number]['id'];

interface DataEnrichmentModalProps {
    isOpen: boolean;
    areaHa: number;
    onComplete: (treeCount: number, coffeeType: CoffeeTypeId) => void;
    onClose: () => void;
}

// Đánh giá mật độ cây
const getDensityFeedback = (density: number): { type: 'success' | 'warning' | 'info'; message: string } => {
    if (density < 800) {
        return {
            type: 'warning',
            message: 'Mật độ thưa, năng suất có thể thấp. Cân nhắc trồng thêm.',
        };
    } else if (density >= 800 && density <= 1200) {
        return {
            type: 'success',
            message: 'Mật độ LÝ TƯỞNG cho năng suất cao! Tuyệt vời bác ơi!',
        };
    } else {
        return {
            type: 'warning',
            message: 'Mật độ hơi dày, cây dễ bị nấm bệnh và thiếu ánh sáng.',
        };
    }
};

const DataEnrichmentModal: React.FC<DataEnrichmentModalProps> = ({
    isOpen,
    areaHa,
    onComplete,
    onClose,
}) => {
    const [treeCountInput, setTreeCountInput] = useState<string>('');
    const [selectedCoffeeType, setSelectedCoffeeType] = useState<CoffeeTypeId>('robusta');

    const treeCount = parseInt(treeCountInput) || 0;
    const density = areaHa > 0 ? Math.round(treeCount / areaHa) : 0;
    const densityFeedback = treeCount > 0 ? getDensityFeedback(density) : null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setTreeCountInput(value);
        }
    };

    const handleComplete = useCallback(() => {
        if (treeCount > 0) {
            onComplete(treeCount, selectedCoffeeType);
        }
    }, [treeCount, selectedCoffeeType, onComplete]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
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
                            <Trees className="h-5 w-5 text-[#00FF94]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Thông Tin Vườn</h2>
                            <p className="text-xs text-white/50">Bước 4/5</p>
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
                    {/* Area Display */}
                    <div className="text-center p-4 rounded-xl bg-[#00FF94]/5 border border-[#00FF94]/20">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Diện tích vườn</p>
                        <p className="text-2xl font-black text-[#FFD700] mt-1">{areaHa.toFixed(4)} Ha</p>
                    </div>

                    {/* Tree Count Input */}
                    <div className="space-y-2">
                        <p className="text-white/80 text-center">
                            Trên <span className="text-[#FFD700] font-bold">{areaHa.toFixed(2)} Ha</span> này, bác đang trồng bao nhiêu cây?
                        </p>

                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={treeCountInput}
                                onChange={handleInputChange}
                                placeholder="VD: 1300"
                                className="w-full px-5 py-4 text-2xl font-bold text-center text-white bg-white/5 border-2 border-white/20 rounded-xl focus:border-[#00FF94] focus:outline-none focus:ring-0 transition-colors placeholder:text-white/30"
                                style={{
                                    boxShadow: treeCount > 0 ? '0 0 20px rgba(0, 255, 148, 0.2)' : 'none',
                                }}
                            />
                            {treeCount > 0 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#00FF94] font-medium">
                                    cây
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Density Feedback */}
                    {densityFeedback && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 ${densityFeedback.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/30'
                            : densityFeedback.type === 'warning'
                                ? 'bg-amber-500/10 border border-amber-500/30'
                                : 'bg-blue-500/10 border border-blue-500/30'
                            }`}>
                            {densityFeedback.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            ) : densityFeedback.type === 'warning' ? (
                                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            ) : (
                                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                                <p className="text-xs text-white/40 mb-1">
                                    Mật độ: <span className="font-bold text-white">{density.toLocaleString('vi-VN')} cây/ha</span>
                                </p>
                                <p className={`text-sm font-medium ${densityFeedback.type === 'success'
                                    ? 'text-green-300'
                                    : densityFeedback.type === 'warning'
                                        ? 'text-amber-300'
                                        : 'text-blue-300'
                                    }`}>
                                    {densityFeedback.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Coffee Type Selector */}
                    <div className="space-y-2">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Loại cà phê</p>
                        <div className="grid grid-cols-3 gap-2">
                            {COFFEE_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedCoffeeType(type.id)}
                                    className={`px-3 py-3 rounded-xl text-center transition-all duration-200 ${selectedCoffeeType === type.id
                                        ? 'bg-[#00FF94]/20 border-2 border-[#00FF94]'
                                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <span className={`text-sm font-bold block ${selectedCoffeeType === type.id ? 'text-[#00FF94]' : 'text-white'
                                        }`}>
                                        {type.name}
                                    </span>
                                    <span className="block text-[9px] text-white/40 mt-0.5 leading-tight">
                                        {type.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Complete Button */}
                    <button
                        onClick={handleComplete}
                        disabled={treeCount <= 0}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: treeCount > 0
                                ? 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            color: treeCount > 0 ? '#000' : '#666',
                            boxShadow: treeCount > 0 ? '0 0 30px rgba(0, 255, 148, 0.5)' : 'none',
                        }}
                    >
                        Hoàn Thành
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataEnrichmentModal;
