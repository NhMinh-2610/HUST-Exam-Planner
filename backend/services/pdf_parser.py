import pdfplumber
import pandas as pd
from typing import List, Dict, Any
from io import BytesIO

SHIFT_TIME_MAP = {
    "Kíp 1": "7h00",
    "Kíp 2": "9h30",
    "Kíp 3": "12h30",
    "Kíp 4": "15h00",
    "Kíp 5": "17h30"
}

def clean_text(text):
    if not isinstance(text, str):
        return ""
    return text.replace('\n', ' ').strip()

def parse_pdf_schedule(file_content: bytes) -> List[Dict[str, Any]]:
    parsed_data = []
    
    # Define expected columns to map from index to meaning.
    # Note: Actual PDF might have different column indices, so we'll try to find headers first.
    # We will search for standard headers
    
    with pdfplumber.open(BytesIO(file_content)) as pdf:
        header_map = {}
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                
                # Check each row to find header or process data
                for row_idx, row in enumerate(table):
                    cleaned_row = [clean_text(cell) for cell in row]
                    
                    # Try to detect header
                    if "Mã lớp" in cleaned_row and "Tên học phần" in cleaned_row:
                        header_map = {}
                        for col_idx, col_name in enumerate(cleaned_row):
                            col_name_lower = col_name.lower()
                            if "mã lớp" in col_name_lower and "thi" not in col_name_lower:
                                header_map['classCode'] = col_idx
                            elif "mã học phần" in col_name_lower:
                                header_map['courseCode'] = col_idx
                            elif "tên học phần" in col_name_lower:
                                header_map['courseName'] = col_idx
                            elif "nhóm" in col_name_lower:
                                header_map['group'] = col_idx
                            elif "thứ" in col_name_lower:
                                header_map['dayOfWeek'] = col_idx
                            elif "ngày thi" in col_name_lower:
                                header_map['examDate'] = col_idx
                            elif "kíp thi" in col_name_lower or "kíp" in col_name_lower:
                                header_map['examShift'] = col_idx
                            elif "phòng thi" in col_name_lower or "phòng" in col_name_lower:
                                header_map['room'] = col_idx
                            elif "mã lớp thi" in col_name_lower:
                                header_map['examClassCode'] = col_idx
                        continue
                    
                    # If we have a header_map, process the row
                    if header_map and len(cleaned_row) > max(header_map.values(), default=-1):
                        class_code = cleaned_row[header_map.get('classCode', -1)] if 'classCode' in header_map else ""
                        
                        # Only process valid rows where class_code is a number or non-empty valid string
                        if not class_code or len(class_code) < 4 or not class_code.isalnum() or "LỊCH THI" in class_code.upper():
                            continue
                            
                        shift = cleaned_row[header_map.get('examShift', -1)] if 'examShift' in header_map else ""
                        # Normalize shift
                        if shift == "1": shift = "Kíp 1"
                        if shift == "2": shift = "Kíp 2"
                        if shift == "3": shift = "Kíp 3"
                        if shift == "4": shift = "Kíp 4"
                        if shift == "5": shift = "Kíp 5"
                            
                        exam_time = SHIFT_TIME_MAP.get(shift, "")

                        item = {
                            "classCode": class_code,
                            "courseCode": cleaned_row[header_map.get('courseCode', -1)] if 'courseCode' in header_map else "",
                            "courseName": cleaned_row[header_map.get('courseName', -1)] if 'courseName' in header_map else "",
                            "group": cleaned_row[header_map.get('group', -1)] if 'group' in header_map else "",
                            "dayOfWeek": cleaned_row[header_map.get('dayOfWeek', -1)] if 'dayOfWeek' in header_map else "",
                            "examDate": cleaned_row[header_map.get('examDate', -1)] if 'examDate' in header_map else "",
                            "examShift": shift,
                            "examTime": exam_time,
                            "room": cleaned_row[header_map.get('room', -1)] if 'room' in header_map else "",
                            "examClassCode": cleaned_row[header_map.get('examClassCode', -1)] if 'examClassCode' in header_map else "",
                        }
                        
                        # Filter out empty or mostly empty rows
                        if item["classCode"] and item["courseName"] and item["examDate"]:
                            parsed_data.append(item)
                            
    # Fallback heuristic if headers are not detected (hardcoded indices)
    if not parsed_data:
        with pdfplumber.open(BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table:
                        continue
                    for row in table:
                        cleaned_row = [clean_text(cell) for cell in row]
                        if len(cleaned_row) >= 14: # Expected full table
                            class_code = cleaned_row[1]
                            if not class_code or len(class_code) < 4 or not class_code.isalnum() or "LỊCH THI" in class_code.upper() or "Mã lớp" in class_code:
                                continue
                                
                            shift = cleaned_row[10]
                            # Normalize shift
                            if shift == "1": shift = "Kíp 1"
                            elif shift == "2": shift = "Kíp 2"
                            elif shift == "3": shift = "Kíp 3"
                            elif shift == "4": shift = "Kíp 4"
                            elif shift == "5": shift = "Kíp 5"
                            elif not shift.startswith("Kíp"):
                                shift = f"Kíp {shift}" if shift.isdigit() else shift
                                
                            exam_time = SHIFT_TIME_MAP.get(shift, "")

                            item = {
                                "classCode": class_code,
                                "courseCode": cleaned_row[2],
                                "courseName": cleaned_row[3],
                                "group": cleaned_row[5],
                                "dayOfWeek": cleaned_row[8],
                                "examDate": cleaned_row[9],
                                "examShift": shift,
                                "examTime": exam_time,
                                "room": cleaned_row[12],
                                "examClassCode": cleaned_row[13],
                            }
                            if item["classCode"] and item["courseName"] and item["examDate"]:
                                parsed_data.append(item)

    return parsed_data
