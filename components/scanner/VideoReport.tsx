/**
 * VideoReport.tsx
 * 
 * Displays AI analysis results from video scanning.
 * Features:
 * - Video player with issue timeline markers
 * - Overall health score
 * - Detected issues with treatments
 * - Canopy analysis
 * - Fertilizer recommendations
 */

import React, { useState, useRef } from 'react';
import { VideoAnalysisResult, DetectedIssue } from '../../services/VideoAnalysisService';
import { formatVND } from '../../services/ConsultationService';
import {
    Play, Pause, AlertTriangle, CheckCircle, AlertCircle,
    Leaf, Bug, Droplet, FlaskConical, Lightbulb, Clock,
    ChevronDown, ChevronUp, Volume2
} from 'lucide-react';
import { speak, stopSpeech, isSpeechSupported } from '../../services/VoiceService';

interface VideoReportProps {
    result: VideoAnalysisResult;
    videoUrl: string;
    treeCount: number;
    onClose: () => void;
}

const VideoReport: React.FC<VideoReportProps> = ({
    result,
    videoUrl,
    treeCount,
    onClose,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    // Health colors
    const healthColors = {
        good: { bg: 'from-emerald-500 to-green-600', text: 'text-emerald-600', icon: CheckCircle },
        warning: { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600', icon: AlertCircle },
        critical: { bg: 'from-red-500 to-rose-600', text: 'text-red-600', icon: AlertTriangle },
    };

    const healthStyle = healthColors[result.overallHealth];
    const HealthIcon = healthStyle.icon;

    // Video controls
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const seekToTime = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    // Generate voice summary
    const generateVoiceSummary = (): string => {
        let text = result.summary + '. ';
        text += `Điểm sức khỏe vườn: ${result.healthScore} trên 100. `;
        text += `Độ bao phủ tán lá: ${result.canopy.coveragePercentage} phần trăm. `;

        if (result.issues.length > 0) {
            text += `Phát hiện ${result.issues.length} vấn đề cần xử lý: `;
            result.issues.forEach((issue, i) => {
                text += `${i + 1}. ${issue.name}, mức độ ${issue.severity === 'high' ? 'nghiêm trọng' : issue.severity === 'medium' ? 'trung bình' : 'nhẹ'}. `;
            });
        }

        text += `Khuyến nghị bón ${result.fertilizer.type}, ${result.fertilizer.gramsPerTree} gram mỗi cây. `;
        text += 'Chúc bà con mùa vụ bội thu!';

        return text;
    };

    const handleVoiceToggle = () => {
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
        } else {
            speak(
                generateVoiceSummary(),
                { rate: 0.9 },
                () => setIsSpeaking(false),
                () => setIsSpeaking(true)
            );
        }
    };

    // Severity colors
    const severityColors = {
        low: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        medium: 'bg-orange-100 text-orange-700 border-orange-300',
        high: 'bg-red-100 text-red-700 border-red-300',
    };

    // Issue type icons
    const issueIcons = {
        disease: Bug,
        pest: Bug,
        deficiency: Droplet,
        other: AlertCircle,
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Video Player Section */}
            <div className="relative bg-black">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full aspect-video object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    loop
                />

                {/* Play overlay */}
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
                >
                    <div className="p-4 rounded-full bg-white/90 backdrop-blur-md">
                        {isPlaying ? (
                            <Pause className="h-8 w-8 text-gray-800" />
                        ) : (
                            <Play className="h-8 w-8 text-gray-800 ml-1" />
                        )}
                    </div>
                </button>

                {/* Timeline with markers */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="relative h-2 bg-white/30 rounded-full overflow-visible">
                        {/* Progress bar */}
                        <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />

                        {/* Issue markers */}
                        {result.issues.map((issue) =>
                            issue.frameIndices.map((frameIdx) => {
                                const markerTime = (frameIdx / result.analyzedFrames) * duration;
                                const position = (markerTime / duration) * 100;
                                return (
                                    <button
                                        key={`${issue.id}-${frameIdx}`}
                                        onClick={() => seekToTime(markerTime)}
                                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white ${issue.severity === 'high' ? 'bg-red-500' :
                                                issue.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                                            }`}
                                        style={{ left: `${position}%` }}
                                        title={issue.name}
                                    />
                                );
                            })
                        )}
                    </div>

                    {/* Time display */}
                    <div className="flex justify-between mt-2 text-white/70 text-xs">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-4 relative z-10 max-w-md mx-auto">
                {/* Voice Button */}
                {isSpeechSupported() && (
                    <button
                        onClick={handleVoiceToggle}
                        className={`w-full mb-4 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSpeaking
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-violet-500 text-white hover:bg-violet-600'
                            }`}
                    >
                        <Volume2 className="h-5 w-5" />
                        {isSpeaking ? 'Dừng đọc' : '🔊 Đọc báo cáo'}
                    </button>
                )}

                {/* Health Score Card */}
                <div className={`bg-gradient-to-br ${healthStyle.bg} rounded-3xl p-6 text-white shadow-2xl`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <HealthIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white/70 text-sm">Điểm sức khỏe</p>
                            <p className="text-4xl font-black">{result.healthScore}<span className="text-lg">/100</span></p>
                        </div>
                    </div>

                    <p className="mt-4 text-white/90 text-sm leading-relaxed">
                        {result.summary}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-white/60 text-xs">
                        <Clock className="h-4 w-4" />
                        <span>Phân tích {result.analyzedFrames} khung hình trong {(result.processingTimeMs / 1000).toFixed(1)}s</span>
                    </div>
                </div>

                {/* Canopy Analysis */}
                <div className="bg-white rounded-2xl p-5 mt-4 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Độ bao phủ tán lá</h3>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="35"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="35"
                                    stroke={result.canopy.coveragePercentage >= 70 ? '#10b981' : result.canopy.coveragePercentage >= 50 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 35}
                                    strokeDashoffset={2 * Math.PI * 35 * (1 - result.canopy.coveragePercentage / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-gray-800">
                                {result.canopy.coveragePercentage}%
                            </span>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-gray-400 text-xs">Màu lá</p>
                                <p className="font-bold text-gray-700">
                                    {result.canopy.leafColor === 'green' ? '🌿 Xanh' :
                                        result.canopy.leafColor === 'yellow' ? '🍂 Vàng' : '🍃 Hỗn hợp'}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-gray-400 text-xs">Mật độ</p>
                                <p className="font-bold text-gray-700">
                                    {result.canopy.density === 'dense' ? 'Dày' :
                                        result.canopy.density === 'normal' ? 'Trung bình' : 'Thưa'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detected Issues */}
                {result.issues.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 mt-4 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 rounded-xl">
                                <Bug className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="font-bold text-gray-800">Vấn đề phát hiện ({result.issues.length})</h3>
                        </div>

                        <div className="space-y-3">
                            {result.issues.map((issue) => {
                                const IssueIcon = issueIcons[issue.type];
                                const isExpanded = expandedIssue === issue.id;

                                return (
                                    <div
                                        key={issue.id}
                                        className={`border rounded-xl overflow-hidden ${severityColors[issue.severity]}`}
                                    >
                                        <button
                                            onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                                            className="w-full p-4 flex items-center gap-3 text-left"
                                        >
                                            <IssueIcon className="h-5 w-5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-bold">{issue.name}</p>
                                                <p className="text-xs opacity-80">
                                                    {issue.severity === 'high' ? 'Nghiêm trọng' :
                                                        issue.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                                                    • {issue.affectedPercentage}% bị ảnh hưởng
                                                </p>
                                            </div>
                                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-3 border-t border-current/20 pt-3">
                                                <p className="text-sm">{issue.description}</p>

                                                {issue.treatment.chemical && (
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <p className="text-xs font-bold mb-1">💊 Hóa học</p>
                                                        <p className="text-sm">{issue.treatment.chemical}</p>
                                                    </div>
                                                )}

                                                {issue.treatment.biological && (
                                                    <div className="bg-white/50 rounded-lg p-3">
                                                        <p className="text-xs font-bold mb-1">🌿 Sinh học</p>
                                                        <p className="text-sm">{issue.treatment.biological}</p>
                                                    </div>
                                                )}

                                                <div className="bg-white/50 rounded-lg p-3">
                                                    <p className="text-xs font-bold mb-1">📋 Xử lý</p>
                                                    <p className="text-sm">{issue.treatment.procedure}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Fertilizer Recommendation */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5 mt-4 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <FlaskConical className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold">Khuyến nghị bón phân</h3>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-black">{result.fertilizer.gramsPerTree}</span>
                        <span className="text-white/80">g/cây</span>
                        <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                            {result.fertilizer.type}
                        </span>
                    </div>

                    <p className="text-white/80 text-sm mb-3">{result.fertilizer.reason}</p>

                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/70">Tổng lượng ({treeCount.toLocaleString()} cây)</span>
                            <span className="font-bold">{result.fertilizer.totalKg} kg</span>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                {result.tips.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 mt-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-5 w-5 text-purple-500" />
                            <h3 className="font-bold text-purple-900">Mẹo chăm sóc</h3>
                        </div>
                        <ul className="space-y-2">
                            {result.tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-purple-800">{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                    Quét lại
                </button>
            </div>
        </div>
    );
};

// Time formatter
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoReport;
