import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Loader2 } from 'lucide-react';

interface VoiceCommanderButtonProps {
    onVoiceResult: (transcript: string) => void;
    isProcessing?: boolean;
    size?: 'normal' | 'large';
}

// Custom hook for Speech Recognition (Web Speech API with mobile fallback)
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
            recognition.lang = 'vi-VN'; // Vietnamese

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

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (!recognitionRef.current || !isSupported) return false;

        setTranscript('');
        setInterimTranscript('');

        try {
            recognitionRef.current.start();
            setIsListening(true);

            // Haptic feedback (Vibration API for mobile)
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }

            return true;
        } catch (e) {
            console.error('Failed to start speech recognition:', e);
            return false;
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        return transcript + ' ' + interimTranscript;
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

const VoiceCommanderButton: React.FC<VoiceCommanderButtonProps> = ({
    onVoiceResult,
    isProcessing = false,
    size = 'large'
}) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [isPressing, setIsPressing] = useState(false);
    const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        isListening,
        fullTranscript,
        isSupported,
        startListening,
        stopListening
    } = useSpeechRecognition();

    // Handle press start
    const handlePressStart = () => {
        if (!isSupported || isProcessing) return;

        setIsPressing(true);

        // Delay before starting recording (prevents accidental taps)
        pressTimeoutRef.current = setTimeout(() => {
            setShowOverlay(true);
            startListening();
        }, 150);
    };

    // Handle press end
    const handlePressEnd = () => {
        if (pressTimeoutRef.current) {
            clearTimeout(pressTimeoutRef.current);
        }

        setIsPressing(false);

        if (isListening) {
            const finalTranscript = stopListening();

            // Debounce - wait 1s before processing
            debounceTimeoutRef.current = setTimeout(() => {
                setShowOverlay(false);
                if (finalTranscript.trim()) {
                    onVoiceResult(finalTranscript.trim());
                }
            }, 1000);
        } else {
            setShowOverlay(false);
        }
    };

    // Cancel recording
    const handleCancel = () => {
        if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        stopListening();
        setShowOverlay(false);
        setIsPressing(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, []);

    const buttonSize = size === 'large' ? 'h-20 w-20' : 'h-16 w-16';
    const iconSize = size === 'large' ? 'h-9 w-9' : 'h-7 w-7';

    return (
        <>
            {/* Main Mic Button */}
            <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                disabled={!isSupported || isProcessing}
                className={`
          relative ${buttonSize} rounded-full 
          bg-gradient-to-br from-emerald-500 to-teal-600 
          text-white shadow-2xl 
          transition-all duration-300 
          ${isPressing ? 'scale-95' : 'hover:scale-105'}
          ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-4 focus:ring-emerald-400/50
        `}
                style={{
                    boxShadow: isPressing
                        ? '0 0 60px rgba(16, 185, 129, 0.6), 0 10px 40px rgba(0, 0, 0, 0.3)'
                        : '0 0 40px rgba(16, 185, 129, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
            >
                {/* Pulse Animation Rings */}
                {!isPressing && !isProcessing && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                        <span
                            className="absolute inset-[-8px] rounded-full border-2 border-emerald-400/30 animate-pulse"
                            style={{ animationDuration: '3s' }}
                        />
                        <span
                            className="absolute inset-[-16px] rounded-full border border-emerald-400/20 animate-pulse"
                            style={{ animationDuration: '3s', animationDelay: '1.5s' }}
                        />
                    </>
                )}

                {/* Inner Glow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center h-full">
                    {isProcessing ? (
                        <Loader2 className={`${iconSize} animate-spin`} />
                    ) : isPressing || isListening ? (
                        <Mic className={`${iconSize} animate-pulse`} />
                    ) : (
                        <Mic className={iconSize} />
                    )}
                </div>

                {/* Active Recording Indicator */}
                {isListening && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white animate-pulse shadow-lg" />
                )}
            </button>

            {/* Voice Overlay Modal */}
            {showOverlay && (
                <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    {/* Close Button */}
                    <button
                        onClick={handleCancel}
                        className="absolute top-6 right-6 h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Center Content */}
                    <div className="flex flex-col items-center max-w-sm px-6">
                        {/* Waveform Animation */}
                        <div className="relative mb-8">
                            {/* Outer rings */}
                            <div className="absolute inset-[-40px] rounded-full border-2 border-emerald-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-[-20px] rounded-full border-2 border-emerald-500/50 animate-ping" style={{ animationDuration: '1.5s' }} />

                            {/* Main circle with waveform bars */}
                            <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                                {/* Animated Wave Bars */}
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-white rounded-full animate-pulse"
                                            style={{
                                                height: `${20 + Math.random() * 30}px`,
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: '0.5s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status Text */}
                        <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-4">
                            {isListening ? 'Đang nghe...' : 'Đang xử lý...'}
                        </p>

                        {/* Transcript Display */}
                        <div className="min-h-[80px] text-center">
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

                        {/* Hint */}
                        <p className="mt-8 text-white/40 text-xs text-center">
                            Thả tay để kết thúc • Nhấn X để hủy
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceCommanderButton;
