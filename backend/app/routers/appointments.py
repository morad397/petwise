"""Appointments (Appointment class: create, bookAppointment, cancel, update).

Flow:
  owner books            -> PENDING
  staff confirms         -> CONFIRMED            (owner gets a reminder)
  staff rejects          -> REJECTED
  staff suggests a time  -> RESCHEDULE_REQUESTED -> owner accepts -> CONFIRMED
  staff starts / ends    -> IN_PROGRESS -> COMPLETED (saved as a vet-visit record)
  owner cancels          -> CANCELLED
"""

from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.core.access import get_pet_or_error
from app.core.deps import get_current_user, require_roles
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.appointment import AppointmentIn, AppointmentOut, AppointmentUpdate, SlotsOut, StatusChangeIn
from app.services.reminders import add_system_reminder, remove_system_reminder
from app.services.slots import free_slots

router = APIRouter(tags=["Appointments"])

OWNER_EDITABLE = ["PENDING", "CONFIRMED", "RESCHEDULE_REQUESTED"]

# Which staff action is allowed from which current status
ALLOWED_TRANSITIONS = {
    "CONFIRMED": ["PENDING"],
    "REJECTED": ["PENDING", "RESCHEDULE_REQUESTED"],
    "RESCHEDULE_REQUESTED": ["PENDING", "CONFIRMED"],
    "IN_PROGRESS": ["CONFIRMED"],
    "COMPLETED": ["CONFIRMED", "IN_PROGRESS"],
}


def _today_utc() -> date:
    # Israel is ahead of UTC, so any valid local date is >= the UTC date.
    return datetime.now(timezone.utc).date()


def _get_clinic(db: Database, clinic_id: int) -> dict:
    clinic = db.clinics.find_one({"_id": clinic_id})
    if clinic is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Clinic not found")
    if clinic.get("status") != "ACTIVE":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This clinic is not accepting appointments")
    return clinic


def _check_slot(db: Database, clinic: dict, day: date, time: str, exclude_id: Optional[int] = None) -> None:
    if day < _today_utc():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot book an appointment in the past")
    slot_status, slots = free_slots(db, clinic, day, exclude_id=exclude_id)
    if slot_status == "CLINIC_CLOSED":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The clinic is closed on that day")
    if time not in slots:
        raise HTTPException(status.HTTP_409_CONFLICT, "This time is not available. Please choose another time.")


def _load_for_owner(db: Database, appointment_id: int, user: dict) -> dict:
    appointment = db.appointments.find_one({"_id": appointment_id})
    if appointment is None or (appointment["user_id"] != user["_id"] and user["role"] != Role.ADMIN.value):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")
    return appointment


def _load_for_staff(db: Database, appointment_id: int, user: dict) -> dict:
    appointment = db.appointments.find_one({"_id": appointment_id})
    if appointment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")
    if user["role"] == Role.CLINIC_STAFF.value and appointment["clinic_id"] != user.get("clinic_id"):
        # Staff only see appointments of their own clinic
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")
    return appointment


def _confirm_reminder(db: Database, appointment: dict) -> None:
    pet = db.pets.find_one({"_id": appointment["pet_id"]})
    add_system_reminder(
        db,
        user_id=appointment["user_id"],
        pet=pet,
        type="APPOINTMENT",
        title=f"{appointment['service']} at {appointment.get('clinic_name') or 'the clinic'}",
        message=f"Appointment for {appointment.get('pet_name') or 'your pet'} is confirmed.",
        due_date=f"{appointment['appointment_date']}T{appointment['appointment_time']}:00",
        source=f"appointment:{appointment['_id']}",
    )


# ---------- free time slots ----------

@router.get("/clinics/{clinic_id}/slots", response_model=SlotsOut)
def get_slots(
    clinic_id: int,
    day: date = Query(alias="date"),
    after: Optional[str] = Query(default=None, pattern=r"^\d{2}:\d{2}$", description="hide times up to now (today)"),
    exclude: Optional[int] = Query(default=None, description="appointment being edited"),
    db: Database = Depends(get_db),
):
    clinic = db.clinics.find_one({"_id": clinic_id})
    if clinic is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Clinic not found")
    slot_status, slots = free_slots(db, clinic, day, after=after, exclude_id=exclude)
    return SlotsOut(status=slot_status, slots=slots)


# ---------- list ----------

