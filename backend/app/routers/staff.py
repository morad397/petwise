"""Clinic staff: their clinic's patients (Staff.searchPatients) and daily schedule (Schedule)."""

from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError

from app.core.access import LINKED_STATUSES
from app.core.deps import require_roles
from app.database import get_db, new_document, to_out
from app.roles import Role
from app.schemas.appointment import BlockIn, BlockOut, PatientOut, ScheduleDayOut
from app.services.slots import BLOCKING_STATUSES, all_slots, blocked_times

router = APIRouter(prefix="/staff", tags=["Clinic staff"])
staff_only = require_roles(Role.CLINIC_STAFF)


def _clinic_of(db: Database, user: dict) -> dict:
    clinic = db.clinics.find_one({"_id": user.get("clinic_id")}) if user.get("clinic_id") else None
    if clinic is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Your account is not assigned to a clinic yet")
    return clinic


@router.get("/patients", response_model=List[PatientOut])
def clinic_patients(user: dict = Depends(staff_only), db: Database = Depends(get_db)):
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


# ---------- daily schedule ----------

@router.get("/schedule", response_model=ScheduleDayOut)
def day_schedule(
    day: date = Query(alias="date"),
    user: dict = Depends(staff_only),
    db: Database = Depends(get_db),
):
    """Every time slot of the day: free, booked (with the appointment) or blocked."""
    clinic = _clinic_of(db, user)
    slots = all_slots(clinic, day)
    if slots is None:
        return ScheduleDayOut(date=day, is_open=False, slots=[])

    day_str = day.isoformat()
    booked = {}
    for a in db.appointments.find(
        {"clinic_id": clinic["_id"], "appointment_date": day_str, "status": {"$in": BLOCKING_STATUSES}}
    ):
        booked[a["appointment_time"]] = a
    for a in db.appointments.find(
        {"clinic_id": clinic["_id"], "suggested_date": day_str, "status": "RESCHEDULE_REQUESTED"}
    ):
        booked.setdefault(a["suggested_time"], a)
    blocks = blocked_times(db, clinic["_id"], day)

    result = []
    for time in slots:
        if time in booked:
            a = booked[time]
            result.append(
                {
                    "time": time,
                    "state": "BOOKED",
                    "appointment_id": a["_id"],
                    "appointment_status": a["status"],
                    "pet_name": a.get("pet_name"),
                    "owner_name": a.get("owner_name"),
                    "service": a.get("service"),
                }
            )
        elif time in blocks:
            result.append({"time": time, "state": "BLOCKED", "block_id": blocks[time]["_id"], "reason": blocks[time].get("reason")})
        else:
            result.append({"time": time, "state": "AVAILABLE"})
    return {"date": day, "is_open": True, "slots": result}


@router.post("/schedule/blocks", response_model=BlockOut, status_code=status.HTTP_201_CREATED)
def block_time(data: BlockIn, user: dict = Depends(staff_only), db: Database = Depends(get_db)):
    """Blocks one time slot (e.g. lunch break) so owners cannot book it."""
    clinic = _clinic_of(db, user)
    slots = all_slots(clinic, data.date)
    if slots is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The clinic is closed on that day")
    if data.time not in slots:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "That is not one of the clinic's time slots")

    day_str = data.date.isoformat()
    has_booking = db.appointments.find_one(
        {
            "clinic_id": clinic["_id"],
            "$or": [
                {"appointment_date": day_str, "appointment_time": data.time, "status": {"$in": BLOCKING_STATUSES}},
                {"suggested_date": day_str, "suggested_time": data.time, "status": "RESCHEDULE_REQUESTED"},
            ],
        }
    )
    if has_booking:
        raise HTTPException(status.HTTP_409_CONFLICT, "This time already has an appointment")

    block = new_document(
        db,
        "schedule_blocks",
        clinic_id=clinic["_id"],
        date=day_str,
        time=data.time,
        reason=data.reason,
        created_by=user["_id"],
    )
    try:
        db.schedule_blocks.insert_one(block)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "This time is already blocked")
    return to_out(block)


@router.delete("/schedule/blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
def unblock_time(block_id: int, user: dict = Depends(staff_only), db: Database = Depends(get_db)):
    result = db.schedule_blocks.delete_one({"_id": block_id, "clinic_id": user.get("clinic_id")})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Blocked time not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
