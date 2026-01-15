/**
 * AIConsultationService.ts
 * 
 * ADVANCED AI-powered farm consultation using Gemini AI.
 * Provides highly accurate, context-aware recommendations by combining:
 * - Gemini AI for intelligent analysis
 * - Real agricultural research data
 * - Weather and seasonal context
 * - Coffee-specific cultivation knowledge
 */

import { GoogleGenAI } from "@google/genai";
import { FullWeatherReport } from './WeatherService';
import { FarmInput, ConsultationResult, formatVND } from './ConsultationService';

// --- GEMINI AI CONFIGURATION ---

const AGRI_EXPERT_PROMPT = `
Bạn là CHUYÊN GIA NÔNG HỌC CÀ PHÊ cấp cao tại Việt Nam với 25 năm kinh nghiệm tại vùng Tây Nguyên.

KIẾN THỨC CHUYÊN MÔN:
1. Cà phê Robusta (Coffea canephora): Chiếm 97% sản lượng Việt Nam
2. Điều kiện lý tưởng: 20-30°C, độ ẩm 70-80%, lượng mưa 1500-2500mm/năm
3. Mật độ trồng chuẩn: 1.000-1.300 cây/ha (khoảng cách 3x3m)

LỊCH SINH TRƯỞNG CÀ PHÊ TÂY NGUYÊN:
- Tháng 11-2: Ra hoa → Cần tưới kích hoa, bón DAP (18-46-0) 200-300g/cây
- Tháng 3-6: Nuôi quả → Tưới đủ, NPK cân bằng 16-16-8, 300-400g/cây
- Tháng 7-9: Chín quả → Giảm tưới, tăng Kali (NPK 12-12-17), 250-350g/cây  
- Tháng 10-11: Thu hoạch → Ngừng phân, chuẩn bị phục hồi

CÔNG THỨC TƯỚI NƯỚC CHUẨN (Theo nghiên cứu WASI - Viện KHKT Nông Lâm nghiệp Tây Nguyên):
- Mùa khô (Nov-Apr): 300-400 lít/gốc/lần, chu kỳ 20-25 ngày, tổng 4-5 lần
- Tưới kích hoa: 200-250 lít/gốc, 2-3 lần cách nhau 10-15 ngày
- Cây héo nghiêm trọng: Tưới nhỏ giọt 50 lít/ngày x 3-4 ngày trước khi tưới đẫm

CÔNG THỨC PHÂN BÓN CHUẨN (Theo khuyến cáo Bộ NN&PTNT):
- Năng suất mục tiêu 3 tấn nhân/ha: N-P-K = 250-100-200 kg/ha/năm
- Chia 3-4 đợt bón: Đầu mùa mưa (40%), giữa mưa (30%), cuối mưa (30%)
- Phân hữu cơ: 10-15 kg/gốc/năm, bón sau thu hoạch

GIÁ THAM KHẢO 2024 (VND/kg):
- NPK 16-16-8: 18.000-20.000
- DAP: 22.000-25.000
- Kali (KCl): 15.000-17.000
- URE: 12.000-14.000
- Phân bò ủ: 800-1.200
- Nước tưới: 15.000-20.000/m³

YÊU CẦU OUTPUT: Trả về JSON chính xác theo format sau, KHÔNG có markdown:
{
  "status": {
    "emoji": "🚨|⚠️|✅",
    "title": "string ngắn gọn",
    "description": "mô tả tình trạng",
    "urgencyLevel": "critical|attention|good"
  },
  "watering": {
    "litersPerTree": number,
    "frequency": "string (VD: 2 ngày/lần)",
    "urgency": "low|medium|high",
    "reason": "giải thích khoa học",
    "method": "phương pháp tưới cụ thể"
  },
  "fertilizer": {
    "type": "loại phân (NPK 16-16-8, DAP, etc)",
    "gramsPerTree": number,
    "method": "cách bón cụ thể",
    "timing": "thời điểm tốt nhất",
    "reason": "lý do khoa học"
  },
  "tips": ["mẹo 1", "mẹo 2", "mẹo 3"],
  "scientificNote": "ghi chú khoa học ngắn về tình trạng này"
}
`;

// --- AI CONSULTATION FUNCTION ---

export const generateAIConsultation = async (
    farm: FarmInput,
    weather: FullWeatherReport
): Promise<ConsultationResult> => {

    // Get API key - Vite injects process.env.API_KEY from GEMINI_API_KEY in .env.local
    // @ts-ignore - process.env is defined by Vite
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    // If no API key, fall back to rule-based calculation
    if (!apiKey) {
        console.warn('Gemini API key not found. Using rule-based calculation.');
        const { generateConsultation } = await import('./ConsultationService');
        return generateConsultation(farm, weather);
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Build context for AI
        const context = buildConsultationContext(farm, weather);

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [{ text: context }]
            },
            config: {
                systemInstruction: AGRI_EXPERT_PROMPT,
                responseMimeType: "application/json",
                temperature: 0.3, // Low for consistent, factual output
            }
        });

        const textResponse = response.text;

        if (!textResponse) {
            throw new Error("AI trả về kết quả rỗng");
        }

        // Parse AI response
        const aiResult = JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        // Calculate costs based on AI recommendations
        const result = enrichWithCosts(aiResult, farm, weather);

        return result;

    } catch (error) {
        console.error('AI Consultation error:', error);
        // Fallback to rule-based
        const { generateConsultation } = await import('./ConsultationService');
        return generateConsultation(farm, weather);
    }
};

