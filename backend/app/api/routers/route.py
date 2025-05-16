import logging
from datetime import date, datetime
from typing import List, Optional

import schemas
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models import Patient, SyphilisCaseHistory
from sqlalchemy import Null, and_, case, desc, func, text
from sqlalchemy.dialects.postgresql import ARRAY, aggregate_order_by
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, aliased, joinedload

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import enum


class TreatmentStatus(enum.Enum):
    ACTIVE_INFECTION = "Infecção Ativa"
    UNDER_TREATMENT = "Em Tratamento" 
    MONITORING_CURE = "Curado"
    CURED = "Curado"
    REINFECTION = "Reinfecção"
    UNKNOWN = "Desconhecido"

def syphilis_status_from_titer(current_titer):
    """
    Returns treatment status based on current titer and optional previous titer.
    current_titer: float or string (e.g., '1:32', '1:4', etc.)
    previous_titer: float or string (optional) - previous measurement
    Returns: TreatmentStatus enum member
    """
    # Convert current titer to numeric
    try:
        if isinstance(current_titer, str):
            if ':' in current_titer:
                try:
                    current_val = float(current_titer.split(':')[1])
                except Exception:
                    return None
            else:
                try:
                    current_val = float(current_titer)
                except Exception:
                    return None
        else:
            current_val = float(current_titer)
    except Exception:
        return None
    
 
    
    # Interpret based on current titer
    if current_val >= 32:
        return TreatmentStatus.ACTIVE_INFECTION
    elif 8 <= current_val < 32:
        return TreatmentStatus.UNDER_TREATMENT
    elif 1 <= current_val < 8:
        return TreatmentStatus.MONITORING_CURE
    elif current_val < 1:
        return TreatmentStatus.CURED
    else:
        return TreatmentStatus.UNKNOWN

# Routers
patient_router = APIRouter(prefix="/patients", tags=["patients"])
case_history_router = APIRouter(prefix="/syphilis-case-history", tags=["syphilis case history"])


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

        # Create new patient (status will use model default)
        db_patient = Patient(
            medical_record_number=patient.medical_record_number,
            diagnosis_date=patient.diagnosis_date,
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
    Get all patients, calculating status from the latest titer result.
    """
    try:
        # Subquery to get the latest titer for each patient based on diagnosis_date/created_at
        latest_titer_subquery = (
            db.query(
                SyphilisCaseHistory.patient_id,
                SyphilisCaseHistory.titer_result,
                func.row_number().over(
                    partition_by=SyphilisCaseHistory.patient_id,
                    order_by=[SyphilisCaseHistory.diagnosis_date.desc(), SyphilisCaseHistory.created_at.desc()]
                ).label("rn")
            )
            .subquery()
        )

        # Main query joining Patient with aggregated history data and latest titer
        query = (
            db.query(
                Patient.id,
                Patient.medical_record_number,
                func.min(SyphilisCaseHistory.diagnosis_date).label("first_exam_date"),
                func.max(SyphilisCaseHistory.diagnosis_date).label("last_exam_date"),
                # Use latest titer from subquery
                latest_titer_subquery.c.titer_result.label("latest_titer") 
            )
            .outerjoin(SyphilisCaseHistory, Patient.id == SyphilisCaseHistory.patient_id)
            # Join with the subquery to get only the latest titer (rn=1)
            .outerjoin(latest_titer_subquery, 
                       and_(Patient.id == latest_titer_subquery.c.patient_id, 
                            latest_titer_subquery.c.rn == 1)
                      )
            .group_by(Patient.id, Patient.medical_record_number, latest_titer_subquery.c.titer_result)
        )

        if search:
            # Apply search filter on the main query
            query = query.filter(Patient.medical_record_number.ilike(f"%{search}%"))

        results = query.offset(skip).limit(limit).all()

        # Process results and calculate status and last_case_date
        response_data = []
        for result in results:
            calculated_status = syphilis_status_from_titer(result.latest_titer)
            last_exam_date = result.last_exam_date

            # Determine last_case_date based on status
            last_case_date = None
            if calculated_status != TreatmentStatus.CURED:
                last_case_date = last_exam_date

            response_data.append({
                "id": result.id,
                "medical_record_number": result.medical_record_number,
                "first_exam_date": result.first_exam_date,
                "last_exam_date": last_exam_date,
                "last_case_date": last_case_date, # Use determined value
                "status": calculated_status,
                "latest_titer": result.latest_titer,
            })

        return response_data
    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving patients. Please try again later.",
        )


@patient_router.get("/{patient_id}", response_model=schemas.PatientDetailResponse)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    try:
        # Query patient and eagerly load case_histories relationship
        db_patient = (
            db.query(Patient)
            .options(joinedload(Patient.case_histories))
            .filter(Patient.id == patient_id)
            .first()
        )

        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        # Find the latest history entry based on date
        latest_history = None
        if db_patient.case_histories:
            latest_history = max(
                db_patient.case_histories, 
                key=lambda h: (h.diagnosis_date or date.min, h.created_at or datetime.min)
            )

        # Calculate overall patient status from the latest titer
        latest_titer = latest_history.titer_result if latest_history else None
        patient_status = syphilis_status_from_titer(latest_titer)

        # Manually construct the response including calculated statuses
        response = {
            "id": db_patient.id,
            "medical_record_number": db_patient.medical_record_number,
            "diagnosis_date": db_patient.diagnosis_date,
            "status": patient_status, # Use calculated status for the patient
            "syphilis_case_history": []
        }

        # Process each history entry to add calculated status
        for history in db_patient.case_histories:
            history_status = syphilis_status_from_titer(history.titer_result)
            # Convert history object to dict and add calculated status
            # This assumes SyphilisCaseHistory schema matches the model attributes
            history_dict = schemas.SyphilisCaseHistory.from_orm(history).dict()
            history_dict['status'] = history_status
            response["syphilis_case_history"].append(history_dict)
            
        # Sort histories by date descending for consistency
        response["syphilis_case_history"].sort(key=lambda x: (x['diagnosis_date'] or date.min, x['created_at'] or datetime.min), reverse=True)

        return response
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
    patient_id: int, patient_update: schemas.PatientUpdate, db: Session = Depends(get_db)
):
    try:
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        # Check if updating to a MRN that already exists for another patient
        if patient_update.medical_record_number is not None and patient_update.medical_record_number != db_patient.medical_record_number:
            existing_patient = (
                db.query(Patient)
                .filter(
                    Patient.medical_record_number == patient_update.medical_record_number,
                    Patient.id != patient_id,
                )
                .first()
            )
            if existing_patient:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Patient with medical record number {patient_update.medical_record_number} already exists",
                )
            db_patient.medical_record_number = patient_update.medical_record_number

        # Update patient attributes only if they are provided
        if patient_update.diagnosis_date is not None:
            db_patient.diagnosis_date = patient_update.diagnosis_date

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


@patient_router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    Delete a patient and all their related case histories.
    """
    try:
        # First check if patient exists
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Delete the patient (cascade delete will handle related records)
        db.delete(db_patient)
        db.commit()
        
        return None  # 204 No Content response
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when deleting patient {patient_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when deleting patient. Please try again later."
        )


# SyphilisCaseHistory endpoints
@case_history_router.get("/{history_id}", response_model=schemas.SyphilisCaseHistory)
def get_syphilis_case_history(history_id: int, db: Session = Depends(get_db)):
    """
    Get a specific syphilis case history by its ID, calculating status from its titer.
    """
    try:
        # Get case history by ID
        db_history = (
            db.query(SyphilisCaseHistory)
            .filter(SyphilisCaseHistory.id == history_id)
            .first()
        )

        if db_history is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case history not found"
            )

        # Calculate status based on this history's titer
        calculated_status = syphilis_status_from_titer(db_history.titer_result)

        # Manually construct response
        response = schemas.SyphilisCaseHistory.from_orm(db_history).dict()
        response['status'] = calculated_status

        return response

    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving case history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving case history.",
        )


