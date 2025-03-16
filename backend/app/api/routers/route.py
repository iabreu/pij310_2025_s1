from datetime import datetime
from uuid import UUID

from database import get_db
from dependencies import verify_jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/hello-world")
def get_customer_by_name():
    return {"message": "Hello World"}
