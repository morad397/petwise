from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.core.deps import require_roles
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.services.notify import log_activity
from app.schemas.clinic import ClinicCreate, ClinicOut, ClinicUpdate

router = APIRouter(prefix="/clinics", tags=["Clinics"])


# Public: the sign-up page needs the clinic list before the user has an account.
@router.get("", response_model=List[ClinicOut])
def list_clinics(db: Database = Depends(get_db)):
    return [to_out(c) for c in db.clinics.find().sort("_id", 1)]


@router.get("/{clinic_id}", response_model=ClinicOut)
def get_clinic(clinic_id: int, db: Database = Depends(get_db)):
    clinic = db.clinics.find_one({"_id": clinic_id})
    if clinic is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Clinic not found")
    return to_out(clinic)


@router.post(
    "",
    response_model=ClinicOut,
    status_code=status.HTTP_201_CREATED,
)
def create_clinic(data: ClinicCreate, db: Database = Depends(get_db), admin: dict = Depends(require_roles(Role.ADMIN))):
    clinic = new_document(db, "clinics", **data.model_dump(mode="json"))
    db.clinics.insert_one(clinic)
    log_activity(db, admin, "Clinic Created", clinic["name"])
    return to_out(clinic)


@router.put(
    "/{clinic_id}",
    response_model=ClinicOut,
)
def update_clinic(
    clinic_id: int, data: ClinicUpdate, db: Database = Depends(get_db), admin: dict = Depends(require_roles(Role.ADMIN))
):
    changes = data.model_dump(mode="json", exclude_unset=True)
    changes["updated_at"] = now()
    result = db.clinics.update_one({"_id": clinic_id}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Clinic not found")
    clinic = db.clinics.find_one({"_id": clinic_id})
    log_activity(db, admin, "Clinic Updated", clinic["name"] + (f" (status {changes['status']})" if "status" in changes else ""))
    return to_out(clinic)
