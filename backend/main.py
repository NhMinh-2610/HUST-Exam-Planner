from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.pdf_parser import parse_pdf_schedule
from schemas.schedule_schema import UploadResponse, ExamItem

app = FastAPI(title="HUST Exam Schedule Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import List

@app.post("/api/upload", response_model=UploadResponse)
async def upload_pdf(files: List[UploadFile] = File(...)):
    all_parsed_data = []
    
    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"Invalid file type for {file.filename}. Please upload PDFs only.")
        
        try:
            content = await file.read()
            parsed_data = parse_pdf_schedule(content)
            if parsed_data:
                all_parsed_data.extend(parsed_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while parsing {file.filename}: {str(e)}")

    if not all_parsed_data:
        raise HTTPException(status_code=400, detail="Could not parse any data from the provided PDFs. Please check the file formats.")
        
    # Extract unique class codes
    class_codes = list(set(item["classCode"] for item in all_parsed_data))
    class_codes.sort()
    
    return UploadResponse(
        message="Parse file(s) thành công",
        totalRows=len(all_parsed_data),
        classCodes=class_codes,
        data=all_parsed_data
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
