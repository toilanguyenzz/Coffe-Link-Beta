
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---

export interface TreatmentPlan {
  chemical: string;
  biological: string;
  procedure: string;
}

export interface PlantAnalysisResult {
  is_plant: boolean;
  disease_name: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  diagnosis: string;
  treatment: TreatmentPlan;
  prevention: string;
}

// --- CUSTOM ERRORS ---

export class PlantDoctorError extends Error {
  constructor(message: string, public code: 'NOT_A_PLANT' | 'API_ERROR' | 'INVALID_IMAGE') {
    super(message);
    this.name = 'PlantDoctorError';
  }
}

// --- CONFIGURATION ---

const SYSTEM_PROMPT = `
Đóng vai: Bạn là chuyên gia Nông học cấp cao (Agri-Doctor) tại Việt Nam với 20 năm kinh nghiệm.
Nhiệm vụ: Phân tích hình ảnh lá cây/cây trồng được cung cấp và chẩn đoán bệnh học.

YÊU CẦU BẮT BUỘC VỀ OUTPUT (JSON STRICT MODE):
1. Chỉ trả về duy nhất một chuỗi JSON hợp lệ. Không được có markdown (\`\`\`json), không có lời dẫn.
2. Cấu trúc JSON phải chính xác như sau:
{
  "is_plant": boolean, // True nếu là cây trồng, False nếu là người/đồ vật/ảnh mờ
  "disease_name": string, // Tên bệnh tiếng Việt chính xác (VD: Rỉ sắt, Thán thư...). Nếu cây khỏe, ghi "Cây khỏe mạnh".
  "confidence": number, // Độ tin cậy từ 0-100
  "severity": "LOW" | "MEDIUM" | "HIGH", // Mức độ nghiêm trọng
  "diagnosis": string, // Mô tả triệu chứng ngắn gọn (tối đa 20 từ)
  "treatment": {
    "chemical": string, // Gợi ý hoạt chất thuốc BVTV được phép dùng tại VN (VD: Hexaconazole)
    "biological": string, // Biện pháp sinh học/hữu cơ (VD: Nấm đối kháng Trichoderma)
    "procedure": string // Các bước xử lý (Gạch đầu dòng)
  },
  "prevention": string // Biện pháp phòng ngừa lâu dài
}

QUY TẮC NGHIỆP VỤ:
- Nếu "is_plant" là False: Các trường còn lại để null hoặc chuỗi rỗng.
- Về thuốc: Chỉ gợi ý tên hoạt chất (Active Ingredient), KHÔNG gợi ý tên thương hiệu cụ thể để tránh quảng cáo.
- Giọng văn: Nghiêm túc, đồng cảm với nông dân, ngắn gọn, dễ hiểu.
`;

// --- SERVICE ---

export const analyzePlantDisease = async (base64Image: string): Promise<PlantAnalysisResult> => {
  // 1. Input Validation
  if (!base64Image) {
    throw new PlantDoctorError("Hình ảnh không hợp lệ.", 'INVALID_IMAGE');
  }

  // Strip data URI scheme if present (e.g., "data:image/jpeg;base64,...")
  const base64Data = base64Image.includes(',') 
    ? base64Image.split(',')[1] 
    : base64Image;

  try {
    // 2. Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Call API
    // Using gemini-2.5-flash-image or gemini-3-flash-preview. 
    // Given the complex reasoning required for "Agri-Doctor", 3-flash is safer for instruction following.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: "Hãy phân tích ảnh này theo đúng cấu trúc JSON đã yêu cầu." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for consistent, factual output
      }
    });

    const textResponse = response.text;

    if (!textResponse) {
      throw new Error("AI trả về kết quả rỗng.");
    }

    // 4. Parse JSON Securely
    let result: PlantAnalysisResult;
    try {
      // Clean potential markdown blocks just in case
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Error:", textResponse);
      throw new Error("Lỗi xử lý dữ liệu từ AI.");
    }

    // 5. Guardrail: Check is_plant
    if (!result.is_plant) {
      throw new PlantDoctorError("Không nhận diện được cây trồng. Vui lòng chụp lại ảnh rõ nét hơn.", 'NOT_A_PLANT');
    }

    return result;

  } catch (error: any) {
    console.error("Plant Doctor Service Error:", error);

    // Rethrow known errors
    if (error instanceof PlantDoctorError) {
      throw error;
    }

    // Handle Network/API errors
    throw new PlantDoctorError("Lỗi kết nối máy chủ AI. Vui lòng thử lại sau.", 'API_ERROR');
  }
};
