import { VoiceCommand, speak } from '../services/VoiceCommandService';

export interface DeepLinkAction {
    type: 'navigate' | 'modal' | 'toast' | 'none';
    target?: string;
    tab?: 'care' | 'harvest' | 'planning';
    prefillData?: Record<string, any>;
    autoOpenModal?: boolean;
    toastMessage?: string;
}

/**
 * Process voice command and determine the appropriate deep link action
 */
export function processVoiceCommand(command: VoiceCommand): DeepLinkAction {
    // Speak the response first
    speak(command.voiceResponse);

    switch (command.intent) {
        case 'NAVIGATE_HARVEST':
            return {
                type: 'navigate',
                tab: 'harvest',
                prefillData: {
                    weight: command.payload.amount,
                    type: command.payload.type,
                    gardenId: command.payload.gardenId,
                    gardenName: command.payload.gardenName,
                    price: command.payload.price
                },
                autoOpenModal: true
            };

        case 'NAVIGATE_CARE':
            return {
                type: 'navigate',
                tab: 'care',
                prefillData: {
                    activity: command.payload.activity
                },
                autoOpenModal: false
            };

        case 'NAVIGATE_PLANNING':
            return {
                type: 'navigate',
                tab: 'planning',
                prefillData: {},
                autoOpenModal: false
            };

        case 'SHOW_WEATHER':
            return {
                type: 'modal',
                target: 'weather',
                prefillData: {}
            };

        case 'MARKET_PRICE':
            return {
                type: 'modal',
                target: 'price',
                prefillData: {}
            };

        case 'LOG_ACTIVITY':
            return {
                type: 'navigate',
                tab: 'care',
                prefillData: {
                    activity: command.payload.activity
                },
                autoOpenModal: true
            };

        case 'ASK_QUESTION':
            return {
                type: 'navigate',
                target: '/consult',
                prefillData: {
                    question: command.rawText
                },
                autoOpenModal: false
            };

        case 'UNKNOWN':
        default:
            return {
                type: 'toast',
                toastMessage: 'Xin lỗi, em chưa hiểu. Bác thử nói lại nhé!'
            };
    }
}

/**
 * Format số tiền thành chuỗi hiển thị
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Format khối lượng với đơn vị
 */
export function formatWeight(kg: number): string {
    if (kg >= 1000) {
        return `${(kg / 1000).toFixed(2)} tấn`;
    } else if (kg >= 100) {
        return `${(kg / 100).toFixed(1)} tạ`;
    }
    return `${kg} kg`;
}

export default processVoiceCommand;
