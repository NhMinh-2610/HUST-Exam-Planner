# 🎓 HUST Exam Planner

**HUST Exam Planner** là công cụ tối ưu hóa trải nghiệm xem và quản lý lịch thi dành riêng cho sinh viên Đại học Bách Khoa Hà Nội (HUST). 

Thay vì phải căng mắt dò tìm mã lớp của mình trong file PDF lịch thi hàng trăm trang từ SIS, ứng dụng này sẽ tự động đọc file PDF, lọc ra danh sách môn thi của riêng bạn và hiển thị dưới một giao diện Lịch/Bảng cực kỳ trực quan.

**🔗 Trải nghiệm ngay tại:** [https://hust-exam-planner.vercel.app/](https://hust-exam-planner.vercel.app/)

---

## ✨ Tính năng nổi bật

- **📄 Đọc PDF:** Ứng dụng tự động bóc tách dữ liệu chuẩn xác từ file PDF lịch thi do trường cung cấp.
- **🎯 Tự động lọc môn thi cá nhân:** Nhập mã lớp, ứng dụng sẽ tìm và chỉ hiển thị đúng lịch thi của riêng bạn.
- **🗓️ Hiển thị trực quan (Calendar & Table View):** 
  - Xem theo dạng **Bảng** chi tiết các môn thi.
  - Xem theo dạng **Lịch (Tuần, Tháng, Lịch trình)** giúp dễ dàng định hình khối lượng ôn tập.
- **⚠️ Cảnh báo trùng lịch thi thông minh:** Tự động phát hiện các môn thi bị xếp trùng ngày giờ. Cung cấp tính năng để bạn tự "chốt" chọn 1 trong số các môn trùng để hiện lên lịch.
- **🖨️ Tối ưu hóa In ấn (Print-friendly):** Giao diện khi ấn `Ctrl + P` được thiết kế đặc biệt (loại bỏ màu nền, viền đen sắc nét, tự căn lề) để in ra giấy A4 cực kỳ rõ ràng, sạch sẽ và chuyên nghiệp.
- **🎨 Giao diện mang bản sắc Bách Khoa:** Thiết kế Light Mode thanh lịch với tông màu **Đỏ HUST** đặc trưng, kết hợp cùng ảnh nền Tòa nhà C1 mờ ảo tạo cảm giác rất "Bách Khoa".

---

## 🚀 Công nghệ sử dụng

Ứng dụng được chia làm 2 phần độc lập (Frontend và Backend):

**Frontend (Giao diện người dùng):**
- **React.js** (Khởi tạo bằng Vite)
- **CSS3 / CSS Variables** (Tự xây dựng thiết kế theo phong cách Glassmorphism và HUST Theme)
- **React Big Calendar** (Bộ thư viện hiển thị Lịch tương tác cao)
- **Lucide React** (Bộ Icon UI)
- Trực tiếp chạy trên nền tảng Cloud của **Vercel**.

**Backend (API Server):**
- **Python / FastAPI** (Xây dựng API tốc độ cao)
- **pdfplumber** (Trích xuất văn bản có cấu trúc từ file PDF của nhà trường)
- Dữ liệu lịch thi được **parse offline** thành file JSON bằng script `generate_cache.py`, backend chỉ đọc JSON khi chạy.
- Trực tiếp chạy trên nền tảng Cloud của **Render**.

---

## 🛠️ Hướng dẫn cài đặt và chạy trên máy tính (Local)

Nếu bạn muốn tải code về và tự chạy trên máy của mình:

### 1. Cài đặt Backend (Python)
```bash
cd backend
python -m venv venv

# Kích hoạt môi trường ảo (Windows)
venv\Scripts\activate

# Cài đặt thư viện
pip install -r requirements.txt
```

### 2. Tạo dữ liệu lịch thi (Bắt buộc trước khi chạy Backend)

Bỏ file PDF lịch thi vào thư mục `backend/data/`, sau đó chạy script để tạo file `default.json`:

```bash
python generate_cache.py
```

> **Lưu ý:** File PDF lớn (~1MB, hàng trăm trang) có thể mất 1-2 phút để xử lý.  
> Mỗi khi **thêm, xóa hoặc cập nhật** file PDF, bạn cần **chạy lại** lệnh này.

### 3. Khởi động Backend
```bash
uvicorn main:app --reload
# Backend sẽ chạy tại: http://localhost:8000
```

### 4. Khởi động Frontend (React)
Mở một cửa sổ Terminal mới:
```bash
cd frontend

# Cài đặt thư viện Node.js
npm install

# Chạy Web
npm run dev
# Frontend sẽ chạy tại: http://localhost:5173
```

---

## 📁 Cấu trúc thư mục chính

```
HUST-Exam-Planner/
├── backend/
│   ├── data/                  # Thư mục chứa file PDF & default.json
│   │   ├── *.pdf              # File PDF lịch thi (đầu vào)
│   │   └── default.json       # Dữ liệu đã parse (đầu ra)
│   ├── services/
│   │   └── pdf_parser.py      # Logic bóc tách dữ liệu từ PDF
│   ├── schemas/
│   │   └── schedule_schema.py # Schema dữ liệu API
│   ├── generate_cache.py      # Script tạo default.json từ PDF
│   ├── main.py                # FastAPI server
│   └── requirements.txt
└── frontend/                  # React app (Vite)
```

---

## 👨‍💻 Tác giả

Phát triển dành tặng riêng cho cộng đồng sinh viên Đại học Bách Khoa Hà Nội (HUST). 

Chúc các bạn ôn thi hiệu quả và qua môn thành công! ❤️
