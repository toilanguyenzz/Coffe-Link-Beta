/**
 * CampaignJoinModal.tsx - Modal tham gia Campaign với Giá Trượt
 * Hiển thị sliding price, tính tiền, confirm order
 */

import React, { useState, useMemo } from 'react';
import { Campaign } from '../../types';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import * as PricingEngine from '../../services/PricingEngine';
import * as RewardSystem from '../../services/RewardSystem';
import * as LocalStorage from '../../services/LocalStorageService';
import { X, Package, TrendingDown, Check, QrCode, Sparkles, AlertTriangle } from 'lucide-react';

interface CampaignJoinModalProps {
    campaign: Campaign;
    onClose: () => void;
    onSuccess?: () => void;
}

const CampaignJoinModal: React.FC<CampaignJoinModalProps> = ({ campaign, onClose, onSuccess }) => {
    const { userProfile } = useDemoAuth();
    const [quantity, setQuantity] = useState(campaign.minOrderQuantity || 1);
    const [step, setStep] = useState<'order' | 'confirm' | 'success'>('order');
    const [orderResult, setOrderResult] = useState<LocalStorage.CampaignOrderLocal | null>(null);

    // Calculate pricing
    const pricingInfo = useMemo(() => {
        return PricingEngine.calculateSavings(campaign, quantity, quantity);
    }, [campaign, quantity]);

    const currentTier = PricingEngine.getCurrentPriceTier(campaign);
    const preview = PricingEngine.previewPriceWithOrder(campaign, quantity);
    const progress = ((campaign.currentQuantity + quantity) / campaign.targetQuantity) * 100;

    const handleQuantityChange = (delta: number) => {
        const newQty = Math.max(campaign.minOrderQuantity || 1, quantity + delta);
        setQuantity(newQty);
    };

    const handleConfirmOrder = () => {
        if (!userProfile) return;

        // Create order
        const order: LocalStorage.CampaignOrderLocal = {
            id: `order_${Date.now()}`,
            campaignId: campaign.id,
            userId: userProfile.uid,
            quantity,
            totalAmount: pricingInfo.totalPrice,
            depositAmount: Math.round(pricingInfo.totalPrice * 0.3),
            depositPaid: false,
            slidingPrice: pricingInfo.pricePerUnit,
            pickupQrCode: `QR-${campaign.deepLinkCode}-${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString()
        };

        // Save to LocalStorage
        LocalStorage.saveCampaignOrder(order);

        // Add reward points
        RewardSystem.addPoints(userProfile.uid, 'JOIN_CAMPAIGN');
        RewardSystem.addPoints(userProfile.uid, 'PURCHASE', pricingInfo.totalPrice);

        // Log action
        LocalStorage.logUserAction(userProfile.uid, 'JOIN_CAMPAIGN', {
            campaignId: campaign.id,
            quantity,
            totalAmount: pricingInfo.totalPrice
        });

        setOrderResult(order);
        setStep('success');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white rounded-t-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
                    <h2 className="font-bold text-lg">
                        {step === 'success' ? '🎉 Đặt hàng thành công!' : 'Tham gia Deal'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {step === 'order' && (
                    <div className="p-6 space-y-5">
                        {/* Campaign Info */}
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                                <Package className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{campaign.productName}</h3>
                                <p className="text-sm text-gray-500">{campaign.unit}</p>
                            </div>
                        </div>

                        {/* Progress Bar with Tiers */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium">Tiến độ gom đơn</span>
                                <span className="font-bold" style={{ color: currentTier.color }}>
                                    {currentTier.label}
                                </span>
                            </div>
                            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                />
                                {/* Tier markers */}
                                {[20, 40, 60, 80].map(mark => (
                                    <div
                                        key={mark}
                                        className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                                        style={{ left: `${mark}%` }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{campaign.currentQuantity}/{campaign.targetQuantity}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </div>

                        {/* Sliding Price Display */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-5 w-5 text-amber-600" />
                                <span className="font-bold text-amber-800">Giá Trượt</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-black text-gray-900">
                                    {PricingEngine.formatVND(pricingInfo.pricePerUnit)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {PricingEngine.formatVND(campaign.originalPrice)}
                                </span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                    -{pricingInfo.savedPercent}%
                                </span>
                            </div>
                            {preview.willUnlockNewTier && (
                                <p className="text-xs text-amber-700 mt-2">
                                    <Sparkles className="inline h-3 w-3 mr-1" />
                                    Đơn của bạn sẽ mở khóa mức giá mới!
                                </p>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số lượng ({campaign.unit})
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= (campaign.minOrderQuantity || 1)}
                                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold disabled:opacity-50"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={e => setQuantity(Math.max(campaign.minOrderQuantity || 1, parseInt(e.target.value) || 1))}
                                    className="flex-1 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0"
                                />
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                                >
                                    +
                                </button>
                            </div>
                            {campaign.minOrderQuantity && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Tối thiểu: {campaign.minOrderQuantity} {campaign.unit}
                                </p>
                            )}
                        </div>

                        {/* Total */}
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="text-xl font-black text-green-700">
                                    {PricingEngine.formatVND(pricingInfo.totalPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Tiết kiệm được</span>
                                <span className="font-bold text-green-600">
                                    {PricingEngine.formatVND(pricingInfo.savedAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={() => setStep('confirm')}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                        >
                            Tiếp tục
                        </button>
                    </div>
                )}

                {step === 'confirm' && (
                    <div className="p-6 space-y-5">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold mb-1">Xác nhận đơn hàng</p>
                                <p>Bạn sẽ đặt cọc <strong>{PricingEngine.formatVND(Math.round(pricingInfo.totalPrice * 0.3))}</strong> (30%) khi nhận hàng tại Trạm.</p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Sản phẩm</span>
                                <span className="font-medium">{campaign.productName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số lượng</span>
                                <span className="font-medium">{quantity} {campaign.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Đơn giá</span>
                                <span className="font-medium">{PricingEngine.formatVND(pricingInfo.pricePerUnit)}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between text-lg">
                                <span className="font-bold">Tổng cộng</span>
                                <span className="font-black text-green-700">{PricingEngine.formatVND(pricingInfo.totalPrice)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('order')}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmOrder}
                                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                Xác nhận
                            </button>
                        </div>
                    </div>
                )}

                {step === 'success' && orderResult && (
                    <div className="p-6 text-center space-y-5">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="h-10 w-10 text-green-600" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
                            <p className="text-gray-500">Mã đơn: <span className="font-mono font-bold">{orderResult.id.slice(-8).toUpperCase()}</span></p>
                        </div>

                        {/* QR Code placeholder */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="w-40 h-40 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <QrCode className="h-20 w-20 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">Mã QR nhận hàng</p>
                            <p className="font-mono font-bold text-lg">{orderResult.pickupQrCode}</p>
                        </div>

                        {/* Reward points */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-amber-800">
                                <Sparkles className="inline h-4 w-4 mr-1" />
                                Bạn nhận được <strong>+{10 + Math.floor(pricingInfo.totalPrice / 10000)}</strong> điểm thưởng!
                            </p>
                        </div>

                        <button
                            onClick={() => { onClose(); onSuccess?.(); }}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl"
                        >
                            Hoàn tất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignJoinModal;
