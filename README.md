# HUST Exam Schedule Generator

Ứng dụng web giúp sinh viên Đại học Bách Khoa Hà Nội (HUST) dễ dàng tạo và quản lý lịch thi cá nhân từ file PDF lịch thi tổng hợp của nhà trường.

## Tính năng chính
- Tải lên file PDF lịch thi tổng hợp.
- Tự động trích xuất và chuẩn hóa dữ liệu từ dạng bảng trong PDF.
- Chọn nhiều mã lớp thi bằng giao diện tìm kiếm thông minh.
- Xem lịch thi cá nhân chi tiết và trực quan.
- **Cảnh báo trùng lịch**: Tự động phát hiện và cảnh báo nếu có 2 môn thi cùng ngày, cùng kíp.

## Công nghệ sử dụng
- **Frontend**: React, Vite, CSS Vanilla (với thiết kế Premium UI, Dark Mode).
- **Backend**: Python, FastAPI, pdfplumber (xử lý PDF), pandas.

## Hướng dẫn cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
- **Node.js** (Phiên bản 18 trở lên khuyến nghị)
- **Python** (Phiên bản 3.9 trở lên)

### 1. Khởi chạy Backend (FastAPI)
Mở terminal và di chuyển vào thư mục `backend`:
```bash
cd backend
```

Tạo môi trường ảo (Virtual Environment) và kích hoạt:
```bash
# Trên Windows
python -m venv venv
.\venv\Scripts\activate

# Trên macOS/Linux/WSL
python3 -m venv venv
source venv/bin/activate
```

Cài đặt các thư viện cần thiết:
```bash
pip install -r requirements.txt
```

Chạy server FastAPI:
```bash
python main.py
```
*Backend sẽ chạy tại địa chỉ: `http://localhost:8000`*

### 2. Khởi chạy Frontend (React + Vite)
Mở một terminal **mới**, di chuyển vào thư mục `frontend`:
```bash
cd frontend
```

Cài đặt các gói npm:
```bash
npm install
```

Khởi chạy môi trường phát triển:
```bash
npm run dev
```
*Frontend sẽ chạy tại địa chỉ do Vite cung cấp (thường là `http://localhost:5173`)*.

---

### Lưu ý khi chạy trên WSL (Windows Subsystem for Linux)
Nếu bạn đang sử dụng WSL để chạy dự án:
1. **Lệnh Python**: Bạn sử dụng cú pháp `python3` và `source venv/bin/activate` thay vì cú pháp của Windows.
2. **Truy cập từ trình duyệt Windows**: Mặc định Vite và FastAPI sẽ chạy ở `localhost` và Windows có thể truy cập thẳng vào `localhost:5173` hoặc `localhost:8000`. Tuy nhiên, nếu không truy cập được, bạn hãy chạy frontend bằng lệnh `npm run dev -- --host` để Vite mở cổng cho mạng ngoài.
3. **Hiệu suất**: Nên clone dự án vào hệ thống file của Linux (ví dụ `/home/username/`) thay vì truy cập chéo sang ổ đĩa Windows (`/mnt/c/`) để `npm install` và quá trình build chạy nhanh nhất.
