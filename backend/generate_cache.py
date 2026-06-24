"""
Script tạo file default.json từ các file PDF trong thư mục data/.
Chạy script này mỗi khi thêm/xóa/cập nhật file PDF mới.

Cách dùng:
    python generate_cache.py
"""

import os
import sys
import json
import time

# Thêm thư mục hiện tại vào path để import services
sys.path.insert(0, os.path.dirname(__file__))

from services.pdf_parser import parse_pdf_schedule


def main():
    # Fix Unicode output trên Windows console
    sys.stdout.reconfigure(encoding="utf-8")

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    json_path = os.path.join(data_dir, "default.json")

    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

    pdf_files = sorted([f for f in os.listdir(data_dir) if f.endswith(".pdf")])

    if not pdf_files:
        print("❌ Không tìm thấy file PDF nào trong thư mục data/")
        sys.exit(1)

    print(f"📂 Tìm thấy {len(pdf_files)} file PDF:")
    for f in pdf_files:
        size_kb = os.path.getsize(os.path.join(data_dir, f)) / 1024
        print(f"   - {f} ({size_kb:.0f} KB)")

    print()

    all_parsed_data = []
    start_total = time.time()

    for pdf_file in pdf_files:
        pdf_path = os.path.join(data_dir, pdf_file)
        print(f"⏳ Đang parse: {pdf_file} ...", end=" ", flush=True)

        start = time.time()
        try:
            with open(pdf_path, "rb") as f:
                content = f.read()
            parsed_data = parse_pdf_schedule(content)
            elapsed = time.time() - start

            if parsed_data:
                all_parsed_data.extend(parsed_data)
                print(f"✅ {len(parsed_data)} dòng ({elapsed:.1f}s)")
            else:
                print(f"⚠️ Không trích xuất được dữ liệu ({elapsed:.1f}s)")
        except Exception as e:
            print(f"❌ Lỗi: {e}")

    print()

    if not all_parsed_data:
        print("❌ Không có dữ liệu nào được trích xuất từ tất cả các file PDF.")
        sys.exit(1)

    class_codes = sorted(set(item["classCode"] for item in all_parsed_data))

    response_data = {
        "message": "Tải file mặc định thành công",
        "totalRows": len(all_parsed_data),
        "classCodes": class_codes,
        "data": all_parsed_data,
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(response_data, f, ensure_ascii=False)

    elapsed_total = time.time() - start_total
    size_mb = os.path.getsize(json_path) / (1024 * 1024)

    print(f"✅ Tạo thành công: data/default.json")
    print(f"   - Tổng số dòng: {len(all_parsed_data)}")
    print(f"   - Số mã lớp: {len(class_codes)}")
    print(f"   - Kích thước file: {size_mb:.2f} MB")
    print(f"   - Thời gian: {elapsed_total:.1f}s")


if __name__ == "__main__":
    main()
