from datetime import date, datetime
from typing import List, Optional

from models import SyphilisStage, TestResult, TreatmentStatus
from pydantic import BaseModel, ConfigDict


class TunedModel(BaseModel):
    class Config:
        orm_mode = True


class PatientBase(TunedModel):
    medical_record_number: str
    name: str
    date_of_birth: date
    taxpayer_number: str
    diagnosis_date: Optional[date] = None


class PatientCreate(PatientBase):
    pass


class Patient(PatientBase):
    id: int


class SyphilisCaseBase(TunedModel):
    patient_id: int
    diagnosis_date: date
    stage: SyphilisStage
    initial_title: Optional[str] = None
    treatment_status: TreatmentStatus = TreatmentStatus.ACTIVE_INFECTION
    notes: Optional[str] = None


class SyphilisCaseCreate(SyphilisCaseBase):
    pass


class SyphilisCase(SyphilisCaseBase):
    id: int


class TreatmentBase(TunedModel):
    syphilis_case_id: int
    medication: str
    dosage: str
    created_at: datetime
    notes: Optional[str] = None


class TreatmentCreate(TreatmentBase):
    pass


class Treatment(TreatmentBase):
    id: int


class FollowUpTestBase(TunedModel):
    patient_id: int
    syphilis_case_id: int
    test_date: date
    test_type: str
    result: TestResult
    title: Optional[str] = None
    notes: Optional[str] = None


class FollowUpTestCreate(FollowUpTestBase):
    pass


class FollowUpTest(FollowUpTestBase):
    id: int


class SyphilisCaseDetail(SyphilisCase):
    treatments: List[Treatment] = []
    follow_up_tests: List[FollowUpTest] = []


class PatientDetail(Patient):
    syphilis_cases: List[SyphilisCase] = []