// --- BUILD CONTEXT FOR AI ---

const buildConsultationContext = (farm: FarmInput, weather: FullWeatherReport): string => {
    const { areaHectares, treeCount, condition, centerCoords } = farm;
    const { current, forecast, season } = weather;

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    const conditionVN = {
        wilted: 'Cây đang HÉO, thiếu nước nghiêm trọng',
        normal: 'Cây phát triển bình thường',
        healthy: 'Cây rất khỏe mạnh, xanh tốt'
    };

    return `
THÔNG TIN VƯỜN CÀ PHÊ CẦN TƯ VẤN:

📅 Ngày hôm nay: ${day}/${month}/${currentDate.getFullYear()}
📍 Tọa độ: ${centerCoords.lat.toFixed(4)}°N, ${centerCoords.lng.toFixed(4)}°E (Tây Nguyên, Việt Nam)

🌱 THÔNG TIN VƯỜN:
- Diện tích: ${areaHectares.toFixed(2)} hecta
- Số cây: ${treeCount.toLocaleString()} cây
- Mật độ: ${(treeCount / areaHectares).toFixed(0)} cây/ha
- Tình trạng: ${conditionVN[condition]}

🌤️ THỜI TIẾT HIỆN TẠI:
- Nhiệt độ: ${current.temperature}°C
- Độ ẩm: ${current.humidity}%
- Tình trạng: ${current.description}
- Gió: ${current.windSpeed} m/s
- Mùa: ${season.seasonName} (${season.season})

📊 DỰ BÁO 3 NGÀY TỚI:
- Có mưa: ${forecast.willRainIn3Days ? 'CÓ' : 'KHÔNG'}
- Xác suất mưa: ${forecast.rainProbability}%
- Lượng mưa dự kiến: ${forecast.expectedRainfall}mm
- Số ngày mưa: ${forecast.daysWithRain} ngày

Hãy đưa ra khuyến nghị TƯ VẤN CHĂM SÓC chi tiết và chính xác nhất cho vườn này.
`;
};

// --- ENRICH AI RESULT WITH COSTS ---

const enrichWithCosts = (
    aiResult: any,
    farm: FarmInput,
    weather: FullWeatherReport
): ConsultationResult => {
    const { treeCount } = farm;

    // Fertilizer prices
    const FERTILIZER_PRICES: Record<string, number> = {
        'NPK 16-16-8': 18000,
        'NPK 20-20-15': 22000,
        'NPK 12-12-17': 20000,
        'DAP': 25000,
        'DAP 18-46-0': 25000,
        'Ure': 13000,
        'URE': 13000,
        'Kali': 16000,
        'KCl': 16000,
        'Phân hữu cơ': 1000,
        'Phân bò ủ': 1000,
        'Phân vi sinh': 12000,
    };

    // Calculate watering cost
    const litersPerTree = aiResult.watering?.litersPerTree || 200;
    const totalLiters = litersPerTree * treeCount;
    const waterCostVND = Math.round((totalLiters / 1000) * 18000); // 18k/m³

    // Calculate fertilizer cost
    const gramsPerTree = aiResult.fertilizer?.gramsPerTree || 300;
    const totalKg = Math.round((gramsPerTree * treeCount) / 1000);
    const fertType = aiResult.fertilizer?.type || 'NPK 16-16-8';
    const pricePerKg = Object.entries(FERTILIZER_PRICES).find(([key]) =>
        fertType.toLowerCase().includes(key.toLowerCase())
    )?.[1] || 18000;
    const fertCostVND = totalKg * pricePerKg;

    // Build weather summary
    const { current, forecast, season } = weather;
    const weatherSummary = `${current.temperature}°C, ${current.description} • Độ ẩm ${current.humidity}% • ${season.seasonName}${forecast.willRainIn3Days ? ` • Dự báo mưa ${forecast.expectedRainfall}mm` : ' • 3 ngày tới không mưa'}`;

    return {
        status: {
            emoji: aiResult.status?.emoji || '✅',
            title: aiResult.status?.title || 'Đã phân tích xong',
            description: aiResult.status?.description + (aiResult.scientificNote ? ` (${aiResult.scientificNote})` : ''),
            urgencyLevel: aiResult.status?.urgencyLevel || 'attention',
        },
        watering: {
            litersPerTree,
            totalLiters,
            frequency: aiResult.watering?.frequency || '3 ngày/lần',
            urgency: aiResult.watering?.urgency || 'medium',
            reason: aiResult.watering?.reason + (aiResult.watering?.method ? `. ${aiResult.watering.method}` : ''),
            costVND: waterCostVND,
        },
        fertilizer: {
            type: fertType,
            gramsPerTree,
            totalKg,
            method: aiResult.fertilizer?.method || 'Rải đều quanh tán cây',
            timing: aiResult.fertilizer?.timing || 'Sáng sớm hoặc chiều mát',
            reason: aiResult.fertilizer?.reason || 'Theo khuyến cáo tiêu chuẩn',
            costVND: fertCostVND,
        },
        totalCostVND: waterCostVND + fertCostVND,
        tips: aiResult.tips || ['Theo dõi tình trạng cây thường xuyên'],
        weatherSummary,
        generatedAt: new Date(),
    };
};

export default {
    generateAIConsultation,
};
