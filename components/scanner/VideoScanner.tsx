/**
 * VideoScanner.tsx
 * 
 * Hold-to-record video scanner component for farm health analysis.
 * Features:
 * - Camera access with rear camera preference
 * - Hold button to record (15 seconds max)
 * - Progress ring indicator
 * - Preview and retake functionality
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Camera, Video, Square, RotateCcw, Check, X,
    Loader2, AlertCircle, Zap
} from 'lucide-react';

interface VideoScannerProps {
    onVideoCapture: (videoBlob: Blob) => void;
    onCancel: () => void;
    maxDuration?: number;  // seconds, default 15
}

type ScannerState = 'ready' | 'recording' | 'preview' | 'error';

const VideoScanner: React.FC<VideoScannerProps> = ({
    onVideoCapture,
    onCancel,
    maxDuration = 15,
}) => {
    const [state, setState] = useState<ScannerState>('ready');
    const [error, setError] = useState<string | null>(null);
    const [recordingProgress, setRecordingProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isHolding, setIsHolding] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const previewRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize camera
    const initCamera = useCallback(async () => {
        try {
            setError(null);

            // Request camera with rear preference for mobile
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
            }

            setState('ready');
        } catch (err: any) {
            console.error('Camera error:', err);
            setError(err.name === 'NotAllowedError'
                ? 'Vui lòng cấp quyền truy cập camera'
                : 'Không thể truy cập camera');
            setState('error');
        }
    }, []);

    // Cleanup
    useEffect(() => {
        initCamera();

        return () => {
            stopRecording();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, []);

    // Start recording
    const startRecording = useCallback(() => {
        if (!streamRef.current) return;

        recordedChunksRef.current = [];
        setRecordingProgress(0);

        const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: 'video/webm;codecs=vp9',
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setState('preview');
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100); // Collect data every 100ms
        setState('recording');

        // Progress timer
        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min((elapsed / maxDuration) * 100, 100);
            setRecordingProgress(progress);

            if (elapsed >= maxDuration) {
                stopRecording();
            }
        }, 50);

        // Auto-stop at max duration
        recordingTimerRef.current = setTimeout(() => {
            stopRecording();
        }, maxDuration * 1000);

    }, [maxDuration]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (recordingTimerRef.current) {
            clearTimeout(recordingTimerRef.current);
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    // Handle hold button
    const handlePressStart = useCallback(() => {
        if (state === 'ready') {
            setIsHolding(true);
            startRecording();
        }
    }, [state, startRecording]);

    const handlePressEnd = useCallback(() => {
        if (state === 'recording') {
            setIsHolding(false);
            stopRecording();
        }
    }, [state, stopRecording]);

    // Retake
    const handleRetake = useCallback(() => {
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
            setVideoUrl(null);
        }
        setRecordingProgress(0);
        setState('ready');
    }, [videoUrl]);

    // Confirm
    const handleConfirm = useCallback(() => {
        if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            onVideoCapture(blob);
        }
    }, [onVideoCapture]);

    // Progress ring SVG
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (recordingProgress / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={onCancel}
                    className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm font-medium">Quét Vườn AI</span>
                </div>

                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Camera/Preview View */}
            <div className="flex-1 relative">
                {state !== 'preview' ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                    />
                ) : (
                    <video
                        ref={previewRef}
                        src={videoUrl || undefined}
                        className="w-full h-full object-cover"
                        playsInline
                        loop
                        autoPlay
                        muted
                    />
                )}

                {/* Recording indicator */}
                {state === 'recording' && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full animate-pulse">
                        <div className="h-3 w-3 rounded-full bg-white animate-ping" />
                        <span className="text-sm font-bold">
                            {Math.ceil((maxDuration * (100 - recordingProgress)) / 100)}s
                        </span>
                    </div>
                )}

                {/* Error overlay */}
                {state === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                        <p className="text-center text-lg font-medium mb-2">{error}</p>
                        <button
                            onClick={initCamera}
                            className="mt-4 px-6 py-3 bg-white text-black rounded-full font-bold"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Scanning guide overlay */}
                {state === 'ready' && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-10 border-2 border-white/30 rounded-3xl" />
                        <div className="absolute bottom-32 left-0 right-0 text-center text-white/80 text-sm">
                            <p>Hướng camera vào cây cà phê</p>
                            <p className="text-xs mt-1">Giữ nút để quay • Thả để dừng</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6 bg-gradient-to-t from-black/90 to-transparent">
                {state === 'preview' ? (
                    // Preview controls
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={handleRetake}
                            className="flex flex-col items-center gap-2 text-white"
                        >
                            <div className="p-4 rounded-full bg-white/20 backdrop-blur-md">
                                <RotateCcw className="h-6 w-6" />
                            </div>
                            <span className="text-xs">Quay lại</span>
                        </button>

                        <button
                            onClick={handleConfirm}
                            className="flex flex-col items-center gap-2 text-white"
                        >
                            <div className="p-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/30">
                                <Check className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold">Phân tích</span>
                        </button>
                    </div>
                ) : (
                    // Recording button with progress ring
                    <div className="flex items-center justify-center">
                        <button
                            onMouseDown={handlePressStart}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchStart={handlePressStart}
                            onTouchEnd={handlePressEnd}
                            disabled={state === 'error'}
                            className="relative flex items-center justify-center"
                        >
                            {/* Progress ring */}
                            <svg className="absolute w-28 h-28 -rotate-90">
                                <circle
                                    cx="56"
                                    cy="56"
                                    r="45"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="56"
                                    cy="56"
                                    r="45"
                                    stroke={state === 'recording' ? '#ef4444' : '#10b981'}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-100"
                                />
                            </svg>

                            {/* Button center */}
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${state === 'recording'
                                    ? 'bg-red-500 scale-90'
                                    : isHolding
                                        ? 'bg-white scale-95'
                                        : 'bg-white hover:scale-105'
                                }`}>
                                {state === 'recording' ? (
                                    <Square className="h-8 w-8 text-white fill-white" />
                                ) : (
                                    <Video className="h-8 w-8 text-gray-800" />
                                )}
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoScanner;
