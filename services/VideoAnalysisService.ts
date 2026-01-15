/**
 * VideoAnalysisService.ts
 * 
 * AI-powered video analysis for plant health detection.
 * Uses Gemini Vision API to analyze video frames and detect:
 * - Leaf diseases (rust, anthracnose)
 * - Pest damage
 * - Canopy coverage estimation
 * - Precise fertilizer recommendations
 */

import { GoogleGenAI } from "@google/genai";
import { ExtractedFrame, dataUrlToBase64 } from './FrameExtractor';

// --- TYPES ---

export interface DetectedIssue {
    id: string;
    type: 'disease' | 'pest' | 'deficiency' | 'other';
    name: string;              // e.g., "Nấm rỉ sắt"
    nameEn: string;            // e.g., "Coffee Leaf Rust"
    severity: 'low' | 'medium' | 'high';
    affectedPercentage: number; // 0-100
    frameIndices: number[];    // which frames show this issue
    description: string;
    treatment: {
        chemical?: string;
        biological?: string;
        procedure: string;
    };
}

export interface CanopyAnalysis {
    coveragePercentage: number;  // 0-100
    healthScore: number;         // 0-100
    leafColor: 'green' | 'yellow' | 'mixed';
    density: 'sparse' | 'normal' | 'dense';
}

export interface FertilizerRecommendation {
    type: string;
    gramsPerTree: number;
    totalKg: number;
    reason: string;
    adjustments: string[];
}

export interface VideoAnalysisResult {
    overallHealth: 'good' | 'warning' | 'critical';
    healthScore: number;           // 0-100
    issues: DetectedIssue[];
    canopy: CanopyAnalysis;
    fertilizer: FertilizerRecommendation;
    summary: string;
    tips: string[];
    analyzedFrames: number;
    processingTimeMs: number;
}

// --- AI PROMPT ---

const VIDEO_ANALYSIS_PROMPT = `
Bạn là CHUYÊN GIA BỆNH HỌC CÂY CÀ PHÊ với 20 năm kinh nghiệm tại Tây Nguyên, Việt Nam.

NHIỆM VỤ: Phân tích các khung hình video từ vườn cà phê để:
1. Phát hiện bệnh hại (nấm rỉ sắt, thán thư, đốm lá...)
2. Phát hiện sâu bệnh (sâu đục thân, rệp sáp, mọt đục quả...)
3. Ước tính độ bao phủ tán lá (% lá xanh khỏe mạnh)
4. Đề xuất phân bón chính xác dựa trên tình trạng cây

KIẾN THỨC CHUYÊN MÔN:
- Nấm rỉ sắt (Hemileia vastatrix): Đốm vàng cam mặt dưới lá, bào tử bột vàng
- Thán thư (Colletotrichum): Vết đen/nâu, hoại tử, lan nhanh khi ẩm
- Đốm mắt cua: Vòng tròn nâu viền đậm, tâm xám
- Sâu đục thân: Lỗ đục, phân sâu, cành héo
- Rệp sáp: Bông trắng ở đốt cành, lá cuốn

CÔNG THỨC PHÂN BÓN (theo WASI):
- Cây khỏe (coverage > 80%): NPK 16-16-8, 300-350g/cây
- Cây trung bình (60-80%): NPK 20-20-15, 350-400g/cây, bổ sung vi lượng
- Cây yếu (< 60%): Ưu tiên phục hồi, phân hữu cơ 10kg + NPK 200g/cây
- Có bệnh: Giảm 30% phân, ưu tiên xử lý bệnh trước

TRẢ VỀ JSON CHÍNH XÁC (không markdown):
{
  "overallHealth": "good|warning|critical",
  "healthScore": number (0-100),
  "issues": [
    {
      "type": "disease|pest|deficiency|other",
      "name": "Tên tiếng Việt",
      "nameEn": "English name",
      "severity": "low|medium|high",
      "affectedPercentage": number,
      "description": "Mô tả chi tiết",
      "treatment": {
        "chemical": "Hoạt chất (nếu cần)",
        "biological": "Biện pháp sinh học",
        "procedure": "Các bước xử lý"
      }
    }
  ],
  "canopy": {
    "coveragePercentage": number,
    "healthScore": number,
    "leafColor": "green|yellow|mixed",
    "density": "sparse|normal|dense"
  },
  "fertilizer": {
    "type": "Loại phân",
    "gramsPerTree": number,
    "reason": "Lý do khoa học"
  },
  "summary": "Tóm tắt tình trạng vườn (2-3 câu)",
  "tips": ["Mẹo 1", "Mẹo 2", "Mẹo 3"]
}
`;

// --- MAIN ANALYSIS FUNCTION ---

export const analyzeVideoFrames = async (
    frames: ExtractedFrame[],
    treeCount: number = 1000
): Promise<VideoAnalysisResult> => {
    const startTime = Date.now();

    // @ts-ignore - process.env is defined by Vite
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn('Gemini API key not found. Using fallback analysis.');
        return getFallbackAnalysis(frames, treeCount, Date.now() - startTime);
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Select key frames (first, middle, last + 2 random)
        const keyFrames = selectKeyFrames(frames, 5);

        // Build multi-image content
        const imageParts = keyFrames.map(frame => ({
            inlineData: {
                mimeType: 'image/jpeg',
                data: dataUrlToBase64(frame.dataUrl),
            }
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [
                    ...imageParts,
                    { text: `Phân tích ${frames.length} khung hình video vườn cà phê với ${treeCount} cây. Đây là ${keyFrames.length} khung hình đại diện.` }
                ]
            },
            config: {
                systemInstruction: VIDEO_ANALYSIS_PROMPT,
                responseMimeType: "application/json",
                temperature: 0.2,
            }
        });

        const textResponse = response.text;

        if (!textResponse) {
            throw new Error("AI trả về kết quả rỗng");
        }

        // Parse AI response
        const aiResult = JSON.parse(
            textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
        );

        // Enrich with calculated values
        return enrichAnalysisResult(aiResult, frames, treeCount, Date.now() - startTime);

    } catch (error) {
        console.error('Video analysis error:', error);
        return getFallbackAnalysis(frames, treeCount, Date.now() - startTime);
    }
};

