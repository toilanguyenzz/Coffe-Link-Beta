import { GoogleGenAI, Type } from "@google/genai";

export interface EUDRAnalysisResult {
  eudr_status: "APPROVED" | "WARNING";
  risk_level: "LOW" | "HIGH";
  compliance_message: string;
  geo_verification: string;
}

/**
 * Hàm gọi AI để phân tích tuân thủ EUDR
 * @param year Năm canh tác
 * @param lat Vĩ độ
 * @param lng Kinh độ
 */
export const analyzeEUDR = async (year: number, lat: number, lng: number): Promise<EUDRAnalysisResult | null> => {
  try {
    // Initialize inside the function to use the latest API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích dữ liệu nông trại: Năm canh tác: ${year}, Tọa độ: ${lat}, ${lng}`,
      config: {
        systemInstruction: `Bạn là chuyên gia thẩm định tuân thủ quy định EUDR (Quy định chống phá rừng châu Âu) cho dự án CoffeeLink Agri-OS. 
Nhiệm vụ của bạn là nhận dữ liệu đầu vào gồm "Vị trí đất" (Tọa độ) và "Năm canh tác", sau đó trả về kết quả dưới dạng JSON thuần túy.

QUY TẮC XỬ LÝ:
1. Xác định mốc thời gian (Cut-off date): 31/12/2020.
2. Logic phân tích:
   - Nếu "plantingYear" <= 2020: Đất canh tác lâu năm -> AN TOÀN (Low Risk).
   - Nếu "plantingYear" > 2020: Đất mới khai hoang -> CẢNH BÁO (High Risk) -> Yêu cầu kiểm tra ảnh vệ tinh tại tọa độ đã cung cấp.
3. Output bắt buộc là JSON, ngôn ngữ Tiếng Việt, văn phong chuyên nghiệp, ân cần với nông dân.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eudr_status: { type: Type.STRING, enum: ["APPROVED", "WARNING"] },
            risk_level: { type: Type.STRING, enum: ["LOW", "HIGH"] },
            compliance_message: { type: Type.STRING },
            geo_verification: { type: Type.STRING }
          },
          required: ["eudr_status", "risk_level", "compliance_message", "geo_verification"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as EUDRAnalysisResult;
  } catch (error) {
    console.error("EUDR Analysis Error:", error);
    return null;
  }
};