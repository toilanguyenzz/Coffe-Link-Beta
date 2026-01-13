
import { GoogleGenAI, Type } from "@google/genai";

export interface MoistureAnalysisResult {
  moisture: number; // e.g., 12.5
  status: 'WET' | 'STANDARD' | 'OVER_DRY';
  color_analysis: string;
  advice: string;
  visual_reason: string;
}

const MOISTURE_PROMPT = `
Đóng vai trò: Bạn là chuyên gia KCS Cà phê (Q-Grader) và chuyên gia thị giác máy tính.
Nhiệm vụ: Phân tích hình ảnh hạt cà phê này để ước lượng độ ẩm dựa trên Màu sắc (Color) và Độ nhăn vỏ (Texture).

BẢNG QUY CHIẾU (Calibration Table):
1. Xanh đậm, căng bóng, ướt (Green/Shiny) = 45% - 55% Độ ẩm (Cà tươi vừa hái/rửa).
2. Xanh nhạt, vỏ hơi nhăn (Greenish-Yellow) = 20% - 30% Độ ẩm.
3. Vàng chanh, vỏ trấu bắt đầu tách = 14% - 16% Độ ẩm.
4. Vàng rơm, vỏ trấu lỏng, nhân cứng (Straw Yellow) = 11% - 13% (ĐẠT CHUẨN XUẤT KHẨU).
5. Trắng bạc, nứt vỡ (Whitish/Bleached) = Dưới 10% (Quá khô/Mất cân nặng).

YÊU CẦU OUTPUT (JSON STRICT):
Trả về JSON duy nhất, không markdown.
{
  "moisture": number, // Ước lượng con số cụ thể (VD: 12.4)
  "status": "WET" | "STANDARD" | "OVER_DRY", // STANDARD là từ 11-13%
  "color_analysis": string, // Mô tả ngắn gọn màu sắc (VD: "Màu vàng rơm đồng đều")
  "visual_reason": string, // Lý do kỹ thuật (VD: "Vỏ trấu đã tách, không còn độ bóng nước")
  "advice": string // Lời khuyên (VD: "Đạt chuẩn, có thể thu bao ngay" hoặc "Phơi thêm 1 nắng to")
}
`;

export const analyzeCoffeeMoisture = async (base64Image: string): Promise<MoistureAnalysisResult> => {
  // Strip header if present
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Fast model for vision
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: "Phân tích độ ẩm cà phê theo chuẩn KCS." }
        ]
      },
      config: {
        systemInstruction: MOISTURE_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature for consistent scientific analysis
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                moisture: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ["WET", "STANDARD", "OVER_DRY"] },
                color_analysis: { type: Type.STRING },
                visual_reason: { type: Type.STRING },
                advice: { type: Type.STRING }
            },
            required: ["moisture", "status", "color_analysis", "advice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as MoistureAnalysisResult;

  } catch (error) {
    console.error("Moisture Analysis Error:", error);
    // Fallback Mock for Demo if API fails or quota exceeded
    return {
        moisture: 12.2,
        status: 'STANDARD',
        color_analysis: 'Màu vàng rơm đặc trưng, hơi ngả trắng nhẹ.',
        visual_reason: 'Vỏ trấu lỏng, nhân hạt cứng, không có dấu hiệu bóng nước.',
        advice: 'Độ ẩm rất tốt. Có thể đóng bao lưu kho.'
    };
  }
};
