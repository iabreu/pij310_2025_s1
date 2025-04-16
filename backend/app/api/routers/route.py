import logging
from datetime import date, timedelta
from typing import List, Optional

import schemas
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models import (
    FollowUpTest,
    Patient,
    SyphilisCase,
    SyphilisStage,
    TestResult,
    Treatment,
    TreatmentStatus,
)
from sqlalchemy import and_, desc, func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Routers
patient_router = APIRouter(prefix="/patients", tags=["patients"])
syphilis_case_router = APIRouter(prefix="/cases", tags=["syphilis cases"])
treatment_router = APIRouter(prefix="/treatments", tags=["treatments"])
followup_router = APIRouter(prefix="/followups", tags=["follow-up tests"])


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
            name=patient.name,
            date_of_birth=patient.date_of_birth,
            diagnosis_date=patient.diagnosis_date,
            taxpayer_number=patient.taxpayer_number,
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error when creating patient: {str(e)}")
        if "unique constraint" in str(e).lower():
            if "taxpayer_number" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Patient with taxpayer number {patient.taxpayer_number} already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unique constraint violation when creating patient"
                )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database integrity error when creating patient: {str(e)}"
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when creating patient: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred when creating patient. Error: {str(e)}"
        )


@patient_router.get("/", response_model=List[schemas.Patient])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get all patients with optional search by name or medical record number
    """
    try:
        query = db.query(Patient)

        if search:
            query = query.filter(
                or_(
                    Patient.name.ilike(f"%{search}%"),
                    Patient.medical_record_number.ilike(f"%{search}%"),
                )
            )

        return query.offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving patients. Please try again later."
        )


@patient_router.get("/{patient_id}", response_model=schemas.PatientDetail)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    try:
        db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if db_patient is None:
            db_patient = db.query(Patient).filter(Patient.taxpayer_number == f'{patient_id}').first()
            if not db_patient:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
                )
        return db_patient
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid patient ID format: {str(e)}"
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error when retrieving patient {patient_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when retrieving patient. Please try again later."
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
                and_(
                    Patient.medical_record_number == patient.medical_record_number,
                    Patient.id != patient_id,
                )
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
        db_patient.name = patient.name
        db_patient.date_of_birth = patient.date_of_birth
        db_patient.diagnosis_date = patient.diagnosis_date
        db_patient.taxpayer_number = patient.taxpayer_number

        db.commit()
        db.refresh(db_patient)
        return db_patient
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error when updating patient {patient_id}: {str(e)}")
        if "unique constraint" in str(e).lower():
            if "taxpayer_number" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Patient with taxpayer number {patient.taxpayer_number} already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Another patient with this information already exists"
                )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error when updating patient"
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error when updating patient {patient_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred when updating patient. Please try again later."
        )

# Syphilis case endpoints
@syphilis_case_router.post(
    "/", response_model=schemas.SyphilisCase, status_code=status.HTTP_201_CREATED
)
def create_syphilis_case(
    case: schemas.SyphilisCaseCreate, db: Session = Depends(get_db)
):
    # Verify patient exists
    db_patient = db.query(Patient).filter(Patient.id == case.patient_id).first()
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )

    # Create new syphilis case
    db_case = SyphilisCase(
        patient_id=case.patient_id,
        diagnosis_date=case.diagnosis_date,
        stage=case.stage,
        initial_title=case.initial_title,
        treatment_status=case.treatment_status,
        notes=case.notes,
    )

    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


@syphilis_case_router.get("/", response_model=List[schemas.SyphilisCase])
def read_syphilis_cases(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    status: Optional[TreatmentStatus] = None,
    stage: Optional[SyphilisStage] = None,
    db: Session = Depends(get_db),
):
    """
    Get all syphilis cases with optional filtering
    """
    query = db.query(SyphilisCase)

    if patient_id:
        query = query.filter(SyphilisCase.patient_id == patient_id)

    if status:
        query = query.filter(SyphilisCase.treatment_status == status)

    if stage:
        query = query.filter(SyphilisCase.stage == stage)

    return query.offset(skip).limit(limit).all()


@syphilis_case_router.get("/{case_id}", response_model=schemas.SyphilisCaseDetail)
def read_syphilis_case(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(SyphilisCase).filter(SyphilisCase.id == case_id).first()
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
        )
    return db_case


@syphilis_case_router.put("/{case_id}", response_model=schemas.SyphilisCase)
def update_syphilis_case(
    case_id: int, case: schemas.SyphilisCaseCreate, db: Session = Depends(get_db)
):
    db_case = db.query(SyphilisCase).filter(SyphilisCase.id == case_id).first()
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
        )

    # Verify patient exists
    if case.patient_id != db_case.patient_id:
        db_patient = db.query(Patient).filter(Patient.id == case.patient_id).first()
        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

    # Update case attributes
    db_case.patient_id = case.patient_id
    db_case.diagnosis_date = case.diagnosis_date
    db_case.stage = case.stage
    db_case.initial_title = case.initial_title
    db_case.treatment_status = case.treatment_status
    db_case.notes = case.notes

    db.commit()
    db.refresh(db_case)
    return db_case


@syphilis_case_router.get(
    "/{case_id}/treatments", response_model=List[schemas.Treatment]
)
def read_case_treatments(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(SyphilisCase).filter(SyphilisCase.id == case_id).first()
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
        )
    return db_case.treatments


@syphilis_case_router.get(
    "/{case_id}/followups", response_model=List[schemas.FollowUpTest]
)
def read_case_followups(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(SyphilisCase).filter(SyphilisCase.id == case_id).first()
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
        )
    return db_case.follow_up_tests


# Treatment endpoints
@treatment_router.post(
    "/", response_model=schemas.Treatment, status_code=status.HTTP_201_CREATED
)
def create_treatment(treatment: schemas.TreatmentCreate, db: Session = Depends(get_db)):
    # Verify syphilis case exists
    db_case = (
        db.query(SyphilisCase)
        .filter(SyphilisCase.id == treatment.syphilis_case_id)
        .first()
    )
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
        )

    # Create new treatment
    db_treatment = Treatment(
        syphilis_case_id=treatment.syphilis_case_id,
        medication=treatment.medication,
        dosage=treatment.dosage,
        notes=treatment.notes,
        created_at=treatment.created_at,
    )

    # Update case status to under treatment
    db_case.treatment_status = TreatmentStatus.UNDER_TREATMENT

    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment


@treatment_router.get("/", response_model=List[schemas.Treatment])
def read_treatments(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Treatment)

    if case_id:
        query = query.filter(Treatment.syphilis_case_id == case_id)

    return query.offset(skip).limit(limit).all()


@treatment_router.get("/{treatment_id}", response_model=schemas.Treatment)
def read_treatment(treatment_id: int, db: Session = Depends(get_db)):
    db_treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if db_treatment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Treatment not found"
        )
    return db_treatment


@treatment_router.put("/{treatment_id}", response_model=schemas.Treatment)
def update_treatment(
    treatment_id: int, treatment: schemas.TreatmentCreate, db: Session = Depends(get_db)
):
    db_treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if db_treatment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Treatment not found"
        )

    # If treatment is being moved to different case, verify new case exists
    if treatment.syphilis_case_id != db_treatment.syphilis_case_id:
        db_case = (
            db.query(SyphilisCase)
            .filter(SyphilisCase.id == treatment.syphilis_case_id)
            .first()
        )
        if db_case is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
            )

    # Update treatment attributes
    db_treatment.syphilis_case_id = treatment.syphilis_case_id
    db_treatment.medication = treatment.medication
    db_treatment.dosage = treatment.dosage
    db_treatment.notes = treatment.notes
    db_treatment.created_at = treatment.created_at

    db.commit()
    db.refresh(db_treatment)
    return db_treatment


# Follow-up test endpoints
@followup_router.post(
    "/", response_model=schemas.FollowUpTest, status_code=status.HTTP_201_CREATED
)
def create_followup_test(
    test: schemas.FollowUpTestCreate, db: Session = Depends(get_db)
):
    # Verify patient exists
    db_patient = db.query(Patient).filter(Patient.id == test.patient_id).first()
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )

    # Verify syphilis case exists
    db_case = (
        db.query(SyphilisCase).filter(SyphilisCase.id == test.syphilis_case_id).first()
    )
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
        )

    # Create new follow-up test
    db_test = FollowUpTest(
        patient_id=test.patient_id,
        syphilis_case_id=test.syphilis_case_id,
        test_date=test.test_date,
        test_type=test.test_type,
        result=test.result,
        title=test.title,
        notes=test.notes,
    )

    db.add(db_test)
    db.commit()
    db.refresh(db_test)

    # Check if this is a followup test after treatment
    if (
        db_case.treatment_status
        in [TreatmentStatus.UNDER_TREATMENT, TreatmentStatus.TREATMENT_COMPLETE]
        and test.result == TestResult.NON_REACTIVE
    ):
        # Get the previous test for this case
        prev_test = (
            db.query(FollowUpTest)
            .filter(
                and_(
                    FollowUpTest.syphilis_case_id == test.syphilis_case_id,
                    FollowUpTest.id != db_test.id,
                )
            )
            .order_by(desc(FollowUpTest.test_date))
            .first()
        )

        # If there's a previous test and it shows a reduction in titer, update case status
        if prev_test and prev_test.title and test.title:
            # Extract numerical values from titers (e.g., "1:16" -> 16)
            try:
                prev_titer = int(prev_test.title.split(":")[1])
                current_titer = int(test.title.split(":")[1])

                # If titer dropped by at least 2 dilutions (4x), mark as cured
                if current_titer <= prev_titer / 4:
                    db_case.treatment_status = TreatmentStatus.CURED
                    db.commit()
            except (IndexError, ValueError):
                # If titles aren't in expected format, just skip the automatic status update
                pass

    return db_test


@followup_router.get("/", response_model=List[schemas.FollowUpTest])
def read_followup_tests(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    case_id: Optional[int] = None,
    result: Optional[TestResult] = None,
    db: Session = Depends(get_db),
):
    query = db.query(FollowUpTest)

    if patient_id:
        query = query.filter(FollowUpTest.patient_id == patient_id)

    if case_id:
        query = query.filter(FollowUpTest.syphilis_case_id == case_id)

    if result:
        query = query.filter(FollowUpTest.result == result)

    return query.order_by(desc(FollowUpTest.test_date)).offset(skip).limit(limit).all()


@followup_router.get("/{test_id}", response_model=schemas.FollowUpTest)
def read_followup_test(test_id: int, db: Session = Depends(get_db)):
    db_test = db.query(FollowUpTest).filter(FollowUpTest.id == test_id).first()
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up test not found"
        )
    return db_test


@followup_router.put("/{test_id}", response_model=schemas.FollowUpTest)
def update_followup_test(
    test_id: int, test: schemas.FollowUpTestCreate, db: Session = Depends(get_db)
):
    db_test = db.query(FollowUpTest).filter(FollowUpTest.id == test_id).first()
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up test not found"
        )

    # Verify patient exists
    if test.patient_id != db_test.patient_id:
        db_patient = db.query(Patient).filter(Patient.id == test.patient_id).first()
        if db_patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

    # Verify syphilis case exists
    if test.syphilis_case_id != db_test.syphilis_case_id:
        db_case = (
            db.query(SyphilisCase)
            .filter(SyphilisCase.id == test.syphilis_case_id)
            .first()
        )
        if db_case is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Syphilis case not found"
            )

    # Update test attributes
    db_test.patient_id = test.patient_id
    db_test.syphilis_case_id = test.syphilis_case_id
    db_test.test_date = test.test_date
    db_test.test_type = test.test_type
    db_test.result = test.result
    db_test.title = test.title
    db_test.notes = test.notes

    db.commit()
    db.refresh(db_test)

    # Check for potential treatment outcome updates after modifying test result
    db_case = (
        db.query(SyphilisCase).filter(SyphilisCase.id == test.syphilis_case_id).first()
    )

    if db_case.treatment_status in [
        TreatmentStatus.UNDER_TREATMENT,
        TreatmentStatus.TREATMENT_COMPLETE,
        TreatmentStatus.MONITORING_CURE,
    ]:
        # Get the previous test for this case
        prev_test = (
            db.query(FollowUpTest)
            .filter(
                and_(
                    FollowUpTest.syphilis_case_id == test.syphilis_case_id,
                    FollowUpTest.id != db_test.id,
                    FollowUpTest.test_date < db_test.test_date,
                )
            )
            .order_by(desc(FollowUpTest.test_date))
            .first()
        )

        if prev_test and prev_test.title and db_test.title:
            try:
                # Extract numerical values from titers (e.g., "1:16" -> 16)
                prev_titer = int(prev_test.title.split(":")[1])
                current_titer = int(db_test.title.split(":")[1])

                if current_titer <= prev_titer / 4:
                    # Titer dropped by at least 2 dilutions (4x), indicating good response
                    if db_test.result == TestResult.NON_REACTIVE:
                        db_case.treatment_status = TreatmentStatus.CURED
                    else:
                        db_case.treatment_status = TreatmentStatus.MONITORING_CURE
                elif current_titer > prev_titer:
                    # Titer has increased, suggesting possible reinfection
                    db_case.treatment_status = TreatmentStatus.REINFECTION
                elif current_titer == prev_titer:
                    # No change in titers after treatment may suggest treatment failure
                    last_treatment = (
                        db.query(Treatment)
                        .filter(Treatment.syphilis_case_id == test.syphilis_case_id)
                        .order_by(desc(Treatment.created_at))
                        .first()
                    )

                    if last_treatment and (
                        db_test.test_date - last_treatment.created_at.date()
                    ) > timedelta(days=90):
                        db_case.treatment_status = TreatmentStatus.TREATMENT_FAILURE

                db.commit()
            except (IndexError, ValueError):
                # If titles aren't in expected format, skip automatic status update
                pass

    return db_test
