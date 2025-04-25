from datetime import date, datetime
from typing import Any, Dict, List, Optional

from models import TreatmentStatus
from pydantic import BaseModel, Field


class TunedModel(BaseModel):
    class Config:
        orm_mode = True


class PatientBase(TunedModel):
    medical_record_number: str
    diagnosis_date: Optional[date] = None
    status: Optional[TreatmentStatus] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(TunedModel):
    medical_record_number: Optional[str] = None
    diagnosis_date: Optional[date] = None
    status: Optional[TreatmentStatus] = None


class Patient(PatientBase):
    id: int


class PatientListResponse(BaseModel):
    id: int
    medical_record_number: str
    first_exam_date: Optional[date] = None
    last_exam_date: Optional[date] = None
    last_case_date: Optional[date] = None
    status: Optional[TreatmentStatus] = None

    class Config:
        orm_mode = True


class SyphilisCaseHistoryBase(TunedModel):
    patient_id: int
    diagnosis_date: date
    titer_result: str
    status: TreatmentStatus
    treatments: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class SyphilisCaseHistoryCreate(SyphilisCaseHistoryBase):
    pass


class SyphilisCaseHistoryUpdate(TunedModel):
    patient_id: Optional[int] = None
    diagnosis_date: Optional[date] = None
    titer_result: Optional[str] = None
    status: Optional[TreatmentStatus] = None
    treatments: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class SyphilisCaseHistory(SyphilisCaseHistoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class SyphilisCaseHistoryDetail(SyphilisCaseHistory):
    pass


class PatientDetailResponse(Patient):
    syphilis_case_history: List[SyphilisCaseHistory] = Field(
        default_factory=list, serialization_alias='case_histories'
    )
    
    class Config:
        orm_mode = True
