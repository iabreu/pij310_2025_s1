import logging
from datetime import date
from typing import List, Optional

import schemas
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models import Patient, SyphilisCaseHistory, TreatmentStatus
from sqlalchemy import and_, case, desc, func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, aliased

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Routers
patient_router = APIRouter(prefix="/patients", tags=["patients"])
case_history_router = APIRouter(prefix="/case-history", tags=["case history"])


# Patient endpoints
@patient_router.post(
    "/", response_model=schemas.Patient, status_code=status.HTTP_201_CREATED
)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    try:
        # Check if patient with same MRN already exists
        db_patient = (
            db.query(Patient)
            .filter(Patient.medical_record_number == patient.medical_record_number)
            .first()
        )
        if db_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Patient with medical record number {patient.medical_record_number} already exists",
            )

        # Create new patient
        db_patient = Patient(
            medical_record_number=patient.medical_record_number,
            diagnosis_date=patient.diagnosis_date,
            status=patient.status,
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error when creating patient: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database integrity error when creating patient: {str(e)}",
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when creating patient: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred when creating patient. Error: {str(e)}",
        )


@patient_router.get("/", response_model=List[schemas.PatientListResponse])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get all patients with the required fields:
    medical_record_number, first_exam_date, last_exam_date, last_case_date, status
    """
    try:
        # Create an alias for SyphilisCaseHistory to use with active_infection filter
        ActiveCaseHistory = aliased(SyphilisCaseHistory)

        # Build query with all required fields
        query = (
            db.query(
                Patient.id,
                Patient.medical_record_number,
                func.min(SyphilisCaseHistory.diagnosis_date).label("first_exam_date"),
                func.max(SyphilisCaseHistory.diagnosis_date).label("last_exam_date"),
                func.max(
                    case(
                        (ActiveCaseHistory.status == TreatmentStatus.ACTIVE_INFECTION, ActiveCaseHistory.diagnosis_date),
                        else_=None
                    )
                ).label("last_case_date"),
                Patient.status
            )
            .outerjoin(SyphilisCaseHistory, Patient.id == SyphilisCaseHistory.patient_id)
            .outerjoin(
                ActiveCaseHistory, 
                and_(
                    Patient.id == ActiveCaseHistory.patient_id,
                    ActiveCaseHistory.status == TreatmentStatus.ACTIVE_INFECTION
                )
            )
            .group_by(Patient.id, Patient.medical_record_number, Patient.status)
        )

        if search:
            query = query.filter(Patient.medical_record_number.ilike(f"%{search}%"))

        results = query.offset(skip).limit(limit).all()
        
        # Convert the SQLAlchemy Row objects to dictionaries that match the PatientListResponse schema
        response_data = []
        for result in results:
            response_data.append({
                "id": result.id,
                "medical_record_number": result.medical_record_number,
                "first_exam_date": result.first_exam_date,
                "last_exam_date": result.last_exam_date,
                "last_case_date": result.last_case_date,
                "status": result.status
            })
            
        return response_data
    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving patients. Please try again later.",
        )


@patient_router.get("/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    try:
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
        return db_patient
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid patient ID format: {str(e)}",
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving patient {patient_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving patient. Please try again later.",
        )


@patient_router.put("/{patient_id}", response_model=schemas.Patient)
def update_patient(
    patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(get_db)
):
    try:
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        # Check if updating to a MRN that already exists for another patient
        existing_patient = (
            db.query(Patient)
            .filter(
                Patient.medical_record_number == patient.medical_record_number,
                Patient.id != patient_id,
            )
            .first()
        )

        if existing_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Patient with medical record number {patient.medical_record_number} already exists",
            )

        # Update patient attributes
        db_patient.medical_record_number = patient.medical_record_number
        db_patient.diagnosis_date = patient.diagnosis_date
        db_patient.status = patient.status

        db.commit()
        db.refresh(db_patient)
        return db_patient
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error when updating patient {patient_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error when updating patient",
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when updating patient {patient_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when updating patient. Please try again later.",
        )


# SyphilisCaseHistory endpoints
@case_history_router.get("/{patient_id}", response_model=schemas.SyphilisCaseHistory)
def get_patient_case_history(patient_id: int, db: Session = Depends(get_db)):
    """
    Get the comprehensive syphilis case history for a patient.
    If a history record doesn't exist, create one.
    """
    try:
        # Try to get existing case history record
        db_history = (
            db.query(SyphilisCaseHistory)
            .filter(SyphilisCaseHistory.patient_id == patient_id)
            .first()
        )
        
        # If history exists, return it
        if db_history:
            return db_history
            
        # If no history record exists, we need to create one
        # First, verify patient exists
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not db_patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
            
        # Create a new SyphilisCaseHistory record with basic info from patient
        new_history = SyphilisCaseHistory(
            patient_id=patient_id,
            diagnosis_date=db_patient.diagnosis_date or date.today(),
            status=db_patient.status,
            treatments=[],
            notes="",
        )
        
        db.add(new_history)
        db.commit()
        db.refresh(new_history)
        
        return new_history
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when retrieving case history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving case history.",
        )


@case_history_router.post(
    "/", response_model=schemas.SyphilisCaseHistory, status_code=status.HTTP_201_CREATED
)
def create_case_history(
    history: schemas.SyphilisCaseHistoryCreate, db: Session = Depends(get_db)
):
    """
    Create a new syphilis case history for a patient.
    """
    try:
        # Verify patient exists
        db_patient = db.query(Patient).filter(Patient.id == history.patient_id).first()
        if not db_patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
            
        # Create new history record
        db_history = SyphilisCaseHistory(
            patient_id=history.patient_id,
            diagnosis_date=history.diagnosis_date,
            status=history.status,
            treatments=history.treatments,
            notes=history.notes,
        )
        
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        
        return db_history
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when creating case history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when creating case history.",
        )


@case_history_router.put("/{history_id}", response_model=schemas.SyphilisCaseHistory)
def update_case_history(
    history_id: int, history_update: schemas.SyphilisCaseHistoryCreate, db: Session = Depends(get_db)
):
    """
    Update an existing syphilis case history.
    """
    try:
        db_history = db.query(SyphilisCaseHistory).filter(SyphilisCaseHistory.id == history_id).first()
        if not db_history:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Case history not found"
            )
            
        # Update fields
        db_history.diagnosis_date = history_update.diagnosis_date
        db_history.status = history_update.status
        db_history.treatments = history_update.treatments
        db_history.notes = history_update.notes
        
        db.commit()
        db.refresh(db_history)
        
        return db_history
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when updating case history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when updating case history.",
        )
