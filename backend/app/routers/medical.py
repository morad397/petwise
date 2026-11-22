"""Medical records of a pet: /api/pets/{pet_id}/vaccinations, /treatments, /weights.

The three record types work the same way, so one function builds a router for each.
Who may do what:
- pet owner / admin: everything
- clinic staff: read and add records for patients of their clinic (Staff.updateMedicalRecords),
  and edit or delete only records they added themselves
"""

from typing import Callable, List, Optional, Type

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.access import get_pet_or_error
from app.core.deps import get_current_user
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.common import CamelModel
from app.schemas.medical import (
    TreatmentIn,
    TreatmentOut,
    TreatmentUpdate,
    VaccinationIn,
    VaccinationOut,
    VaccinationUpdate,
    WeightIn,
    WeightOut,
    WeightUpdate,
)
from app.services.reminders import add_system_reminder, remove_system_reminder


def make_record_router(
    *,
    collection: str,
    path: str,
    tag: str,
    create_schema: Type[CamelModel],
    update_schema: Type[CamelModel],
    out_schema: Type[CamelModel],
    sort_field: str,
    after_save: Optional[Callable[[Database, dict, dict], None]] = None,
    after_delete: Optional[Callable[[Database, dict, dict], None]] = None,
) -> APIRouter:
    router = APIRouter(prefix=f"/pets/{{pet_id}}/{path}", tags=[tag])

    def load_record(db: Database, pet_id: int, record_id: int, user: dict):
        pet = get_pet_or_error(db, pet_id, user, allow_staff=True)
        record = db[collection].find_one({"_id": record_id, "pet_id": pet_id})
        if record is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Record not found")
        is_owner_or_admin = pet["owner_id"] == user["_id"] or user["role"] == Role.ADMIN.value
        if not is_owner_or_admin and record.get("created_by") != user["_id"]:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only change records you added")
        return pet, record

    @router.get("", response_model=List[out_schema])
    def list_records(pet_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
        get_pet_or_error(db, pet_id, user, allow_staff=True)
        records = db[collection].find({"pet_id": pet_id}).sort([(sort_field, -1), ("_id", -1)])
        return [to_out(r) for r in records]

    @router.post("", response_model=out_schema, status_code=status.HTTP_201_CREATED)
    def create_record(
        pet_id: int,
        data: create_schema,  # type: ignore[valid-type]
        user: dict = Depends(get_current_user),
        db: Database = Depends(get_db),
    ):
        pet = get_pet_or_error(db, pet_id, user, allow_staff=True)
        record = new_document(
            db,
            collection,
            pet_id=pet_id,
            created_by=user["_id"],
            created_by_name=user["full_name"],
            **data.model_dump(mode="json"),
        )
        db[collection].insert_one(record)
        if after_save:
            after_save(db, pet, record)
        return to_out(record)

    @router.put("/{record_id}", response_model=out_schema)
    def update_record(
        pet_id: int,
        record_id: int,
        data: update_schema,  # type: ignore[valid-type]
        user: dict = Depends(get_current_user),
        db: Database = Depends(get_db),
    ):
        pet, _ = load_record(db, pet_id, record_id, user)
        changes = data.model_dump(mode="json", exclude_unset=True)
        changes["updated_at"] = now()
        db[collection].update_one({"_id": record_id}, {"$set": changes})
        record = db[collection].find_one({"_id": record_id})
        if after_save:
            after_save(db, pet, record)
        return to_out(record)

    @router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_record(
        pet_id: int, record_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)
    ):
        pet, record = load_record(db, pet_id, record_id, user)
        db[collection].delete_one({"_id": record_id})
        if after_delete:
            after_delete(db, pet, record)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return router


# --- extra behaviour per record type ---

def _vaccination_saved(db: Database, pet: dict, record: dict) -> None:
    """A vaccine with a next due date gets an automatic reminder for the owner."""
    source = f"vaccination:{record['_id']}"
    if record.get("next_due_date"):
        add_system_reminder(
            db,
            user_id=pet["owner_id"],
            pet=pet,
            type="VACCINATION",
            title=f"{record['vaccine_name']} due for {pet['name']}",
            message="Next dose according to the vaccination record.",
            due_date=f"{record['next_due_date']}T09:00:00",
            source=source,
        )
    else:
        remove_system_reminder(db, source)


def _vaccination_deleted(db: Database, pet: dict, record: dict) -> None:
    remove_system_reminder(db, f"vaccination:{record['_id']}")


def _sync_pet_weight(db: Database, pet: dict, _record: Optional[dict] = None) -> None:
    """The pet's current weight follows its newest weight entry."""
    latest = db.weights.find_one({"pet_id": pet["_id"]}, sort=[("recorded_date", -1), ("_id", -1)])
    if latest is not None:
        db.pets.update_one({"_id": pet["_id"]}, {"$set": {"weight_kg": latest["weight_kg"], "updated_at": now()}})


vaccinations_router = make_record_router(
    collection="vaccinations",
    path="vaccinations",
    tag="Medical records",
    create_schema=VaccinationIn,
    update_schema=VaccinationUpdate,
    out_schema=VaccinationOut,
    sort_field="date_administered",
    after_save=_vaccination_saved,
    after_delete=_vaccination_deleted,
)

treatments_router = make_record_router(
    collection="treatments",
    path="treatments",
    tag="Medical records",
    create_schema=TreatmentIn,
    update_schema=TreatmentUpdate,
    out_schema=TreatmentOut,
    sort_field="treatment_date",
)

weights_router = make_record_router(
    collection="weights",
    path="weights",
    tag="Medical records",
    create_schema=WeightIn,
    update_schema=WeightUpdate,
    out_schema=WeightOut,
    sort_field="recorded_date",
    after_save=_sync_pet_weight,
    after_delete=_sync_pet_weight,
)
