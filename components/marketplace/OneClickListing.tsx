/**
 * OneClickListing.tsx
 * Full-screen modal for quick product listing (≤30 seconds flow)
 * Camera capture + Quick form + GPS auto-attach
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Camera,
    Image as ImageIcon,
    MapPin,
    Package,
    Loader2,
    Check,
    ChevronDown,
    Trash2
} from 'lucide-react';
import { ProductCategory, PRODUCT_CATEGORIES, ListingFormData } from '../../types/MarketplaceTypes';

interface OneClickListingProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: ListingFormData, location: { lat: number; lng: number }) => Promise<void>;
}

const OneClickListing: React.FC<OneClickListingProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    // Form state
    const [category, setCategory] = useState<ProductCategory>('COFFEE_HUSK');
    const [estimatedWeight, setEstimatedWeight] = useState<string>('');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'tan'>('tan');
    const [pricePerUnit, setPricePerUnit] = useState<string>('');
    const [negotiable, setNegotiable] = useState(true);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string>('');
    const [error, setError] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get GPS location on mount
    useEffect(() => {
        if (isOpen && !location) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (err) => {
                        console.error('GPS error:', err);
                        setLocationError('Không thể lấy vị trí. Vui lòng bật GPS.');
                        // Default to Gia Lai area
                        setLocation({ lat: 13.9833, lng: 108.0 });
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                setLocationError('Trình duyệt không hỗ trợ GPS');
                setLocation({ lat: 13.9833, lng: 108.0 });
            }
        }
    }, [isOpen, location]);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            setError('Tối đa 5 ảnh');
            return;
        }

        // Validate file types
        const validFiles = files.filter(f =>
            ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
        );

        if (validFiles.length < files.length) {
            setError('Chỉ hỗ trợ ảnh JPG, PNG, WebP');
        }

        // Create preview URLs
        const newPreviewUrls = validFiles.map(f => URL.createObjectURL(f));

        setImages(prev => [...prev, ...validFiles]);
        setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        setError('');
    };

    // Remove image
    const removeImage = (index: number) => {
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submit
    const handleSubmit = async () => {
        // Validation
        if (images.length === 0) {
            setError('Vui lòng chụp hoặc chọn ít nhất 1 ảnh');
            return;
        }
        if (!estimatedWeight || parseFloat(estimatedWeight) <= 0) {
            setError('Vui lòng nhập khối lượng ước tính');
            return;
        }
        if (!location) {
            setError('Đang lấy vị trí GPS, vui lòng đợi...');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formData: ListingFormData = {
                category,
                estimatedWeight: parseFloat(estimatedWeight),
                weightUnit,
                pricePerUnit: pricePerUnit ? parseInt(pricePerUnit.replace(/[,.]/g, '')) : undefined,
                negotiable,
                images,
            };

            await onSubmit(formData, location);

            // Reset form and close
            resetForm();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setCategory('COFFEE_HUSK');
        setEstimatedWeight('');
        setWeightUnit('tan');
        setPricePerUnit('');
        setNegotiable(true);
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setImages([]);
        setImagePreviewUrls([]);
        setError('');
    };

    // Get selected category info
    const selectedCategory = PRODUCT_CATEGORIES.find(c => c.id === category)!;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Header */}
            <div
                className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
                }}
            >
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-white text-lg font-bold">Đăng bán phụ phẩm</h2>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                {/* Image Upload Section */}
                <div className="mt-4">
                    <label className="text-white/80 text-sm font-medium mb-3 block">
                        📸 Ảnh sản phẩm (Tối đa 5 ảnh)
                    </label>

                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {/* Image previews */}
                        {imagePreviewUrls.map((url, index) => (
                            <div
                                key={index}
                                className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden"
                            >
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                                >
                                    <Trash2 className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}

                        {/* Add image button */}
                        {images.length < 5 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-1 text-white/60 hover:border-orange-400 hover:text-orange-400 transition-colors"
                            >
                                <Camera className="w-8 h-8" />
                                <span className="text-xs">Thêm ảnh</span>
                            </button>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                </div>

                {/* Category Picker */}
                <div className="mt-6">
                    <label className="text-white/80 text-sm font-medium mb-2 block">
                        📦 Loại phụ phẩm
                    </label>
                    <button
                        onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                        className="w-full p-4 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between text-white"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{selectedCategory.icon}</span>
                            <span className="font-medium">{selectedCategory.label}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {showCategoryPicker && (
                        <div className="mt-2 rounded-xl bg-gray-900 border border-white/20 overflow-hidden">
                            {PRODUCT_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setCategory(cat.id);
                                        setShowCategoryPicker(false);
                                    }}
                                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${category === cat.id
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="font-medium">{cat.label}</span>
                                    {category === cat.id && <Check className="w-5 h-5 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Weight Input */}
                <div className="mt-6">
                    <label className="text-white/80 text-sm font-medium mb-2 block">
                        ⚖️ Khối lượng ước tính
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="number"
                                value={estimatedWeight}
                                onChange={(e) => setEstimatedWeight(e.target.value)}
                                placeholder="Nhập số lượng"
                                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-orange-400"
                            />
                        </div>
                        <div className="flex rounded-xl overflow-hidden border border-white/20">
                            <button
                                onClick={() => setWeightUnit('kg')}
                                className={`px-4 py-2 font-medium transition-colors ${weightUnit === 'kg'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white/10 text-white/60'
                                    }`}
                            >
                                kg
                            </button>
                            <button
                                onClick={() => setWeightUnit('tan')}
                                className={`px-4 py-2 font-medium transition-colors ${weightUnit === 'tan'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white/10 text-white/60'
                                    }`}
                            >
                                tấn
                            </button>
                        </div>
                    </div>
                </div>

                {/* Price Input */}
                <div className="mt-6">
                    <label className="text-white/80 text-sm font-medium mb-2 block">
                        💰 Giá mong muốn (tùy chọn)
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={pricePerUnit}
                            onChange={(e) => {
                                setPricePerUnit(e.target.value.replace(/[^0-9]/g, ''));
                                if (e.target.value) setNegotiable(false);
                            }}
                            placeholder="VD: 500000"
                            disabled={negotiable}
                            className={`flex-1 p-4 rounded-xl border outline-none ${negotiable
                                    ? 'bg-white/5 border-white/10 text-white/30'
                                    : 'bg-white/10 border-white/20 text-white focus:border-orange-400'
                                }`}
                        />
                        <span className="text-white/60 text-sm">VNĐ/tấn</span>
                    </div>

                    <button
                        onClick={() => {
                            setNegotiable(!negotiable);
                            if (!negotiable) setPricePerUnit('');
                        }}
                        className={`mt-3 px-4 py-2 rounded-full text-sm font-medium transition-colors ${negotiable
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-white/10 text-white/60'
                            }`}
                    >
                        {negotiable ? '✓ Giá thỏa thuận' : 'Chọn giá thỏa thuận'}
                    </button>
                </div>

                {/* Location Status */}
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${location ? 'text-green-400' : 'text-orange-400'}`} />
                        <div>
                            <p className="text-white/80 text-sm font-medium">
                                {location ? 'Đã lấy vị trí GPS' : 'Đang lấy vị trí...'}
                            </p>
                            {locationError && (
                                <p className="text-orange-400 text-xs mt-1">{locationError}</p>
                            )}
                            {location && (
                                <p className="text-white/40 text-xs mt-1">
                                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Fixed Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pt-8">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || images.length === 0}
                    className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{
                        background: isSubmitting
                            ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                            : 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                        boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                            <span className="text-white">Đang đăng...</span>
                        </>
                    ) : (
                        <>
                            <Package className="w-5 h-5 text-white" />
                            <span className="text-white">ĐĂNG NGAY</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OneClickListing;