@case_history_router.get("/patient/{patient_id}", response_model=List[schemas.SyphilisCaseHistory])
def get_patient_case_histories(patient_id: int, db: Session = Depends(get_db)):
    """
    Get all syphilis case histories for a specific patient, calculating status for each.
    """
    try:
        # Verify patient exists
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not db_patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        # Get all case histories for this patient
        histories = (
            db.query(SyphilisCaseHistory)
            .filter(SyphilisCaseHistory.patient_id == patient_id)
            # Order by date descending
            .order_by(SyphilisCaseHistory.diagnosis_date.desc(), SyphilisCaseHistory.created_at.desc())
            .all()
        )

        # Process results and calculate status for each
        response_data = []
        for history in histories:
            calculated_status = syphilis_status_from_titer(history.titer_result)
            history_dict = schemas.SyphilisCaseHistory.from_orm(history).dict()
            history_dict['status'] = calculated_status
            response_data.append(history_dict)

        return response_data

    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving case histories: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving case histories.",
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
            
        # Create new history record (status will use model default)
        db_history = SyphilisCaseHistory(
            patient_id=history.patient_id,
            diagnosis_date=history.diagnosis_date,
            treatments=history.treatments,
            notes=history.notes,
            titer_result=history.titer_result,
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
    history_id: int, history_update: schemas.SyphilisCaseHistoryUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing syphilis case history.
    Allows partial updates.
    """
    try:
        db_history = db.query(SyphilisCaseHistory).filter(SyphilisCaseHistory.id == history_id).first()
        if not db_history:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Case history not found"
            )
            
        # Update fields only if they are provided in the request
        if history_update.patient_id is not None:
            # Verify the new patient_id exists if it's being changed
            if history_update.patient_id != db_history.patient_id:
                 db_patient = db.query(Patient).filter(Patient.id == history_update.patient_id).first()
                 if not db_patient:
                     raise HTTPException(
                         status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient with ID {history_update.patient_id} not found"
                     )
            db_history.patient_id = history_update.patient_id
        if history_update.diagnosis_date is not None:
            db_history.diagnosis_date = history_update.diagnosis_date
        if history_update.titer_result is not None:
            db_history.titer_result = history_update.titer_result
        if history_update.treatments is not None:
            db_history.treatments = history_update.treatments
        if history_update.notes is not None:
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
