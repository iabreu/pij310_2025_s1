import enum
import uuid

from database import Base
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class SyphilisStage(enum.Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    LATENT_RECENT = "latent_recent"
    LATENT_LATE = "latent_late"
    TERTIARY = "tertiary"
    UNKNOWN = "Unknown"


class TreatmentStatus(enum.Enum):
    ACTIVE_INFECTION = "Active Infection"
    UNDER_TREATMENT = "Under Treatment"
    TREATMENT_COMPLETE = "Treatment Complete"
    MONITORING_CURE = "Monitoring (Post-Treatment/Cure)"
    CURED = "Cured"
    TREATMENT_FAILURE = "Treatment Failure"
    REINFECTION = "Reinfection"
    UNKNOWN = "Unknown"


class TestResult(enum.Enum):
    REACTIVE = "reactive"
    NON_REACTIVE = "non_reactive"
    INCONCLUSIVE = "Inconclusive"


class SyphilisCase(Base):
    __tablename__ = "syphilis_cases"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("public.patients.id"))
    diagnosis_date = Column(Date)
    stage = Column(Enum(SyphilisStage))
    initial_title = Column(String(10))
    treatment_status = Column(
        Enum(TreatmentStatus), default=TreatmentStatus.UNDER_TREATMENT
    )
    notes = Column(Text)

    patient = relationship("Patient", back_populates="syphilis_cases")
    treatments = relationship("Treatment", back_populates="syphilis_case")
    follow_up_tests = relationship("FollowUpTest", back_populates="syphilis_case")


class Treatment(Base):
    __tablename__ = "treatments"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    syphilis_case_id = Column(Integer, ForeignKey("public.syphilis_cases.id"))
    medication = Column(String(100))
    dosage = Column(String(50))
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    syphilis_case = relationship("SyphilisCase", back_populates="treatments")


class FollowUpTest(Base):
    __tablename__ = "follow_up_tests"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("public.patients.id"), nullable=False)
    syphilis_case_id = Column(Integer, ForeignKey("public.syphilis_cases.id"))
    test_date = Column(Date)
    test_type = Column(String(50))
    result = Column(Enum(TestResult))
    title = Column(String(10))
    notes = Column(Text)

    patient = relationship("Patient", back_populates="follow_up_tests")
    syphilis_case = relationship("SyphilisCase", back_populates="follow_up_tests")


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    medical_record_number = Column(String(20), unique=True, index=True)
    name = Column(String(100))
    date_of_birth = Column(Date)
    diagnosis_date = Column(Date)
    taxpayer_number = Column(String(14), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    syphilis_cases = relationship("SyphilisCase", back_populates="patient")
    follow_up_tests = relationship("FollowUpTest", back_populates="patient")


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
