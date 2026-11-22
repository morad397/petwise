"""Clinic staff: the patients (pets) of their own clinic (Staff.searchPatients)."""

from typing import List

from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.core.access import LINKED_STATUSES
from app.core.deps import require_roles
from app.database import get_db, to_out
from app.roles import Role
from app.schemas.appointment import PatientOut

router = APIRouter(prefix="/staff", tags=["Clinic staff"])


@router.get("/patients", response_model=List[PatientOut])
def clinic_patients(user: dict = Depends(require_roles(Role.CLINIC_STAFF)), db: Database = Depends(get_db)):
    if not user.get("clinic_id"):
        return []
    visits = {}
    for appointment in db.appointments.find({"clinic_id": user["clinic_id"], "status": {"$in": LINKED_STATUSES}}):
        info = visits.setdefault(appointment["pet_id"], {"count": 0, "last": None, "owner": appointment.get("owner_name")})
        info["count"] += 1
        if info["last"] is None or appointment["appointment_date"] > info["last"]:
            info["last"] = appointment["appointment_date"]

    patients = []
    for pet in db.pets.find({"_id": {"$in": list(visits)}}).sort("name", 1):
        info = visits[pet["_id"]]
        patients.append(
            {**to_out(pet), "owner_name": info["owner"], "last_appointment_date": info["last"], "appointment_count": info["count"]}
        )
    return patients
