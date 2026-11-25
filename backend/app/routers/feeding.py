"""A pet's feeding schedule and a "fed today" log.

The log lets family members who share a pet see that a meal was already given
(and by whom), so the pet is not fed twice or forgotten.
"""

from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import Field
from pymongo.database import Database

from app.core.access import get_pet_or_error
from app.core.deps import get_current_user
from app.database import get_db, new_document, now, to_out
from app.schemas.common import CamelModel

router = APIRouter(prefix="/pets/{pet_id}/feeding", tags=["Feeding"])

TIME_PATTERN = r"^([01]\d|2[0-3]):[0-5]\d$"


class FeedingIn(CamelModel):
    meal_name: str = Field(min_length=1, max_length=60)  # e.g. "Breakfast"
    time: str = Field(pattern=TIME_PATTERN)  # "08:00"
    food: str = Field(min_length=1, max_length=120)
    amount: Optional[str] = Field(default=None, max_length=60)  # e.g. "250 g"
    notes: Optional[str] = Field(default=None, max_length=300)


class FeedingUpdate(CamelModel):
    meal_name: Optional[str] = Field(default=None, min_length=1, max_length=60)
    time: Optional[str] = Field(default=None, pattern=TIME_PATTERN)
    food: Optional[str] = Field(default=None, min_length=1, max_length=120)
    amount: Optional[str] = Field(default=None, max_length=60)
    notes: Optional[str] = Field(default=None, max_length=300)


class FeedingOut(CamelModel):
    id: int
    pet_id: int
    meal_name: str
    time: str
    food: str
    amount: Optional[str] = None
    notes: Optional[str] = None
    # filled for the requested day
    fed: bool = False
    fed_by_name: Optional[str] = None
    fed_at: Optional[datetime] = None


class FedIn(CamelModel):
    date: date  # the owner's local date


def _with_log(db: Database, entries: list, day: str) -> list:
    logs = {
        log["schedule_id"]: log
        for log in db.feeding_logs.find({"schedule_id": {"$in": [e["_id"] for e in entries]}, "date": day})
    }
    result = []
    for entry in entries:
        out = to_out(entry)
        log = logs.get(entry["_id"])
        out.update(fed=log is not None, fed_by_name=log and log["fed_by_name"], fed_at=log and log["created_at"])
        result.append(out)
    return result


def _load_entry(db: Database, pet_id: int, entry_id: int) -> dict:
    entry = db.feeding_schedules.find_one({"_id": entry_id, "pet_id": pet_id})
    if entry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Meal not found")
    return entry


@router.get("", response_model=List[FeedingOut])
def list_schedule(
    pet_id: int,
    day: Optional[date] = Query(default=None, alias="date"),
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """The pet's meals in time order, with whether each was given on `date` (default: today UTC)."""
    get_pet_or_error(db, pet_id, user, allow_staff=True)
    entries = list(db.feeding_schedules.find({"pet_id": pet_id}).sort([("time", 1), ("_id", 1)]))
    return _with_log(db, entries, (day or date.today()).isoformat())


@router.post("", response_model=FeedingOut, status_code=status.HTTP_201_CREATED)
def add_meal(pet_id: int, data: FeedingIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    get_pet_or_error(db, pet_id, user)
    entry = new_document(db, "feeding_schedules", pet_id=pet_id, **data.model_dump())
    db.feeding_schedules.insert_one(entry)
    return to_out(entry)


@router.put("/{entry_id}", response_model=FeedingOut)
def update_meal(
    pet_id: int, entry_id: int, data: FeedingUpdate, user: dict = Depends(get_current_user), db: Database = Depends(get_db)
):
    get_pet_or_error(db, pet_id, user)
    _load_entry(db, pet_id, entry_id)
    changes = data.model_dump(exclude_unset=True)
    changes["updated_at"] = now()
    db.feeding_schedules.update_one({"_id": entry_id}, {"$set": changes})
    return to_out(db.feeding_schedules.find_one({"_id": entry_id}))


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(pet_id: int, entry_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    get_pet_or_error(db, pet_id, user)
    _load_entry(db, pet_id, entry_id)
    db.feeding_schedules.delete_one({"_id": entry_id})
    db.feeding_logs.delete_many({"schedule_id": entry_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{entry_id}/fed", response_model=FeedingOut)
def mark_fed(
    pet_id: int, entry_id: int, data: FedIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)
):
    """Records that this meal was given on that day (only once per day)."""
    get_pet_or_error(db, pet_id, user)
    entry = _load_entry(db, pet_id, entry_id)
    day = data.date.isoformat()
    if db.feeding_logs.find_one({"schedule_id": entry_id, "date": day}) is None:
        db.feeding_logs.insert_one(
            new_document(
                db, "feeding_logs", pet_id=pet_id, schedule_id=entry_id, date=day,
                fed_by=user["_id"], fed_by_name=user["full_name"],
            )
        )
    return _with_log(db, [entry], day)[0]


@router.delete("/{entry_id}/fed", response_model=FeedingOut)
def undo_fed(
    pet_id: int,
    entry_id: int,
    day: date = Query(alias="date"),
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    get_pet_or_error(db, pet_id, user)
    entry = _load_entry(db, pet_id, entry_id)
    db.feeding_logs.delete_many({"schedule_id": entry_id, "date": day.isoformat()})
    return _with_log(db, [entry], day.isoformat())[0]
