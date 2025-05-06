import re  # Import re for regex
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator  # Import validator


class TunedModel(BaseModel):
    class Config:
        from_attributes = True


class PatientBase(TunedModel):
    medical_record_number: str
    diagnosis_date: Optional[date] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(TunedModel):
    medical_record_number: Optional[str] = None
    diagnosis_date: Optional[date] = None


class Patient(PatientBase):
    id: int
    status: Optional[str] = None


class PatientListResponse(BaseModel):
    id: int
    medical_record_number: str
    first_exam_date: Optional[date] = None
    last_exam_date: Optional[date] = None
    last_case_date: Optional[date] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class SyphilisCaseHistoryBase(TunedModel):
    patient_id: int
    diagnosis_date: date
    titer_result: Optional[str] = None
    treatments: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class SyphilisCaseHistoryCreate(SyphilisCaseHistoryBase):
    @validator('titer_result')
    def validate_titer_result(cls, v):
        if v is None:
            return v

        titer_pattern = r"^1:(2|4|8|16|32|64|128|256|512|1024|2048|4096)$"
        allowed_strings = ["Non-reactive", "Reactive"]

        if re.fullmatch(titer_pattern, v) or v in allowed_strings:
            return v
        else:
            raise ValueError(
                'Titer result must be "Non-reactive", "Reactive", or in the format "1:X" where X is a power of 2 (e.g., 1:2, 1:4, 1:8, ..., 1:4096)'
            )


class SyphilisCaseHistoryUpdate(TunedModel):
    patient_id: Optional[int] = None
    diagnosis_date: Optional[date] = None
    titer_result: Optional[str] = None
    treatments: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None

    @validator('titer_result')
    def validate_update_titer_result(cls, v):
        if v is None:
            return v
        titer_pattern = r"^1:(2|4|8|16|32|64|128|256|512|1024|2048|4096)$"
        allowed_strings = ["Non-reactive", "Reactive"]
        if re.fullmatch(titer_pattern, v) or v in allowed_strings:
            return v
        else:
            raise ValueError(
                'Titer result must be "Non-reactive", "Reactive", or in the format "1:X" where X is a power of 2 (e.g., 1:2, 1:4, 1:8, ..., 1:4096)'
            )


class SyphilisCaseHistory(SyphilisCaseHistoryBase):
    id: int
    status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class SyphilisCaseHistoryDetail(SyphilisCaseHistory):
    pass


class PatientDetailResponse(Patient):
    syphilis_case_history: List[SyphilisCaseHistory] = Field(
        default_factory=list, serialization_alias='case_histories'
    )
    
    class Config:
        from_attributes = True
