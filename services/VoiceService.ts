/**
 * VoiceService.ts
 * 
 * Text-to-Speech service for reading consultation results aloud.
 * Uses the Web Speech API (SpeechSynthesis) which supports Vietnamese.
 * 
 * Features:
 * - Vietnamese voice selection
 * - Speed and pitch control
 * - Play/Pause/Stop controls
 * - Callback for speech events
 */

// --- TYPES ---

export interface VoiceOptions {
    rate?: number;      // Speed: 0.1 to 10, default 0.9 (slightly slower for clarity)
    pitch?: number;     // Pitch: 0 to 2, default 1
    volume?: number;    // Volume: 0 to 1, default 1
}

export interface SpeechState {
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
}

// --- CHECK SUPPORT ---

export const isSpeechSupported = (): boolean => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// --- GET VIETNAMESE VOICE ---

const getVietnameseVoice = (): SpeechSynthesisVoice | null => {
    if (!isSpeechSupported()) return null;

    const voices = window.speechSynthesis.getVoices();

    // Try to find Vietnamese voice
    const vietnameseVoice = voices.find(voice =>
        voice.lang.startsWith('vi') ||
        voice.lang === 'vi-VN' ||
        voice.name.toLowerCase().includes('vietnam')
    );

    if (vietnameseVoice) return vietnameseVoice;

    // Fallback to any available voice (will still work, just with accent)
    return voices.find(voice => voice.lang.startsWith('en')) || voices[0] || null;
};

// --- SPEAK TEXT ---

export const speak = (
    text: string,
    options: VoiceOptions = {},
    onEnd?: () => void,
    onStart?: () => void,
    onError?: (error: string) => void
): void => {
    if (!isSpeechSupported()) {
        onError?.('Trình duyệt không hỗ trợ đọc giọng nói');
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set Vietnamese voice if available
    const voice = getVietnameseVoice();
    if (voice) {
        utterance.voice = voice;
    }

    // Set options
    utterance.rate = options.rate ?? 0.9;   // Slightly slower for clarity
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    utterance.lang = 'vi-VN';

    // Event handlers
    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (event) => onError?.(event.error);

    // Speak
    window.speechSynthesis.speak(utterance);
};

// --- CONTROL FUNCTIONS ---

export const pauseSpeech = (): void => {
    if (isSpeechSupported()) {
        window.speechSynthesis.pause();
    }
};

export const resumeSpeech = (): void => {
    if (isSpeechSupported()) {
        window.speechSynthesis.resume();
    }
};

export const stopSpeech = (): void => {
    if (isSpeechSupported()) {
        window.speechSynthesis.cancel();
    }
};

export const getSpeechState = (): SpeechState => {
    if (!isSpeechSupported()) {
        return { isSpeaking: false, isPaused: false, isSupported: false };
    }

    return {
        isSpeaking: window.speechSynthesis.speaking,
        isPaused: window.speechSynthesis.paused,
        isSupported: true,
    };
};

// --- GENERATE CONSULTATION SCRIPT ---

import { ConsultationResult } from './ConsultationService';

export const generateConsultationScript = (result: ConsultationResult, treeCount: number): string => {
    const { status, watering, fertilizer, totalCostVND, tips } = result;

    let script = '';

    // Status
    script += `${status.title}. ${status.description}. `;

    // Watering
    script += `Về tưới nước: Mỗi gốc cần tưới ${watering.litersPerTree} lít. `;
    script += `Tần suất tưới ${watering.frequency}. `;
    if (watering.urgency === 'high') {
        script += 'Cần tưới ngay! ';
    }
    script += `${watering.reason}. `;

    // Fertilizer
    script += `Về bón phân: Sử dụng ${fertilizer.type}, mỗi gốc bón ${fertilizer.gramsPerTree} gram. `;
    script += `Tổng cần ${fertilizer.totalKg} ki-lô-gram cho ${treeCount} cây. `;
    script += `${fertilizer.reason}. `;
    script += `Thời điểm bón: ${fertilizer.timing}. `;

    // Cost
    const costFormatted = new Intl.NumberFormat('vi-VN').format(totalCostVND);
    script += `Chi phí dự tính khoảng ${costFormatted} đồng. `;

    // Tips (only first 2)
    if (tips.length > 0) {
        script += 'Mẹo chăm sóc: ';
        tips.slice(0, 2).forEach((tip, i) => {
            // Remove emojis for cleaner reading
            const cleanTip = tip.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
            script += `${cleanTip}. `;
        });
    }

    script += 'Chúc bà con mùa vụ bội thu!';

    return script;
};

export default {
    speak,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    getSpeechState,
    isSpeechSupported,
    generateConsultationScript,
};
