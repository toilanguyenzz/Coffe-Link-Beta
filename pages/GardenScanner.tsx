/**
 * GardenScanner.tsx
 * 
 * Main page for Video-to-Insight garden scanning feature.
 * States: Ready → Recording → Analyzing → Results
 */

import React, { useState, useCallback, useRef } from 'react';
import { useFarmData } from '../contexts/FarmDataContext';
import { extractFrames } from '../services/FrameExtractor';
import { analyzeVideoFrames, VideoAnalysisResult } from '../services/VideoAnalysisService';
import VideoScanner from '../components/scanner/VideoScanner';
import VideoReport from '../components/scanner/VideoReport';
import BottomNav from '../components/layout/BottomNav';
import {
    ScanLine, Zap, Camera, Loader2, AlertCircle,
    TreeDeciduous, Video, ChevronRight, Upload, FolderOpen
} from 'lucide-react';

type PageState = 'ready' | 'scanning' | 'analyzing' | 'results' | 'error';

// Demo tree count
const DEMO_TREE_COUNT = 1000;

const GardenScanner: React.FC = () => {
    const { farmInfo, hasFarmData } = useFarmData();

    const [pageState, setPageState] = useState<PageState>('ready');
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
    const [analyzingProgress, setAnalyzingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const treeCount = farmInfo.treeCount || DEMO_TREE_COUNT;

    // File input ref for upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            handleVideoCapture(file);
        } else if (file) {
            setError('Vui lòng chọn file video (mp4, webm, mov...)');
            setPageState('error');
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Handle video captured from scanner
    const handleVideoCapture = useCallback(async (blob: Blob) => {
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        setPageState('analyzing');
        setAnalyzingProgress(0);
        setError(null);

        try {
            // Step 1: Extract frames
            setAnalyzingProgress(10);
            const frames = await extractFrames(blob, {
                fps: 1,
                maxFrames: 15,
                maxWidth: 1024,
                maxHeight: 768,
            });

            setAnalyzingProgress(40);

            // Step 2: Analyze with AI
            const result = await analyzeVideoFrames(frames, treeCount);

            setAnalyzingProgress(100);
            setAnalysisResult(result);
            setPageState('results');

        } catch (err: any) {
            console.error('Analysis error:', err);
            setError(err.message || 'Có lỗi xảy ra khi phân tích');
            setPageState('error');
        }
    }, [treeCount]);

    // Handle retry/reset
    const handleReset = useCallback(() => {
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        setVideoBlob(null);
        setVideoUrl(null);
        setAnalysisResult(null);
        setAnalyzingProgress(0);
        setError(null);
        setPageState('ready');
    }, [videoUrl]);

    // Start scanning
    const handleStartScan = () => {
        setPageState('scanning');
    };

    // Cancel scanning
    const handleCancelScan = () => {
        setPageState('ready');
    };

    // Render based on state
    if (pageState === 'scanning') {
        return (
            <VideoScanner
                onVideoCapture={handleVideoCapture}
                onCancel={handleCancelScan}
                maxDuration={15}
            />
        );
    }

    if (pageState === 'results' && analysisResult && videoUrl) {
        return (
            <VideoReport
                result={analysisResult}
                videoUrl={videoUrl}
                treeCount={treeCount}
                onClose={handleReset}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-32">
            {/* Header */}
            <div className="relative pt-14 pb-10 px-6 text-center">
                {/* Background effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-20 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl" />

                <div className="relative z-10">
                    <div className="inline-flex p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                        <ScanLine className="h-8 w-8 text-white" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">Quét Vườn</h1>
                    <p className="text-purple-200/80 text-sm max-w-xs mx-auto">
                        AI phân tích video để phát hiện bệnh và đề xuất phân bón chính xác
                    </p>
                </div>
            </div>

            <div className="px-5 max-w-md mx-auto">
                {/* Analyzing State */}
                {pageState === 'analyzing' && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            {/* Progress ring */}
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 56}
                                    strokeDashoffset={2 * Math.PI * 56 * (1 - analyzingProgress / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-300"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-1" />
                                <span className="text-white text-sm font-bold">{Math.round(analyzingProgress)}%</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">Đang phân tích...</h2>
                        <p className="text-purple-200/80 text-sm">
                            {analyzingProgress < 40
                                ? 'Đang trích xuất khung hình...'
                                : 'AI đang phân tích sức khỏe cây...'}
                        </p>
                    </div>
                )}

                {/* Error State */}
                {pageState === 'error' && (
                    <div className="bg-red-500/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-red-500/30">
                        <div className="p-4 bg-red-500/20 rounded-full inline-block mb-4">
                            <AlertCircle className="h-10 w-10 text-red-400" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">Có lỗi xảy ra</h2>
                        <p className="text-red-200/80 text-sm mb-6">{error}</p>

                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-white text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Ready State */}
                {pageState === 'ready' && (
                    <>
                        {/* How it works */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20">
                            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-400" />
                                Cách hoạt động
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { icon: Video, text: 'Giữ nút và quay 15 giây' },
                                    { icon: ScanLine, text: 'AI phân tích từng khung hình' },
                                    { icon: TreeDeciduous, text: 'Nhận khuyến nghị chính xác' },
                                ].map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <step.icon className="h-5 w-5 text-purple-300" />
                                        </div>
                                        <p className="text-white/80 text-sm">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Capabilities */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20">
                            <h2 className="text-white font-bold mb-4">AI sẽ phát hiện</h2>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { emoji: '🍂', text: 'Nấm rỉ sắt' },
                                    { emoji: '⚫', text: 'Thán thư' },
                                    { emoji: '🐛', text: 'Sâu đục' },
                                    { emoji: '🌿', text: 'Độ phủ lá' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                                        <span className="text-xl">{item.emoji}</span>
                                        <span className="text-white/80 text-sm">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Farm info */}
                        {hasFarmData && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/20">
                                <div className="flex items-center gap-3">
                                    <TreeDeciduous className="h-5 w-5 text-green-400" />
                                    <span className="text-white/80 text-sm">
                                        Vườn của bạn: <strong className="text-white">{treeCount.toLocaleString()} cây</strong>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Main CTA Button */}
                        <button
                            onClick={handleStartScan}
                            className="w-full py-5 px-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <Camera className="h-6 w-6" />
                            Bắt đầu quét vườn
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        <p className="text-center text-purple-300/60 text-xs mt-4">
                            Giữ nút để quay • Thả để dừng • Max 15 giây
                        </p>

                        {/* OR Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/20" />
                            <span className="text-white/50 text-sm font-medium">hoặc</span>
                            <div className="flex-1 h-px bg-white/20" />
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-4 px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3 group"
                        >
                            <Upload className="h-5 w-5 text-purple-300 group-hover:text-white transition-colors" />
                            <span>Tải video có sẵn</span>
                            <FolderOpen className="h-5 w-5 text-purple-300/60 group-hover:text-white/80 transition-colors" />
                        </button>

                        <p className="text-center text-purple-300/40 text-xs mt-3">
                            Hỗ trợ: MP4, WebM, MOV, AVI
                        </p>
                    </>
                )}
            </div>

            {pageState === 'ready' && <BottomNav />}
        </div>
    );
};

export default GardenScanner;
