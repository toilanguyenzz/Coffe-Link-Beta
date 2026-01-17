import { GoogleGenAI } from '@google/genai';

// Voice Command Types
export interface VoiceCommandPayload {
    amount?: number;
    unit?: string;
    type?: string;
    gardenId?: string;
    gardenName?: string;
    price?: number;
    activity?: string;
    date?: string;
}

export interface VoiceCommand {
    intent:
    | 'NAVIGATE_HARVEST'
    | 'NAVIGATE_CARE'
    | 'NAVIGATE_PLANNING'
    | 'SHOW_WEATHER'
    | 'MARKET_PRICE'
    | 'LOG_ACTIVITY'
    | 'ASK_QUESTION'
    | 'UNKNOWN';
    payload: VoiceCommandPayload;
    voiceResponse: string;
    confidence: number;
    rawText: string;
}

// Mock danh sách vườn (sẽ lấy từ context/API sau)
const MOCK_GARDENS = [
    { id: 'G_001', name: 'Cư M\'gar', location: 'Đắk Lắk' },
    { id: 'G_002', name: 'Krông Năng', location: 'Đắk Lắk' },
    { id: 'G_003', name: 'Buôn Ma Thuột', location: 'Đắk Lắk' },
    { id: 'G_004', name: 'Vườn Nhà', location: 'Gia Lai' },
];

// Prompt template cho Gemini
const SYSTEM_PROMPT = `Bạn là AI nông nghiệp Việt Nam. Parse câu nói của nông dân thành lệnh JSON.

Các INTENT có thể:
- NAVIGATE_HARVEST: Khi nói về thu hoạch, hái, bán cà phê
- NAVIGATE_CARE: Khi nói về chăm sóc, bón phân, phun thuốc, tưới
- NAVIGATE_PLANNING: Khi nói về lập kế hoạch, lịch làm việc
- SHOW_WEATHER: Khi hỏi thời tiết
- MARKET_PRICE: Khi hỏi giá cà phê, giá phân bón
- LOG_ACTIVITY: Khi ghi nhận công việc đã làm
- ASK_QUESTION: Câu hỏi chung về nông nghiệp
- UNKNOWN: Không hiểu

Danh sách vườn:
${MOCK_GARDENS.map(g => `- ${g.name} (ID: ${g.id})`).join('\n')}

Quy đổi đơn vị:
- 1 tạ = 100 kg
- 1 tấn = 1000 kg

Ví dụ output:
{
  "intent": "NAVIGATE_HARVEST",
  "payload": {
    "amount": 500,
    "unit": "kg",
    "type": "cà phê tươi",
    "gardenId": "G_001",
    "gardenName": "Cư M'gar",
    "price": 120000
  },
  "voiceResponse": "Dạ, 500 ký cà phê tươi vườn Cư M'gar, giá 120 nghìn đúng không bác?",
  "confidence": 0.95
}

CHỈ TRẢ VỀ JSON, KHÔNG NÓI GÌ KHÁC.`;

class VoiceCommandService {
    private ai: GoogleGenAI | null = null;

    constructor() {
        this.initializeAI();
    }

    private initializeAI() {
        // Get API key from environment or localStorage
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey });
        }
    }

    async parseVoiceCommand(transcript: string): Promise<VoiceCommand> {
        if (!this.ai) {
            console.warn('Gemini API not initialized, using fallback');
            return this.createFallbackCommand(transcript);
        }

        try {
            const prompt = `${SYSTEM_PROMPT}\n\nCâu nói của nông dân: "${transcript}"`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt
            });

            const text = response.text || '';

            // Parse JSON từ response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    intent: parsed.intent || 'UNKNOWN',
                    payload: parsed.payload || {},
                    voiceResponse: parsed.voiceResponse || 'Dạ, bác nói lại được không?',
                    confidence: parsed.confidence || 0.5,
                    rawText: transcript
                };
            }

            return this.createFallbackCommand(transcript);
        } catch (error) {
            console.error('Voice command parsing error:', error);
            return this.createFallbackCommand(transcript);
        }
    }

    private createFallbackCommand(transcript: string): VoiceCommand {
        // Simple keyword matching fallback
        const lowerText = transcript.toLowerCase();

        if (lowerText.includes('hái') || lowerText.includes('thu hoạch') || lowerText.includes('bán')) {
            return {
                intent: 'NAVIGATE_HARVEST',
                payload: this.extractHarvestData(transcript),
                voiceResponse: 'Dạ, bác muốn ghi nhận thu hoạch phải không?',
                confidence: 0.7,
                rawText: transcript
            };
        }

        if (lowerText.includes('bón') || lowerText.includes('phun') || lowerText.includes('tưới')) {
            return {
                intent: 'NAVIGATE_CARE',
                payload: { activity: transcript },
                voiceResponse: 'Dạ, bác muốn ghi nhận công việc chăm sóc phải không?',
                confidence: 0.7,
                rawText: transcript
            };
        }

        if (lowerText.includes('thời tiết') || lowerText.includes('mưa') || lowerText.includes('nắng')) {
            return {
                intent: 'SHOW_WEATHER',
                payload: {},
                voiceResponse: 'Dạ, để em kiểm tra thời tiết cho bác.',
                confidence: 0.8,
                rawText: transcript
            };
        }

        if (lowerText.includes('giá')) {
            return {
                intent: 'MARKET_PRICE',
                payload: {},
                voiceResponse: 'Dạ, để em xem giá hôm nay cho bác.',
                confidence: 0.8,
                rawText: transcript
            };
        }

        return {
            intent: 'ASK_QUESTION',
            payload: { activity: transcript },
            voiceResponse: 'Dạ, em chưa hiểu rõ. Bác nói lại được không?',
            confidence: 0.3,
            rawText: transcript
        };
    }

    private extractHarvestData(text: string): VoiceCommandPayload {
        const payload: VoiceCommandPayload = {};

        // Extract số lượng
        const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(tạ|kg|ký|tấn)/i);
        if (amountMatch) {
            let amount = parseFloat(amountMatch[1]);
            const unit = amountMatch[2].toLowerCase();

            // Convert to kg
            if (unit === 'tạ') amount *= 100;
            else if (unit === 'tấn') amount *= 1000;

            payload.amount = amount;
            payload.unit = 'kg';
        }

        // Extract giá
        const priceMatch = text.match(/giá\s*(\d+)/i);
        if (priceMatch) {
            let price = parseInt(priceMatch[1]);
            if (price < 1000) price *= 1000; // Assume người dùng nói 120 = 120.000
            payload.price = price;
        }

        // Match garden name
        const lowerText = text.toLowerCase();
        for (const garden of MOCK_GARDENS) {
            if (lowerText.includes(garden.name.toLowerCase())) {
                payload.gardenId = garden.id;
                payload.gardenName = garden.name;
                break;
            }
        }

        // Default type
        if (lowerText.includes('tươi')) {
            payload.type = 'Cà phê tươi';
        } else if (lowerText.includes('nhân')) {
            payload.type = 'Cà phê nhân';
        } else {
            payload.type = 'Cà phê tươi';
        }

        return payload;
    }
}

// Singleton instance
export const voiceCommandService = new VoiceCommandService();

// Text-to-Speech function
export const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.1; // Slightly faster
        utterance.pitch = 1.0;

        // Try to find Vietnamese voice
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(v => v.lang.includes('vi'));
        if (viVoice) {
            utterance.voice = viVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
};

export default voiceCommandService;
