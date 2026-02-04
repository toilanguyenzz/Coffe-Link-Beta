
/**
 * DEMONSTRATION SCRIPT: AGRI-DOCTOR (Bác sĩ Nông học AI)
 * 
 * Mục đích: 
 * Mô phỏng lại quy trình xử lý của tính năng "Bác sĩ cây trồng" trong ứng dụng.
 * Giúp người dùng hiểu cách dữ liệu đi từ Ảnh -> AI -> Kết quả chẩn đoán.
 */

import { PlantAnalysisResult } from '../services/PlantDoctorService';

// 1. GIẢ LẬP INPUT (Ảnh từ Camera người dùng)
// Trong thực tế, đây sẽ là chuỗi base64 của ảnh chụp lá cây.
const MOCK_INPUT_IMAGE = "[IMAGE_BASE64_DATA_...]";
console.log("---------------------------------------------------");
console.log("🚀 BẮT ĐẦU QUY TRÌNH CHẨN ĐOÁN CÂY TRỒNG");
console.log("---------------------------------------------------");
console.log(`1️⃣  NHẬN ẢNH ĐẦU VÀO: Đã nhận ảnh từ Camera người dùng.`);

// 2. MÔ PHỎNG GỌI SERVICE (PlantDoctorService.analyzePlantDisease)
async function simulateDoctorAnalysis() {
    console.log(`2️⃣  XỬ LÝ: Đang gửi ảnh tới Google Gemini AI (Model: gemini-1.5-flash)...`);
    console.log(`    > Kèm theo Prompt chuyên gia: "Đóng vai chuyên gia Nông học, trả về JSON..."`);

    // Giả lập độ trễ mạng (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log(`3️⃣  PHÂN TÍCH AI: Gemini đang phân tích điểm ảnh để tìm dấu hiệu bệnh...`);

    // 3. MÔ PHỎNG KẾT QUẢ TỪ AI (JSON Output)
    // Đây là kết quả thực tế mà AI sẽ trả về cho bệnh "Gỉ s sắt" trên cây cà phê
    const mockAiResponse: PlantAnalysisResult = {
        is_plant: true,
        disease_name: "Bệnh Gỉ Sắt (Coffee Leaf Rust)",
        confidence: 98,
        severity: "HIGH",
        diagnosis: "Lá có các đốm vàng cam ở mặt dưới, dạng bột phấn. Mặt trên lá có vết biến màu tương ứng.",
        treatment: {
            chemical: "Hexaconazole hoặc Propiconazole (Phun ướt đều tán lá)",
            biological: "Sử dụng chế phẩm nấm đối kháng Trichoderma hoặc Bacillus subtilis",
            procedure: "- Cắt tỉa cành bệnh và tiêu hủy\n- Phun thuốc vào sáng sớm hoặc chiều mát\n- Phun lặp lại sau 7-10 ngày"
        },
        prevention: "Trồng cây che bóng hợp lý, bón phân cân đối, tránh bón thừa đạm."
    };

    console.log(`4️⃣  KẾT QUẢ TRẢ VỀ: Đã nhận dữ liệu JSON từ AI.`);
    console.log("---------------------------------------------------");
    console.log("📋 KẾT QUẢ CHẨN ĐOÁN CHI TIẾT:");
    console.log("---------------------------------------------------");

    // Hiển thị kết quả đẹp
    console.log(`🏥 Tên bệnh: ${mockAiResponse.disease_name}`);
    console.log(`⚠️ Mức độ:   ${mockAiResponse.severity} (Độ tin cậy: ${mockAiResponse.confidence}%)`);
    console.log(`🔍 Triệu chứng: ${mockAiResponse.diagnosis}`);
    console.log(`\n💊 PHÁC ĐỒ ĐIỀU TRỊ:`);
    console.log(`   - Hóa học:  ${mockAiResponse.treatment.chemical}`);
    console.log(`   - Sinh học: ${mockAiResponse.treatment.biological}`);
    console.log(`   - Quy trình: \n${mockAiResponse.treatment.procedure}`);
    console.log(`\n🛡️ PHÒNG NGỪA: ${mockAiResponse.prevention}`);
    console.log("---------------------------------------------------");
}

// Chạy mô phỏng
simulateDoctorAnalysis();
