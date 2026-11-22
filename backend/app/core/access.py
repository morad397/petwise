"""Who may see or change a pet and its records (checked on the server)."""

from fastapi import HTTPException, status
from pymongo.database import Database

from app.roles import Role

# Appointment statuses that link a pet to a clinic (so that clinic's staff may see it)
LINKED_STATUSES = ["PENDING", "CONFIRMED", "RESCHEDULE_REQUESTED", "IN_PROGRESS", "COMPLETED"]


def staff_has_patient(db: Database, user: dict, pet_id: int) -> bool:
    """Clinic staff may access a pet that has an appointment at their own clinic."""
    if user["role"] != Role.CLINIC_STAFF.value or not user.get("clinic_id"):
        return False
    return (
        db.appointments.find_one(
            {"pet_id": pet_id, "clinic_id": user["clinic_id"], "status": {"$in": LINKED_STATUSES}}
        )
        is not None
    )


def get_pet_or_error(db: Database, pet_id: int, user: dict, allow_staff: bool = False) -> dict:
    """Loads a pet; raises 404 if missing, 403 if the user may not access it.

    Owners and admins always have access. Clinic staff only when allow_staff=True
    and the pet is a patient of their clinic.
    """
    pet = db.pets.find_one({"_id": pet_id})
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found")
    if pet["owner_id"] == user["_id"] or user["role"] == Role.ADMIN.value:
        return pet
    if allow_staff and staff_has_patient(db, user, pet_id):
        return pet
    raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have permission to view this pet")


def delete_pet_data(db: Database, pet_ids) -> None:
    """Removes a pet's records and reminders; cancels its open appointments."""
    pet_ids = list(pet_ids)
    if not pet_ids:
        return
    query = {"pet_id": {"$in": pet_ids}}
    for collection in ("vaccinations", "treatments", "weights", "reminders"):
        db[collection].delete_many(query)
    db.appointments.update_many(
        {**query, "status": {"$in": ["PENDING", "CONFIRMED", "RESCHEDULE_REQUESTED"]}},
        {"$set": {"status": "CANCELLED"}},
    )
