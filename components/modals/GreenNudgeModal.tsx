/**
 * GreenNudgeModal.tsx
 * 
 * "Cú Huých Xanh" - Intervention popup when farmer selects harmful products
 * Shows warning, point deduction, and green alternatives
 * 
 * Features:
 * - Orange/Red warning appearance
 * - Clear point impact display
 * - Alternative product suggestions
 * - [Vẫn dùng] vs [Đổi sang xanh] actions
 */

import React, { useState } from 'react';
import {
    AlertTriangle,
    X,
    Leaf,
    ArrowRight,
    MinusCircle,
    PlusCircle,
    Ban,
    Sparkles
} from 'lucide-react';
import { ProductCheckResult } from '../../services/GreenCreditService';
import { BlacklistProduct } from '../../data/ProductBlacklist';

interface GreenNudgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    productCheck: ProductCheckResult;
    productName: string;
    onConfirmHarmful: () => void;  // User chooses to use harmful product anyway
    onSwitchToGreen: (alternativeName: string) => void;  // User switches to green alternative
    currentPoints: number;
}

const GreenNudgeModal: React.FC<GreenNudgeModalProps> = ({
    isOpen,
    onClose,
    productCheck,
    productName,
    onConfirmHarmful,
    onSwitchToGreen,
    currentPoints
}) => {
    const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

    if (!isOpen) return null;

    const pointsAfterDeduction = currentPoints + productCheck.pointChange;
    const isHarmful = productCheck.isHarmful;

    return (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className={`w-full max-w-md rounded-t-3xl ${isHarmful ? 'bg-gradient-to-b from-orange-500 to-red-600' : 'bg-gradient-to-b from-green-500 to-emerald-600'} shadow-2xl animate-in slide-in-from-bottom duration-300`}
            >
                {/* Header */}
                <div className="relative p-5 pb-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl ${isHarmful ? 'bg-red-400/30' : 'bg-green-400/30'} flex items-center justify-center`}>
                            {isHarmful ? (
                                <AlertTriangle className="w-8 h-8 text-yellow-300" />
                            ) : (
                                <Leaf className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-white text-xl font-bold">
                                {isHarmful ? 'Cảnh báo Tín Dụng Xanh!' : 'Tuyệt vời!'}
                            </h2>
                            <p className="text-white/80 text-sm">
                                {isHarmful ? 'Sản phẩm này có hại' : 'Lựa chọn thân thiện môi trường'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-t-3xl p-5">
                    {/* Product being checked */}
                    <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isHarmful ? (
                                    <Ban className="w-5 h-5 text-red-500" />
                                ) : (
                                    <Leaf className="w-5 h-5 text-green-500" />
                                )}
                                <span className="font-bold text-gray-800">{productName}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${isHarmful ? 'text-red-500' : 'text-green-500'} font-bold`}>
                                {isHarmful ? (
                                    <>
                                        <MinusCircle className="w-4 h-4" />
                                        <span>{Math.abs(productCheck.pointChange)} điểm</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4" />
                                        <span>+{productCheck.pointChange} điểm</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warning message */}
                    <div className={`p-4 rounded-2xl mb-4 ${isHarmful ? 'bg-orange-50 border-2 border-orange-200' : 'bg-green-50 border-2 border-green-200'}`}>
                        <p className={`text-sm leading-relaxed ${isHarmful ? 'text-orange-800' : 'text-green-800'}`}>
                            {productCheck.warningText}
                        </p>
                    </div>

                    {/* Points impact */}
                    {isHarmful && (
                        <div className="bg-red-50 rounded-2xl p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-red-700 text-sm">Điểm hiện tại:</span>
                                <span className="text-red-700 font-bold">{currentPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-center my-2">
                                <ArrowRight className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-red-700 text-sm">Sau khi dùng:</span>
                                <span className="text-red-700 font-bold">{pointsAfterDeduction.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Alternatives */}
                    {isHarmful && productCheck.alternatives.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-green-500" />
                                Gợi ý thay thế (+20 điểm mỗi lựa chọn)
                            </h3>
                            <div className="space-y-2">
                                {productCheck.alternatives.map((alt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedAlternative(alt)}
                                        className={`w-full p-3 rounded-xl border-2 text-left transition-all ${selectedAlternative === alt
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 bg-gray-50 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-green-500" />
                                                <span className="font-medium text-gray-800">{alt}</span>
                                            </div>
                                            <div className="text-green-500 text-sm font-bold">+20</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-3">
                        {isHarmful ? (
                            <>
                                {selectedAlternative && (
                                    <button
                                        onClick={() => onSwitchToGreen(selectedAlternative)}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                    >
                                        <Leaf className="w-5 h-5" />
                                        Đổi sang {selectedAlternative}
                                    </button>
                                )}
                                <button
                                    onClick={onConfirmHarmful}
                                    className="w-full bg-gray-200 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Ban className="w-4 h-4" />
                                    Vẫn dùng (Chấp nhận trừ {Math.abs(productCheck.pointChange)} điểm)
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Sparkles className="w-5 h-5" />
                                Tuyệt vời! Tiếp tục
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GreenNudgeModal;
