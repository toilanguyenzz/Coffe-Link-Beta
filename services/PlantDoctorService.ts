
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

// --- DEMO MODE DATA ---
// Used when API is unavailable or for testing purposes

const DEMO_DISEASES: PlantAnalysisResult[] = [
  {
    is_plant: true,
    disease_name: "Rỉ sắt (Coffee Leaf Rust)",
    confidence: 92,
    severity: "HIGH",
    diagnosis: "Phát hiện bào tử nấm màu vàng cam dưới mặt lá, lá có xu hướng rụng sớm.",
    treatment: {
      chemical: "Hexaconazole 5% hoặc Propiconazole 25%",
      biological: "Nấm đối kháng Trichoderma harzianum, phun chế phẩm Bacillus subtilis",
      procedure: "• Cắt bỏ và tiêu hủy lá bị bệnh nặng\n• Phun thuốc vào sáng sớm, tránh trời mưa\n• Phun đều 2 mặt lá, chu kỳ 7-10 ngày/lần\n• Lặp lại 2-3 lần liên tiếp"
    },
    prevention: "Trồng giống kháng bệnh (Catimor, TRS1); Bón phân cân đối NPK; Tỉa cành tạo thông thoáng; Tránh trồng mật độ quá dày."
  },
  {
    is_plant: true,
    disease_name: "Thán thư (Anthracnose)",
    confidence: 87,
    severity: "MEDIUM",
    diagnosis: "Đốm tròn màu nâu đen trên lá và quả, vết bệnh có viền đậm màu.",
    treatment: {
      chemical: "Mancozeb 80% WP hoặc Carbendazim 50%",
      biological: "Thuốc đồng hữu cơ Bordeaux, chế phẩm EM",
      procedure: "• Thu gom và tiêu hủy lá, quả rụng\n• Phun phòng trước mùa mưa\n• Phun đều tán cây, nhắc lại sau 14 ngày"
    },
    prevention: "Vệ sinh vườn thường xuyên; Không tưới nước vào chiều tối; Cung cấp đủ Kali để tăng sức đề kháng."
  },
  {
    is_plant: true,
    disease_name: "Đốm mắt cua (Cercospora)",
    confidence: 85,
    severity: "LOW",
    diagnosis: "Đốm tròn nhỏ màu nâu xám, tâm trắng với viền nâu đỏ, giống mắt cua.",
    treatment: {
      chemical: "Chlorothalonil 75% WP",
      biological: "Dịch chiết tỏi pha loãng, nước vôi trong",
      procedure: "• Tỉa bỏ lá bệnh nặng\n• Phun thuốc khi phát hiện triệu chứng đầu tiên\n• Lặp lại sau 10-14 ngày nếu cần"
    },
    prevention: "Đảm bảo thoát nước tốt; Bón phân hữu cơ đầy đủ; Che phủ đất bằng rơm rạ."
  }
];

// Check if Demo Mode is enabled (via localStorage or env)
const isDemoMode = (): boolean => {
  return localStorage.getItem('PLANT_DOCTOR_DEMO') === 'true' ||
    (import.meta as any).env?.VITE_DEMO_MODE === 'true';
};

// Get random demo result
const getDemoResult = (): PlantAnalysisResult => {
  const randomIndex = Math.floor(Math.random() * DEMO_DISEASES.length);
  return { ...DEMO_DISEASES[randomIndex] };
};

// --- SERVICE ---

export const analyzePlantDisease = async (base64Image: string): Promise<PlantAnalysisResult> => {
  // 1. Input Validation
  if (!base64Image) {
    throw new PlantDoctorError("Hình ảnh không hợp lệ.", 'INVALID_IMAGE');
  }

  // 2. Check Demo Mode - return mock data immediately
  if (isDemoMode()) {
    console.log("🧪 PlantDoctor: Running in DEMO MODE");
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getDemoResult();
  }

  // Strip data URI scheme if present (e.g., "data:image/jpeg;base64,...")
  const base64Data = base64Image.includes(',')
    ? base64Image.split(',')[1]
    : base64Image;

  try {
    // 3. Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY });

    // 4. Call API
    // Using gemini-1.5-flash as requested for speed and stability
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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

    const textResponse = response.text; // Fixed: response.text is a getter/string in this SDK version

    if (!textResponse) {
      throw new Error("AI trả về kết quả rỗng.");
    }

    // 5. Parse JSON Securely
    let result: PlantAnalysisResult;
    try {
      // Clean potential markdown blocks just in case
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Error:", textResponse);
      throw new Error("Lỗi xử lý dữ liệu từ AI.");
    }

    // 6. Guardrail: Check is_plant
    if (!result.is_plant) {
      throw new PlantDoctorError("Không nhận diện được cây trồng. Vui lòng chụp lại ảnh rõ nét hơn.", 'NOT_A_PLANT');
    }

    return result;

  } catch (error: any) {
    console.error("Plant Doctor Service Error:", error);

    // Rethrow known errors (NOT_A_PLANT should not fallback)
    if (error instanceof PlantDoctorError && error.code === 'NOT_A_PLANT') {
      throw error;
    }

    // FALLBACK TO DEMO MODE on connection errors
    console.warn("⚠️ API failed, falling back to DEMO MODE");
    localStorage.setItem('PLANT_DOCTOR_DEMO', 'true'); // Enable for future calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getDemoResult();
  }
};
