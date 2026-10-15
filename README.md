# 🛸 UFO BẮT TRẢ BÀI - TRÒ CHƠI GỌI TÊN HỌC SINH NGẪU NHIÊN

Ứng dụng web tương tác gọi tên học sinh ngẫu nhiên phong cách **Tàu Đĩa Bay UFO Hút Bắt Cóc** vui nhộn, sống động và kịch tính dành cho giáo viên và học sinh trên lớp học.

---

## ✨ Tính năng nổi bật

1. **Hoạt cảnh Đĩa bay UFO điện ảnh (Cinematic Saucer Sequence):**
   - Đĩa bay quay vòng tròn với hệ thống 12 đèn viền đổi màu carnival rực rỡ, cabin kính phản chiếu và thấu kính phát xạ laser.
   - Khi bắt đầu, tàu UFO lượn 1 vòng trên bầu trời, khóa mục tiêu và bật luồng hút siêu rộng (**Ultra-Wide Tractor Beam**).
   - Sau khi hút bạn thứ nhất, tàu UFO lượn thêm 1 vòng nữa quanh bầu trời để săn tìm và hút bạn thứ hai!
   - Tốc độ nhanh gọn, dứt khoát: gọi 2–3 học sinh chỉ trong 5–8 giây.

2. **Mô hình người đi bộ & Bám chặt vật thể:**
   - Khi bình thường: Học sinh thong thả đi dạo, trò chuyện, bóng bay và cặp sách đung đưa trên phố.
   - Khi UFO bật chùm hút: Học sinh cuống cuồng bám chặt tay vào các vật thể thật (cột đèn đường, xe máy Vespa, bến xe buýt, bốt điện thoại, cột phân cách), người bay lơ lửng, chân đạp loạn xạ, miệng há hốc kêu cứu.
   - Học sinh bị gọi tên sẽ tuột tay và bị hút thẳng lên tàu vũ trụ kèm biểu cảm hoảng hốt vui nhộn.

3. **Quản lý danh sách lớp học:**
   - Chỉnh sửa trực tiếp tên từng học sinh bằng icon cây bút ✏️.
   - Thêm học sinh đơn lẻ hoặc **Dán nhanh danh sách cả lớp** từ Excel/Word chỉ trong 1 giây.
   - Hỗ trợ quản lý nhiều lớp học khác nhau (10A1, 10A2, 11B...).
   - Tự động lưu trữ vĩnh viễn trên trình duyệt (`localStorage`).

4. **Ngân hàng câu hỏi kiểm tra & Công thức Toán SGK (LaTeX / KaTeX):**
   - Hỗ trợ gõ công thức Toán học chuẩn mực bằng cú pháp `$công thức$` (ví dụ: `$x^2 - 4x + 3 = 0$`, `$\int_{a}^{b} f(x)dx$`, `$\frac{a}{b}$`, `$\sqrt{x}$`, `$\Delta$`, `$\vec{v}$`...).
   - Hộp xem trước trực tiếp (Live Preview) công thức Toán ngay khi gõ.
   - Thanh công cụ chèn nhanh ký hiệu Toán, Lý, Hóa tiện lợi.
   - Khi gọi tên học sinh, giáo viên có thể bốc ngẫu nhiên câu hỏi để kiểm tra bài cũ ngay trên màn hình triệu tập.

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ

### Yêu cầu
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18+).

### Các bước cài đặt:
1. Clone dự án về máy:
   ```bash
   git clone https://github.com/nguyenvanthien1812-ops/tro-choi-dia-bay.git
   cd tro-choi-dia-bay
   ```

2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi chạy máy chủ phát triển (Dev Server):
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: `http://localhost:3000/`

4. Đóng gói bản Production:
   ```bash
   npm run build
   ```

---

## ⌨️ Phím tắt nhanh
- **Phím Cách (Spacebar):** Bắt đầu gọi tên / Dừng lại.
- **F11 / Nút Toàn màn hình:** Trình chiếu toàn màn hình trên máy chiếu hoặc tivi lớp học.

---

© 2026 UFO Bắt Trả Bài - Sáng tạo cho lớp học hạnh phúc.
