from datetime import date, datetime
from typing import Any, Dict, List, Optional

from models import TreatmentStatus
from pydantic import BaseModel


class TunedModel(BaseModel):
    class Config:
        orm_mode = True


class PatientBase(TunedModel):
    medical_record_number: str
    diagnosis_date: Optional[date] = None
    status: TreatmentStatus


class PatientCreate(PatientBase):
    pass


class Patient(PatientBase):
    id: int


class PatientListResponse(BaseModel):
    id: int
    medical_record_number: str
    first_exam_date: Optional[date] = None
    last_exam_date: Optional[date] = None
    last_case_date: Optional[date] = None
    status: TreatmentStatus

    class Config:
        orm_mode = True


class SyphilisCaseHistoryBase(TunedModel):
    patient_id: int
    diagnosis_date: date
    status: TreatmentStatus
    treatments: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class SyphilisCaseHistoryCreate(SyphilisCaseHistoryBase):
    pass


class SyphilisCaseHistory(SyphilisCaseHistoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class SyphilisCaseHistoryDetail(SyphilisCaseHistory):
    pass
