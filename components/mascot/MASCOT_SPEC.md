# Đậu Đậu - Linh Vật CoffeeLink Agri-OS

## 1. NHẬN DIỆN NHÂN VẬT (CHARACTER IDENTITY)

**Tên gọi:** ĐẬU ĐẬU (Gần gũi, dễ gọi, gợi nhớ hạt cà phê)

**Chủng loại:** Hạt Cà Phê Robusta (Tròn trịa, mập mạp, khỏe khoắn)

**Phong cách đồ họa:** 3D Cartoon (Kiểu Pixar/Disney) nhưng render dạng 2D (Flat 3D) để nhẹ App

### Trang phục (Local Touch - Yếu tố bản địa):
- **Đầu:** Đội mũ tai bèo (màu rằn ri hoặc xanh lá) hoặc khăn rằn buộc trán
- **Thân:** Đeo một cái túi xách chéo bằng vải thổ cẩm (họa tiết dân tộc Ba Na/Ê Đê) – Chi tiết này để đựng "Dữ liệu"
- **Chân:** Đi dép lốp (hoặc chân trần cho dân dã)

### Tính cách:
- Lễ phép với người lớn (gọi Bác, xưng Cháu)
- Lanh lợi, thông minh, đôi khi hơi "lém lỉnh" và ham ăn (ham ăn dữ liệu)
- Sợ sâu bệnh, sợ thuốc giả

---

## 2. CƠ CHẾ "NUÔI PET" (CORE MECHANIC)

Biến việc nhập liệu nhàm chán thành game nuôi thú ảo.

| Trạng thái | Mood | Điều kiện kích hoạt | Biểu cảm & Hình ảnh | Câu thoại (Mẫu) |
|------------|------|---------------------|---------------------|-----------------|
| **BÉO MẦM** (Vui) | `happy` | Quét thuốc đủ, Ghi nhật ký hôm nay, Điểm xanh > 50 | Căng bóng, da láng mịn, Nhảy múa, bắn tim, Đeo kính râm ngầu | "Bác nuôi cháu mát tay quá! Da cháu căng thế này lái buôn nhìn là mê!" |
| **HÉO HON** (Buồn) | `sad` | 3 ngày không mở App, Quên ghi nhật ký, Không quét thuốc | Teo tóp, nhăn nheo, người xám xịt, Cầm cái bát mẻ chìa ra, Mắt rưng rưng | "Đói... Đói dữ liệu quá bác ơi... Cho cháu xin một dòng nhật ký đi mà..." |
| **HOẢNG LOẠN** (Sợ) | `panic` | Quét phải thuốc cấm, Sắp có bão/mưa đá | Đội mũ bảo hiểm, Thổi còi tuýt tuýt, Mặt tái mét | "BÁO ĐỘNG ĐỎ! Thuốc này cấm nha bác! Dừng tay lại ngay kẻo toang!" |
| **NGỦ GẬT** (Idle) | `sleepy` | Mở App vào ban đêm (sau 22h) | Mặc đồ ngủ, ôm gối, chảy nước miếng | "Khuya rồi bác ơi, ngủ sớm lấy sức mai ra rẫy. Cháu sập nguồn đây..." |
| **HÀO HỨNG** | `excited` | Giá cà phê tăng, Thăng hạng | Nhảy múa, bắn confetti | "Trúng mánh rồi Bác ơi!" |
| **CHÓNG MẶT** | `dizzy` | Tap liên tục 5 lần (Easter egg) | Mắt xoay vòng vòng, lăn ra xỉu | "Bác đừng chọc lét cháu nữa, buồn cười quá!" |

---

## 3. KỊCH BẢN TƯƠNG TÁC THEO NGỮ CẢNH

### A. Trang chủ (Home) – "Đứa cháu đón cửa"
- **Giá tăng:** Cầm xấp tiền quạt phành phạch - "Trúng mánh rồi Bác ơi!"
- **Sắp mưa:** Mặc áo mưa nilon, run cầm cập - "Mèn ơi, ông trời sắp khóc nhè rồi!"
- **Sáng sớm (5h-7h):** Cầm ly cà phê bốc khói - "Làm ly đen đá lấy sức ra rẫy không bác?"

### B. Vườn tược (My Farm) – "Quản gia khó tính"
- **Quên ghi nhật ký:** Gõ gõ vào cái bụng lép kẹp
- **Có sâu bệnh:** Cầm kính lúp soi, mặt nghiêm trọng
- **Check EUDR Xanh:** Đóng dấu "CỘP" đỏ chót

### C. Chợ (Market) – "Cảnh sát & Cố vấn"
- **Xem thuốc BVTV:** Làm động tác "Suỵt", thì thầm - "Nhớ quét mã vạch nha Bác!"
- **Có Deal ngon:** Cầm loa bắc lên miệng hét
- **Giỏ hàng rỗng:** Phủi bụi túi quần