@router.get("/appointments", response_model=List[AppointmentOut])
def list_appointments(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """Owners see their own, clinic staff see their clinic's, admins see all."""
    if user["role"] == Role.PET_OWNER.value:
        query = {"user_id": user["_id"]}
    elif user["role"] == Role.CLINIC_STAFF.value:
        if not user.get("clinic_id"):
            return []
        query = {"clinic_id": user["clinic_id"]}
    else:
        query = {}
    if status_filter:
        query["status"] = status_filter
    cursor = db.appointments.find(query).sort([("appointment_date", 1), ("appointment_time", 1)])
    return [to_out(a) for a in cursor]


# ---------- owner actions ----------

@router.post("/appointments", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(data: AppointmentIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    pet = db.pets.find_one({"_id": data.pet_id, "owner_id": user["_id"]})
    if pet is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Choose one of your own pets")
    clinic = _get_clinic(db, data.clinic_id)
    if data.service not in (clinic.get("services") or []):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This clinic does not offer that service")
    _check_slot(db, clinic, data.appointment_date, data.appointment_time)

    appointment = new_document(
        db,
        "appointments",
        status="PENDING",
        user_id=user["_id"],
        owner_name=user["full_name"],
        pet_name=pet["name"],
        pet_species=pet["species"],
        clinic_name=clinic["name"],
        staff_note=None,
        suggested_date=None,
        suggested_time=None,
        **data.model_dump(mode="json"),
    )
    db.appointments.insert_one(appointment)
    return to_out(appointment)


@router.put("/appointments/{appointment_id}", response_model=AppointmentOut)
def change_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """The owner changes their request; it goes back to PENDING for the clinic to confirm."""
    appointment = _load_for_owner(db, appointment_id, user)
    if appointment["status"] not in OWNER_EDITABLE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"A {appointment['status'].lower()} appointment cannot be changed")

    changes = data.model_dump(mode="json", exclude_unset=True)
    merged = {**appointment, **changes}
    if "pet_id" in changes:
        pet = db.pets.find_one({"_id": merged["pet_id"], "owner_id": appointment["user_id"]})
        if pet is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Choose one of your own pets")
        changes.update(pet_name=pet["name"], pet_species=pet["species"])
    clinic = _get_clinic(db, merged["clinic_id"])
    if merged["service"] not in (clinic.get("services") or []):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This clinic does not offer that service")
    _check_slot(db, clinic, date.fromisoformat(merged["appointment_date"]), merged["appointment_time"], exclude_id=appointment_id)

    changes.update(
        clinic_name=clinic["name"], status="PENDING", suggested_date=None, suggested_time=None, updated_at=now()
    )
    db.appointments.update_one({"_id": appointment_id}, {"$set": changes})
    remove_system_reminder(db, f"appointment:{appointment_id}")
    return to_out(db.appointments.find_one({"_id": appointment_id}))


@router.post("/appointments/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(appointment_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    appointment = _load_for_owner(db, appointment_id, user)
    if appointment["status"] not in OWNER_EDITABLE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"A {appointment['status'].lower()} appointment cannot be cancelled")
    db.appointments.update_one({"_id": appointment_id}, {"$set": {"status": "CANCELLED", "updated_at": now()}})
    remove_system_reminder(db, f"appointment:{appointment_id}")
    return to_out(db.appointments.find_one({"_id": appointment_id}))


@router.post("/appointments/{appointment_id}/accept-suggestion", response_model=AppointmentOut)
def accept_suggestion(appointment_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """The owner accepts the new time the clinic suggested."""
    appointment = _load_for_owner(db, appointment_id, user)
    if appointment["status"] != "RESCHEDULE_REQUESTED":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "There is no suggested time to accept")
    db.appointments.update_one(
        {"_id": appointment_id},
        {
            "$set": {
                "appointment_date": appointment["suggested_date"],
                "appointment_time": appointment["suggested_time"],
                "suggested_date": None,
                "suggested_time": None,
                "status": "CONFIRMED",
                "updated_at": now(),
            }
        },
    )
    appointment = db.appointments.find_one({"_id": appointment_id})
    _confirm_reminder(db, appointment)
    return to_out(appointment)


# ---------- clinic staff actions ----------

@router.post("/appointments/{appointment_id}/status", response_model=AppointmentOut)
def change_status(
    appointment_id: int,
    data: StatusChangeIn,
    user: dict = Depends(require_roles(Role.CLINIC_STAFF, Role.ADMIN)),
    db: Database = Depends(get_db),
):
    appointment = _load_for_staff(db, appointment_id, user)
    current = appointment["status"]
    if current not in ALLOWED_TRANSITIONS[data.status]:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cannot change a {current.lower()} appointment to {data.status.lower()}",
        )

    changes = {"status": data.status, "updated_at": now()}
    if data.note is not None:
        changes["staff_note"] = data.note

    if data.status == "RESCHEDULE_REQUESTED":
        clinic = _get_clinic(db, appointment["clinic_id"])
        _check_slot(db, clinic, data.suggested_date, data.suggested_time, exclude_id=appointment_id)
        changes.update(suggested_date=data.suggested_date.isoformat(), suggested_time=data.suggested_time)

    db.appointments.update_one({"_id": appointment_id}, {"$set": changes})
    appointment = db.appointments.find_one({"_id": appointment_id})
    source = f"appointment:{appointment_id}"

    if data.status == "CONFIRMED":
        _confirm_reminder(db, appointment)
    elif data.status in ("REJECTED", "RESCHEDULE_REQUESTED"):
        remove_system_reminder(db, source)
    elif data.status == "COMPLETED":
        remove_system_reminder(db, source)
        # The finished visit becomes part of the pet's medical history
        if db.treatments.find_one({"appointment_id": appointment_id}) is None:
            db.treatments.insert_one(
                new_document(
                    db,
                    "treatments",
                    pet_id=appointment["pet_id"],
                    created_by=user["_id"],
                    created_by_name=user["full_name"],
                    kind="VET_VISIT",
                    diagnosis=appointment["service"],
                    treatment_date=appointment["appointment_date"],
                    medication=None,
                    veterinarian=user["full_name"],
                    clinic_name=appointment.get("clinic_name"),
                    notes=data.note,
                    appointment_id=appointment_id,
                )
            )
    return to_out(appointment)
