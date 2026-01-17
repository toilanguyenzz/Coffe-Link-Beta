import React, { useState, useCallback, useEffect } from 'react';
import { X, Check, Camera, Clock, Shield, AlertTriangle, Sparkles } from 'lucide-react';

interface AnalysisResultModalProps {
    isOpen: boolean;
    drawnAreaHa: number;
    targetAreaHa: number;
    farmPolygon: number[][];
    onContinue: (hasRedBook: boolean, redBookImage?: string) => void;
    onClose: () => void;
}

// Mock function để check rừng (Phase 1 - Backend xử lý sau)
const checkForestOverlap = async (_polygon: number[][]): Promise<{ isForest: boolean; percentage: number }> => {
    // Giả lập delay xử lý
    await new Promise(resolve => setTimeout(resolve, 800));
    // Luôn trả về không dính rừng
    return { isForest: false, percentage: 0 };
};

const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({
    isOpen,
    drawnAreaHa,
    targetAreaHa,
    farmPolygon,
    onContinue,
    onClose,
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [forestCheck, setForestCheck] = useState<{ isForest: boolean; percentage: number } | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [redBookImage, setRedBookImage] = useState<string | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    // Tính phần trăm khớp
    const matchPercentage = targetAreaHa > 0
        ? Math.round((1 - Math.abs(drawnAreaHa - targetAreaHa) / targetAreaHa) * 100)
        : 100;
    const isGoodMatch = matchPercentage >= 90;

    // Chạy phân tích khi modal mở
    useEffect(() => {
        if (isOpen && farmPolygon.length > 0) {
            setIsAnalyzing(true);
            checkForestOverlap(farmPolygon).then(result => {
                setForestCheck(result);
                setIsAnalyzing(false);
            });
        }
    }, [isOpen, farmPolygon]);

    // Mở camera
    const openCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Camera error:', error);
            alert('Không thể mở camera. Vui lòng cho phép quyền truy cập camera.');
            setShowCamera(false);
        }
    };

    // Chụp ảnh
    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                setRedBookImage(imageData);
                closeCamera();
            }
        }
    };

    // Đóng camera
    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    // Tiếp tục với Sổ Đỏ
    const handleContinueWithRedBook = () => {
        if (redBookImage) {
            onContinue(true, redBookImage);
        } else {
            openCamera();
        }
    };

    // Tiếp tục không có Sổ Đỏ
    const handleContinueWithoutRedBook = () => {
        onContinue(false);
    };

    // Cleanup camera khi đóng modal
    useEffect(() => {
        return () => {
            closeCamera();
        };
    }, []);

    if (!isOpen) return null;

    // Camera View
    if (showCamera) {
        return (
            <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="flex-1 object-cover"
                />

                {/* Camera Overlay - Khung căn chỉnh sơ đồ */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-dashed border-[#00FF94]/50 rounded-lg" />
                    <div className="absolute top-12 left-0 right-0 text-center">
                        <p className="text-white text-sm bg-black/50 px-4 py-2 inline-block rounded-full">
                            Căn chỉnh sơ đồ đất trong khung
                        </p>
                    </div>
                </div>

                {/* Camera Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={closeCamera}
                            className="p-4 rounded-full bg-white/10 border border-white/20"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                        <button
                            onClick={captureImage}
                            className="p-6 rounded-full bg-[#00FF94] border-4 border-white"
                        >
                            <Camera className="h-8 w-8 text-black" />
                        </button>
                        <div className="w-14" /> {/* Spacer */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, #0A1F1C 0%, #000000 100%)',
                    border: '2px solid rgba(0, 255, 148, 0.5)',
                    boxShadow: '0 0 60px rgba(0, 255, 148, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                }}
            >
                {/* Analyzing State */}
                {isAnalyzing ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#00FF94]/20 border-t-[#00FF94]" />
                        <h3 className="text-lg font-bold text-white mb-2">AI đang phân tích...</h3>
                        <p className="text-sm text-white/50">Kiểm tra diện tích và vùng rừng cấm</p>
                    </div>
                ) : (
                    <>
                        {/* Header with Neon Effect */}
                        <div
                            className="p-5 text-center"
                            style={{
                                background: 'linear-gradient(180deg, rgba(0, 255, 148, 0.1) 0%, transparent 100%)',
                            }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/30 mb-3">
                                <Sparkles className="h-4 w-4 text-[#00FF94]" />
                                <span className="text-sm font-bold text-[#00FF94]">Phân Tích Hoàn Tất</span>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">
                                {isGoodMatch ? 'Tuyệt vời!' : 'Cần xem lại'}
                            </h2>
                            <p className="text-sm text-white/60">
                                Bản vẽ khớp <span className={`font-bold ${isGoodMatch ? 'text-[#00FF94]' : 'text-amber-400'}`}>{matchPercentage}%</span> với ước lượng
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="px-5 pb-4">
                            <div className="flex items-center justify-around p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Ước lượng</p>
                                    <p className="text-lg font-black text-white/60">{targetAreaHa.toFixed(2)} Ha</p>
                                </div>
                                <div className="text-3xl text-white/20">→</div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Thực tế</p>
                                    <p className="text-lg font-black text-[#FFD700]">{drawnAreaHa.toFixed(4)} Ha</p>
                                </div>
                            </div>

                            {/* Forest Check Result */}
                            {forestCheck && (
                                <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl ${forestCheck.isForest
                                    ? 'bg-red-500/10 border border-red-500/30'
                                    : 'bg-green-500/10 border border-green-500/30'
                                    }`}>
                                    {forestCheck.isForest ? (
                                        <>
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                            <span className="text-sm text-red-300">
                                                Cảnh báo: {forestCheck.percentage}% diện tích nằm trong vùng rừng
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5 text-green-400" />
                                            <span className="text-sm text-green-300">
                                                Không phát hiện chồng lấn rừng bảo vệ
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sổ Đỏ Section */}
                        <div className="px-5 pb-4">
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 255, 148, 0.05) 100%)',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-[#FFD700] mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white mb-1">
                                            Hộ Chiếu Xanh EUDR
                                        </p>
                                        <p className="text-xs text-white/50 mb-3">
                                            Để vườn được cấp chứng nhận xuất khẩu Châu Âu, bác có muốn chụp hình sơ đồ đất trong sổ đỏ không?
                                        </p>

                                        {redBookImage ? (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                                                <Check className="h-4 w-4 text-green-400" />
                                                <span className="text-sm text-green-300">Đã chụp ảnh Sổ Đỏ</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleContinueWithRedBook}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs uppercase transition-all hover:scale-[1.02]"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                                        color: '#000',
                                                    }}
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    Chụp ngay
                                                </button>
                                                <button
                                                    onClick={handleContinueWithoutRedBook}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs uppercase transition-all bg-white/5 border border-white/20 text-white/60 hover:bg-white/10"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    Để sau
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Continue Button (if already captured) */}
                        {redBookImage && (
                            <div className="px-5 pb-5">
                                <button
                                    onClick={() => onContinue(true, redBookImage)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'linear-gradient(135deg, #00FF94 0%, #00CC77 100%)',
                                        color: '#000',
                                        boxShadow: '0 0 30px rgba(0, 255, 148, 0.5)',
                                    }}
                                >
                                    Tiếp Tục
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalysisResultModal;
