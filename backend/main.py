from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.pdf_parser import parse_pdf_schedule
from schemas.schedule_schema import UploadResponse

app = FastAPI(title="HUST Exam Schedule Generator")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/upload", response_model=UploadResponse)
async def upload_pdf(files: List[UploadFile] = File(...)):
    all_parsed_data = []

    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Định dạng không hợp lệ: {file.filename}. Chỉ chấp nhận file PDF.",
            )

        try:
            content = await file.read()
            parsed_data = parse_pdf_schedule(content)
            if parsed_data:
                all_parsed_data.extend(parsed_data)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi xử lý file {file.filename}: {str(e)}",
            )

    if not all_parsed_data:
        raise HTTPException(
            status_code=400,
            detail="Không trích xuất được dữ liệu từ file PDF. Vui lòng kiểm tra lại định dạng.",
        )

    class_codes = sorted(set(item["classCode"] for item in all_parsed_data))

    return UploadResponse(
        message="Xử lý thành công",
        totalRows=len(all_parsed_data),
        classCodes=class_codes,
        data=all_parsed_data,
    )


@app.get("/api/default-schedule", response_model=UploadResponse)
async def get_default_schedule():
    import os, json
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    json_path = os.path.join(data_dir, "default.json")
    
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        
    pdf_files = [f for f in os.listdir(data_dir) if f.endswith(".pdf")]

    if not pdf_files and not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Không tìm thấy file mặc định.")

    # Luôn dùng cache JSON nếu có để tránh quá tải CPU trên Render
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass # Nếu lỗi đọc cache thì sẽ parse lại bên dưới

    try:
        all_parsed_data = []
        for pdf_file in pdf_files:
            pdf_path = os.path.join(data_dir, pdf_file)
            with open(pdf_path, "rb") as f:
                content = f.read()
            
            parsed_data = parse_pdf_schedule(content)
            if parsed_data:
                all_parsed_data.extend(parsed_data)
                
        if not all_parsed_data:
            raise HTTPException(status_code=400, detail="Không trích xuất được dữ liệu từ file mặc định.")
            
        class_codes = sorted(set(item["classCode"] for item in all_parsed_data))
        
        response_data = {
            "message": "Tải file mặc định thành công",
            "totalRows": len(all_parsed_data),
            "classCodes": class_codes,
            "data": all_parsed_data,
        }

        # Lưu lại cache để lần sau mở là có liền
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(response_data, f, ensure_ascii=False)
        except Exception:
            pass

        return response_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi xử lý file mặc định: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
