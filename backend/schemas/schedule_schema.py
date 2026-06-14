from pydantic import BaseModel
from typing import List, Optional

class ExamItem(BaseModel):
    classCode: str
    courseCode: str
    courseName: str
    group: Optional[str] = None
    dayOfWeek: str
    examDate: str
    examShift: str
    examTime: str
    room: str
    examClassCode: str

class UploadResponse(BaseModel):
    message: str
    totalRows: int
    classCodes: List[str]
    data: List[ExamItem]