### D. Cá nhân (Profile) – "Thủ kho tích điểm"
- **Thăng hạng:** Thổi kèn tò te, bắn pháo giấy
- **Đổi quà:** Cúi người dâng quà bằng hai tay

### E. Sự cố hệ thống
- **Loading:** Đậu Đậu chạy bộ trên máy chạy bộ - "Đợi xíu, cháu đang chạy ra rẫy lấy dữ liệu..."
- **Mất mạng:** Vấp cục đá ngã sấp mặt - "Ui da! Mất mạng rồi bác ơi."

---

## 4. EASTER EGGS (Tính năng ẩn)

| Hành động | Kết quả | Message |
|-----------|---------|---------|
| Tap 1 lần | Đậu Đậu cười "Hi hi" và nhảy lên | "Hi hi! Bác chọc cháu chi vậy?" |
| Tap liên tục 5 lần | Đậu Đậu chóng mặt, mắt xoay vòng vòng | "Bác đừng chọc lét cháu nữa, buồn cười quá!" |
| **Tap 100 lần (SECRET!)** | Tặng Voucher giảm giá 10.000đ | "Bác kiên trì quá! Tặng bác món quà mọn uống nước! 🎁" |

---

## 5. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM

### Vị trí hiển thị: "BUBBLE HEAD"
- **Vị trí:** Góc dưới bên phải màn hình (cách đáy 80px để không che thanh Menu)
- **Kích thước:** 56x56 pixels

### Cơ chế hoạt động:
- **Trạng thái tĩnh:** Nằm im, thỉnh thoảng nháy mắt hoặc lắc lư nhẹ
- **Trạng thái hoạt động:** Hiện bong bóng thoại 4-5 giây rồi tự tắt

### Tương tác:
- Kéo thả Đậu Đậu đi chỗ khác nếu bị che nội dung
- Vuốt mạnh sang lề màn hình để ẩn tạm thời
- Tap để xem message hoặc trigger easter egg

### Health Bar:
- **Xanh (>60%):** Đậu Đậu khỏe mạnh
- **Vàng (30-60%):** Cần chăm sóc
- **Đỏ (<30%):** Đang héo hon, cần ghi nhật ký ngay!

---

## 6. CÁC FILE LIÊN QUAN

### Components:
- `components/mascot/DauDauSprite.tsx` - Render nhân vật với animation
- `components/mascot/DauDauDialog.tsx` - Bong bóng thoại
- `components/mascot/DauDauBubble.tsx` - Floating bubble (wrapper)
- `components/mascot/index.ts` - Export tất cả components

### Services:
- `services/MascotService.ts` - Logic xử lý mood, health, messages

### Context:
- `contexts/MascotContext.tsx` - State management cho toàn app

### Images:
- `public/mascot/daudau_happy.png` - Trạng thái vui
- `public/mascot/daudau_sad.png` - Trạng thái buồn
- `public/mascot/daudau_panic.png` - Trạng thái hoảng loạn
- `public/mascot/daudau_sleepy.png` - Trạng thái buồn ngủ
- `public/mascot/daudau_excited.png` - Trạng thái hào hứng
- `public/mascot/daudau_dizzy.png` - Trạng thái chóng mặt

---

## 7. SỬ DỤNG TRONG CODE

### Trigger một message cụ thể:
```tsx
import { useMascot } from '@/contexts/MascotContext';

function MyComponent() {
    const { triggerWeatherWarning, triggerPriceUp, triggerBannedChemical } = useMascot();
    
    // Khi phát hiện thời tiết xấu
    triggerWeatherWarning();
    
    // Khi giá cà phê tăng
    triggerPriceUp();
    
    // Khi quét phải thuốc cấm
    triggerBannedChemical();
}
```

### Hiển thị message tùy chỉnh:
```tsx
const { showMessage } = useMascot();

showMessage({
    text: "Message tùy chỉnh của bạn",
    mood: "happy", // happy | sad | panic | sleepy | excited | dizzy | idle
    type: "tip", // greeting | warning | celebration | reminder | tip | easter_egg | secret_reward
    duration: 5000, // milliseconds
});
```

---

## 8. ROADMAP TƯƠNG LAI

- [ ] Thêm Lottie animation cho nhẹ hơn (.json thay vì .png)
- [ ] Sound effects khi tap (tiếng cười, tiếng huýt sáo)
- [ ] Thêm trang phục seasonal (Tết, Mùa thu hoạch)
- [ ] Gamification: Thu thập items cho Đậu Đậu
- [ ] Đậu Đậu có thể "nói chuyện" với AI (chat)
