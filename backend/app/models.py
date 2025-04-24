import enum
import uuid
from typing import List, Optional

from database import Base
from sqlalchemy import (
    JSON,
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


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    medical_record_number = Column(String(20), unique=True, index=True)
    diagnosis_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status = Column(Enum(TreatmentStatus), default=TreatmentStatus.ACTIVE_INFECTION)
    case_histories = relationship("SyphilisCaseHistory", back_populates="patient")


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)


# New consolidated model that merges SyphilisCase, Treatment, and FollowUpTest
class SyphilisCaseHistory(Base):
    __tablename__ = "syphilis_case_histories"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("public.patients.id"), nullable=False, index=True)
    status = Column(
        Enum(TreatmentStatus), default=TreatmentStatus.ACTIVE_INFECTION, index=True
    ) 
    titer_result = Column(String(100), index=True)
    diagnosis_date = Column(Date)
    # Treatment information stored as JSON
    treatments = Column(
        JSON, nullable=True
    )  # Will store an array of treatments with medication and date

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="case_histories")
