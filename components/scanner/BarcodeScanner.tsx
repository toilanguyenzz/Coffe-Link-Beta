/**
 * BarcodeScanner.tsx
 * 
 * Fullscreen barcode scanning modal for chemical product verification.
 * Uses native BarcodeDetector API with fallback to manual input.
 * 
 * Similar styling to VideoScanner.tsx for consistency.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Camera, Keyboard, Loader2, AlertCircle, ScanLine, Zap
} from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onCancel: () => void;
}

type ScannerMode = 'camera' | 'manual';

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onCancel }) => {
    const [mode, setMode] = useState<ScannerMode>('camera');
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [hasBarcodeAPI, setHasBarcodeAPI] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null);
    const animationRef = useRef<number | null>(null);

    // Check if BarcodeDetector API is available
    useEffect(() => {
        const checkBarcodeAPI = async () => {
            if ('BarcodeDetector' in window) {
                try {
                    // @ts-ignore - BarcodeDetector is not in TS types yet
                    const formats = await BarcodeDetector.getSupportedFormats();
                    if (formats.length > 0) {
                        setHasBarcodeAPI(true);
                        // @ts-ignore
                        detectorRef.current = new BarcodeDetector({
                            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e']
                        });
                    }
                } catch (e) {
                    console.log('BarcodeDetector not fully supported');
                }
            }

            // If no API, switch to manual mode
            if (!hasBarcodeAPI) {
                setMode('manual');
            }
        };

        checkBarcodeAPI();
    }, []);

    // Initialize camera for barcode scanning
    const initCamera = useCallback(async () => {
        if (!hasBarcodeAPI) {
            setMode('manual');
            return;
        }

        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsScanning(true);
                startDetection();
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Vui lòng cấp quyền truy cập camera');
            } else {
                setError('Không thể truy cập camera');
            }
            setMode('manual');
        }
    }, [hasBarcodeAPI]);

    // Start barcode detection loop
    const startDetection = useCallback(() => {
        const detect = async () => {
            if (!videoRef.current || !detectorRef.current || !isScanning) return;

            try {
                const barcodes = await detectorRef.current.detect(videoRef.current);

                if (barcodes.length > 0) {
                    const barcode = barcodes[0].rawValue;
                    if (barcode) {
                        // Success! Stop scanning and return result
                        stopCamera();
                        onScan(barcode);
                        return;
                    }
                }
            } catch (err) {
                // Detection error, continue scanning
            }

            // Continue scanning
            animationRef.current = requestAnimationFrame(detect);
        };

        detect();
    }, [isScanning, onScan]);

    // Stop camera and cleanup
    const stopCamera = useCallback(() => {
        setIsScanning(false);

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        if (mode === 'camera' && hasBarcodeAPI) {
            initCamera();
        }

        return () => {
            stopCamera();
        };
    }, [mode, hasBarcodeAPI]);

    // Handle manual barcode submission
    const handleManualSubmit = () => {
        const barcode = manualInput.trim();
        if (barcode.length >= 8) {
            onScan(barcode);
        } else {
            setError('Mã vạch phải có ít nhất 8 ký tự');
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={() => { stopCamera(); onCancel(); }}
                    className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <span className="text-sm font-bold">Quét Thuốc BVTV</span>
                </div>

                {/* Mode toggle */}
                <button
                    onClick={() => {
                        stopCamera();
                        setMode(mode === 'camera' ? 'manual' : 'camera');
                    }}
                    className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                    {mode === 'camera' ? <Keyboard className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
                {/* Camera Mode */}
                {mode === 'camera' && (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            muted
                        />

                        {/* Scanning frame overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative w-72 h-48">
                                    {/* Corner brackets */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                                    {/* Scanning line animation */}
                                    <div className="absolute inset-x-2 top-1/2 h-0.5 bg-amber-400 animate-pulse" />
                                </div>
                            </div>
                        )}

                        {/* Loading state */}
                        {!isScanning && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                <Loader2 className="h-12 w-12 text-amber-400 animate-spin mb-4" />
                                <p className="text-white text-sm">Đang khởi động camera...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center px-6">
                                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                                <p className="text-white font-medium mb-2">{error}</p>
                                <button
                                    onClick={() => setMode('manual')}
                                    className="mt-4 px-6 py-3 bg-amber-500 text-white rounded-full font-bold"
                                >
                                    Nhập thủ công
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Mode */}
                {mode === 'manual' && (
                    <div className="w-full max-w-sm px-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-amber-500/20 rounded-xl">
                                    <ScanLine className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Nhập mã vạch</h2>
                                    <p className="text-white/60 text-sm">Gõ mã số trên chai thuốc</p>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={manualInput}
                                onChange={(e) => {
                                    setManualInput(e.target.value);
                                    setError(null);
                                }}
                                placeholder="VD: 893000000001"
                                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-xl font-mono placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                autoFocus
                                inputMode="numeric"
                            />

                            {error && (
                                <p className="text-red-400 text-sm text-center mt-3">{error}</p>
                            )}

                            <button
                                onClick={handleManualSubmit}
                                disabled={manualInput.length < 8}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                            >
                                Kiểm tra
                            </button>

                            {/* Quick test buttons for demo */}
                            <div className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-white/40 text-xs text-center mb-3">Demo (nhấn để thử):</p>
                                <div className="flex gap-2 justify-center flex-wrap">
                                    <button
                                        onClick={() => setManualInput('893000000001')}
                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium"
                                    >
                                        CẤM
                                    </button>
                                    <button
                                        onClick={() => setManualInput('893000000002')}
                                        className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium"
                                    >
                                        CẢNH BÁO
                                    </button>
                                    <button
                                        onClick={() => setManualInput('893000000003')}
                                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium"
                                    >
                                        AN TOÀN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white/50 text-sm">
                    {mode === 'camera'
                        ? 'Hướng camera vào mã vạch trên chai thuốc'
                        : 'Nhập 8-13 chữ số trên mã vạch'
                    }
                </p>
            </div>
        </div>
    );
};

export default BarcodeScanner;