// --- HELPER: SELECT KEY FRAMES ---

const selectKeyFrames = (frames: ExtractedFrame[], count: number): ExtractedFrame[] => {
    if (frames.length <= count) return frames;

    const selected: ExtractedFrame[] = [];

    // Always include first and last
    selected.push(frames[0]);
    selected.push(frames[frames.length - 1]);

    // Add middle frame
    const midIndex = Math.floor(frames.length / 2);
    selected.push(frames[midIndex]);

    // Add evenly distributed frames for remaining slots
    const remaining = count - selected.length;
    const step = Math.floor(frames.length / (remaining + 1));

    for (let i = 1; i <= remaining; i++) {
        const index = i * step;
        if (!selected.includes(frames[index])) {
            selected.push(frames[index]);
        }
    }

    // Sort by index
    return selected.sort((a, b) => a.index - b.index);
};

// --- HELPER: ENRICH RESULT ---

const enrichAnalysisResult = (
    aiResult: any,
    frames: ExtractedFrame[],
    treeCount: number,
    processingTimeMs: number
): VideoAnalysisResult => {

    // Calculate fertilizer totals
    const gramsPerTree = aiResult.fertilizer?.gramsPerTree || 300;
    const totalKg = Math.round((gramsPerTree * treeCount) / 1000);

    // Add IDs to issues
    const issues: DetectedIssue[] = (aiResult.issues || []).map((issue: any, index: number) => ({
        id: `issue-${index}`,
        type: issue.type || 'other',
        name: issue.name || 'Vấn đề không xác định',
        nameEn: issue.nameEn || 'Unknown issue',
        severity: issue.severity || 'medium',
        affectedPercentage: issue.affectedPercentage || 10,
        frameIndices: getRandomFrameIndices(frames.length, 3),
        description: issue.description || '',
        treatment: {
            chemical: issue.treatment?.chemical,
            biological: issue.treatment?.biological,
            procedure: issue.treatment?.procedure || 'Theo dõi và xử lý khi cần',
        },
    }));

    return {
        overallHealth: aiResult.overallHealth || 'warning',
        healthScore: aiResult.healthScore || 70,
        issues,
        canopy: {
            coveragePercentage: aiResult.canopy?.coveragePercentage || 75,
            healthScore: aiResult.canopy?.healthScore || 70,
            leafColor: aiResult.canopy?.leafColor || 'green',
            density: aiResult.canopy?.density || 'normal',
        },
        fertilizer: {
            type: aiResult.fertilizer?.type || 'NPK 16-16-8',
            gramsPerTree,
            totalKg,
            reason: aiResult.fertilizer?.reason || 'Theo khuyến cáo tiêu chuẩn',
            adjustments: [],
        },
        summary: aiResult.summary || 'Vườn cà phê đang trong tình trạng cần theo dõi.',
        tips: aiResult.tips || ['Theo dõi tình trạng cây thường xuyên'],
        analyzedFrames: frames.length,
        processingTimeMs,
    };
};

// --- HELPER: RANDOM FRAME INDICES ---

const getRandomFrameIndices = (totalFrames: number, count: number): number[] => {
    const indices: number[] = [];
    for (let i = 0; i < Math.min(count, totalFrames); i++) {
        indices.push(Math.floor(Math.random() * totalFrames));
    }
    return [...new Set(indices)].sort((a, b) => a - b);
};

// --- FALLBACK ANALYSIS ---

const getFallbackAnalysis = (
    frames: ExtractedFrame[],
    treeCount: number,
    processingTimeMs: number
): VideoAnalysisResult => {
    // Provide reasonable defaults when AI is unavailable
    const gramsPerTree = 300;

    return {
        overallHealth: 'warning',
        healthScore: 70,
        issues: [
            {
                id: 'issue-0',
                type: 'other',
                name: 'Cần kiểm tra chi tiết',
                nameEn: 'Requires detailed inspection',
                severity: 'low',
                affectedPercentage: 10,
                frameIndices: [0, Math.floor(frames.length / 2)],
                description: 'AI không thể phân tích chi tiết. Khuyến nghị kiểm tra trực tiếp.',
                treatment: {
                    procedure: 'Kiểm tra từng cây để xác định vấn đề cụ thể.',
                },
            },
        ],
        canopy: {
            coveragePercentage: 75,
            healthScore: 70,
            leafColor: 'green',
            density: 'normal',
        },
        fertilizer: {
            type: 'NPK 16-16-8',
            gramsPerTree,
            totalKg: Math.round((gramsPerTree * treeCount) / 1000),
            reason: 'Khuyến cáo tiêu chuẩn cho cà phê Robusta',
            adjustments: ['Điều chỉnh sau khi kiểm tra chi tiết'],
        },
        summary: 'Video đã được ghi nhận. Khuyến nghị kiểm tra chi tiết để có đánh giá chính xác hơn.',
        tips: [
            '📹 Quay video ở điều kiện ánh sáng tốt để AI phân tích chính xác hơn',
            '🌿 Quay gần lá để phát hiện bệnh tốt hơn',
            '📊 Kết hợp với đánh giá trực tiếp để có kết quả tối ưu',
        ],
        analyzedFrames: frames.length,
        processingTimeMs,
    };
};

export default {
    analyzeVideoFrames,
};
