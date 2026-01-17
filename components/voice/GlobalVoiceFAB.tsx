import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Loader2, Sparkles, X } from 'lucide-react';
import { voiceCommandService, speak } from '../../services/VoiceCommandService';
import { processVoiceCommand } from '../../utils/DeepLinkHandler';

// Custom hook for Speech Recognition
const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setIsSupported(false);
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'vi-VN';

            recognition.onresult = (event: any) => {
                let interimText = '';
                let finalText = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalText += result[0].transcript;
                    } else {
                        interimText += result[0].transcript;
                    }
                }

                if (finalText) {
                    setTranscript(prev => prev + ' ' + finalText);
                }
                setInterimTranscript(interimText);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const startListening = () => {
        if (!recognitionRef.current || !isSupported) return false;
        setTranscript('');
        setInterimTranscript('');
        try {
            recognitionRef.current.start();
            setIsListening(true);
            if ('vibrate' in navigator) navigator.vibrate(50);
            return true;
        } catch (e) {
            return false;
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        return (transcript + ' ' + interimTranscript).trim();
    };

    return {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        startListening,
        stopListening,
        fullTranscript: (transcript + ' ' + interimTranscript).trim()
    };
};

/**
 * GlobalVoiceFAB - Nút Voice duy nhất, luôn hiện ở tất cả các tab
 */
const GlobalVoiceFAB: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isPressing, setIsPressing] = useState(false);
    const [showHint, setShowHint] = useState(true);

    const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        isListening,
        fullTranscript,
        isSupported,
        startListening,
        stopListening
    } = useSpeechRecognition();

    // Ẩn ở các trang không cần voice
    const hiddenPaths = ['/login', '/register', '/onboarding', '/farm-setup'];
    if (hiddenPaths.some(path => location.pathname.includes(path))) {
        return null;
    }

    // Auto-hide hint sau 5 giây
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Handle press start
    const handlePressStart = () => {
        if (!isSupported || isProcessing) return;
        setIsPressing(true);
        setShowHint(false);

        pressTimeoutRef.current = setTimeout(() => {
            setShowOverlay(true);
            startListening();
        }, 150);
    };

    // Handle press end
    const handlePressEnd = async () => {
        if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
        setIsPressing(false);

        if (isListening) {
            const finalTranscript = stopListening();

            debounceTimeoutRef.current = setTimeout(async () => {
                setShowOverlay(false);
                if (finalTranscript.trim()) {
                    await processVoiceInput(finalTranscript.trim());
                }
            }, 800);
        } else {
            setShowOverlay(false);
        }
    };

    // Process voice input
    const processVoiceInput = async (text: string) => {
        setIsProcessing(true);
        try {
            const command = await voiceCommandService.parseVoiceCommand(text);
            const action = processVoiceCommand(command);

            if (action.type === 'navigate' && action.tab) {
                navigate('/');
                // Emit event for Dashboard to switch tab
                window.dispatchEvent(new CustomEvent('voice-navigate', {
                    detail: { tab: action.tab, prefillData: action.prefillData }
                }));
            }
        } catch (error) {
            speak('Xin lỗi, có lỗi xảy ra. Bác thử lại nhé!');
        } finally {
            setIsProcessing(false);
        }
    };

    // Cancel
    const handleCancel = () => {
        if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        stopListening();
        setShowOverlay(false);
        setIsPressing(false);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, []);

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* MAIN FAB - Luôn hiện ở góc phải */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="fixed bottom-20 right-4 z-[950] flex flex-col items-end gap-2">
                {/* Hint Label */}
                {showHint && !showOverlay && (
                    <div className="animate-in fade-in slide-in-from-right duration-500 mr-2">
                        <div className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/30 text-xs font-bold">
                            <Sparkles className="h-3 w-3 animate-pulse" />
                            <span>Giữ để nói lệnh</span>
                        </div>
                    </div>
                )}

                {/* The Button */}
                <div className="relative">
                    {/* Animated Glow Rings */}
                    {!isProcessing && !isPressing && (
                        <>
                            <div className="absolute inset-[-10px] rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl animate-pulse" />
                            <div
                                className="absolute inset-[-14px] rounded-full border-2 border-emerald-400/30"
                                style={{ animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                            />
                        </>
                    )}

                    {/* Main Button */}
                    <button
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}
                        disabled={!isSupported || isProcessing}
                        className={`
              relative h-16 w-16 rounded-full 
              bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600
              text-white shadow-2xl 
              transition-all duration-300 
              ${isPressing ? 'scale-90' : 'hover:scale-110'}
              ${!isSupported ? 'opacity-50' : ''}
              focus:outline-none
              overflow-hidden
            `}
                        style={{
                            boxShadow: isPressing
                                ? '0 0 60px rgba(16, 185, 129, 0.7), 0 5px 30px rgba(0, 0, 0, 0.4)'
                                : '0 0 40px rgba(16, 185, 129, 0.4), 0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        {/* Shimmer */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                            style={{ animation: 'shimmer 2.5s infinite' }}
                        />

                        {/* Icon */}
                        <div className="relative z-10 flex items-center justify-center h-full">
                            {isProcessing ? (
                                <Loader2 className="h-7 w-7 animate-spin" />
                            ) : (
                                <Mic className={`h-7 w-7 ${isPressing ? 'scale-125' : ''} transition-transform`} />
                            )}
                        </div>

                        {/* Recording indicator */}
                        {(isListening || isPressing) && (
                            <div className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                        )}
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* VOICE OVERLAY - Khi đang ghi âm */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {showOverlay && (
                <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    {/* Close */}
                    <button
                        onClick={handleCancel}
                        className="absolute top-6 right-6 h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Waveform */}
                    <div className="relative mb-8">
                        <div className="absolute inset-[-40px] rounded-full border-2 border-emerald-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-[-20px] rounded-full border-2 border-emerald-500/50 animate-ping" style={{ animationDuration: '1.5s' }} />

                        <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 bg-white rounded-full"
                                        style={{
                                            height: `${20 + Math.random() * 25}px`,
                                            animation: `wave 0.5s ease-in-out infinite`,
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-4">
                        {isListening ? 'Đang nghe...' : 'Đang xử lý...'}
                    </p>

                    {/* Transcript */}
                    <div className="min-h-[60px] text-center max-w-xs px-4">
                        {fullTranscript ? (
                            <p className="text-white text-xl font-bold leading-relaxed animate-in fade-in">
                                "{fullTranscript}"
                            </p>
                        ) : (
                            <p className="text-white/40 text-lg italic">
                                Hãy nói điều bạn muốn...
                            </p>
                        )}
                    </div>

                    <p className="mt-8 text-white/40 text-xs">
                        Thả tay để kết thúc • Nhấn X để hủy
                    </p>
                </div>
            )}

            {/* Inline CSS */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(250%) skewX(-12deg); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
        </>
    );
};

export default GlobalVoiceFAB;
