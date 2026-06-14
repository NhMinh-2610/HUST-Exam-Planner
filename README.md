# HUST Exam Planner

Ứng dụng web hỗ trợ sinh viên HUST tạo lịch thi cá nhân từ file PDF lịch thi tổng hợp của nhà trường.

## Tính năng

- **Upload PDF**: Tải lên 1 hoặc nhiều file lịch thi (hỗ trợ cả 2 hệ đào tạo).
- **Tìm kiếm & chọn mã lớp**: Giao diện autocomplete, chọn nhiều mã lớp cùng lúc.
- **Xác nhận mã lớp thi**: Nếu 1 mã lớp có nhiều mã lớp thi (chia phòng), hệ thống yêu cầu chọn chính xác.
- **Hiển thị lịch thi**: Dạng bảng chi tiết hoặc dạng lịch (Calendar View).
- **Cảnh báo trùng lịch**: Phát hiện tự động khi có 2 môn thi cùng ngày, cùng kíp.

## Công nghệ

| Layer    | Stack                                      |
|----------|---------------------------------------------|
| Frontend | React 19, Vite, react-big-calendar, Vanilla CSS |
| Backend  | Python 3.9+, FastAPI, pdfplumber            |

## Cài đặt & Chạy

### Backend

```bash
cd backend
python3 -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS / WSL
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

Server chạy tại `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Truy cập `http://localhost:5173`.

> **WSL**: Nếu chạy trên WSL, nên clone project vào filesystem Linux (`~/`) thay vì `/mnt/c/` để tối ưu hiệu suất. Nếu trình duyệt không truy cập được `localhost`, chạy `npm run dev -- --host`.

## Cấu trúc thư mục

```
HUST-Exam-Planner/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── schemas/
│   │   └── schedule_schema.py
│   └── services/
│       └── pdf_parser.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── UploadBox.jsx
│   │   │   ├── ClassSelector.jsx
│   │   │   ├── ClassConflictResolver.jsx
│   │   │   ├── ScheduleTable.jsx
│   │   │   ├── ConflictWarning.jsx
│   │   │   └── CalendarView.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
└── README.md
```

## Quy ước giờ thi

| Kíp   | Giờ bắt đầu |
|-------|-------------|
| Kíp 1 | 7h00        |
| Kíp 2 | 9h30        |
| Kíp 3 | 12h30       |
| Kíp 4 | 15h00       |
| Kíp 5 | 17h30       |
