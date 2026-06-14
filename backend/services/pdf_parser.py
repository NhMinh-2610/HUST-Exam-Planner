import pdfplumber
from typing import List, Dict, Any
from io import BytesIO

SHIFT_TIME_MAP = {
    "Kíp 1": "7h00",
    "Kíp 2": "9h30",
    "Kíp 3": "12h30",
    "Kíp 4": "15h00",
    "Kíp 5": "17h30",
}

HEADER_COLUMN_MAPPING = {
    "classCode":     lambda col: "mã lớp" in col and "thi" not in col,
    "courseCode":    lambda col: "mã học phần" in col,
    "courseName":   lambda col: "tên học phần" in col,
    "group":        lambda col: "nhóm" in col,
    "dayOfWeek":    lambda col: col == "thứ" or col.startswith("thứ "),
    "examDate":     lambda col: "ngày thi" in col,
    "examShift":    lambda col: "kíp" in col,
    "room":         lambda col: "phòng" in col,
    "examClassCode": lambda col: "mã lớp thi" in col,
}

FALLBACK_COLUMN_INDICES = {
    "classCode": 1,
    "courseCode": 2,
    "courseName": 3,
    "group": 5,
    "dayOfWeek": 8,
    "examDate": 9,
    "examShift": 10,
    "room": 12,
    "examClassCode": 13,
}


def _clean_text(text) -> str:
    if not isinstance(text, str):
        return ""
    return text.replace("\n", " ").strip()


def _normalize_shift(raw: str) -> str:
    if raw in ("1", "2", "3", "4", "5"):
        return f"Kíp {raw}"
    if raw.isdigit() and not raw.startswith("Kíp"):
        return f"Kíp {raw}"
    return raw


def _is_valid_class_code(code: str) -> bool:
    if not code or len(code) < 4:
        return False
    if not code.isalnum():
        return False
    if "LỊCH THI" in code.upper() or "Mã lớp" in code:
        return False
    return True


def _build_header_map(row: List[str]) -> Dict[str, int]:
    header_map = {}
    for col_idx, col_name in enumerate(row):
        col_lower = col_name.lower()
        for field, matcher in HEADER_COLUMN_MAPPING.items():
            if matcher(col_lower) and field not in header_map:
                header_map[field] = col_idx
    return header_map


def _extract_field(row: List[str], header_map: Dict[str, int], field: str) -> str:
    if field in header_map:
        idx = header_map[field]
        if idx < len(row):
            return row[idx]
    return ""


def _row_to_item(row: List[str], header_map: Dict[str, int]) -> Dict[str, Any] | None:
    class_code = _extract_field(row, header_map, "classCode")
    if not _is_valid_class_code(class_code):
        return None

    shift = _normalize_shift(_extract_field(row, header_map, "examShift"))
    exam_time = SHIFT_TIME_MAP.get(shift, "")
    course_name = _extract_field(row, header_map, "courseName")
    exam_date = _extract_field(row, header_map, "examDate")

    if not course_name or not exam_date:
        return None

    return {
        "classCode": class_code,
        "courseCode": _extract_field(row, header_map, "courseCode"),
        "courseName": course_name,
        "group": _extract_field(row, header_map, "group"),
        "dayOfWeek": _extract_field(row, header_map, "dayOfWeek"),
        "examDate": exam_date,
        "examShift": shift,
        "examTime": exam_time,
        "room": _extract_field(row, header_map, "room"),
        "examClassCode": _extract_field(row, header_map, "examClassCode"),
    }


def parse_pdf_schedule(file_content: bytes) -> List[Dict[str, Any]]:
    parsed_data = []

    with pdfplumber.open(BytesIO(file_content)) as pdf:
        header_map = {}

        for page in pdf.pages:
            for table in page.extract_tables():
                if not table:
                    continue

                for row in table:
                    cleaned = [_clean_text(cell) for cell in row]

                    if "Mã lớp" in cleaned and "Tên học phần" in cleaned:
                        header_map = _build_header_map(cleaned)
                        continue

                    if not header_map or len(cleaned) <= max(header_map.values(), default=-1):
                        continue

                    item = _row_to_item(cleaned, header_map)
                    if item:
                        parsed_data.append(item)

    if not parsed_data:
        parsed_data = _fallback_parse(file_content)

    return parsed_data


def _fallback_parse(file_content: bytes) -> List[Dict[str, Any]]:
    parsed_data = []

    with pdfplumber.open(BytesIO(file_content)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                if not table:
                    continue

                for row in table:
                    cleaned = [_clean_text(cell) for cell in row]
                    if len(cleaned) < 14:
                        continue

                    item = _row_to_item(cleaned, FALLBACK_COLUMN_INDICES)
                    if item:
                        parsed_data.append(item)

    return parsed_data
