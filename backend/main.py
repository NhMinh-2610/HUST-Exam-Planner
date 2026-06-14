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

@app.post("/api/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    try:
        content = await file.read()
        parsed_data = parse_pdf_schedule(content)
        
        if not parsed_data:
            raise HTTPException(status_code=400, detail="Could not parse the PDF. Please check the file format.")
            
        # Extract unique class codes
        class_codes = list(set(item["classCode"] for item in parsed_data))
        class_codes.sort()
        
        return UploadResponse(
            message="Parse file thành công",
            totalRows=len(parsed_data),
            classCodes=class_codes,
            data=parsed_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while parsing the PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
