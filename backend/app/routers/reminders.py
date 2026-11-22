"""Reminders (Reminder class: sendReminder, snooze, markComplete). Each user sees only their own."""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.deps import get_current_user
from app.database import get_db, new_document, now, to_out
from app.schemas.reminder import ReminderIn, ReminderOut, ReminderUpdate, SnoozeIn

router = APIRouter(prefix="/reminders", tags=["Reminders"])


def _own_pet(db: Database, pet_id: Optional[int], user: dict) -> Optional[dict]:
    if pet_id is None:
        return None
    pet = db.pets.find_one({"_id": pet_id, "owner_id": user["_id"]})
    if pet is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Pet not found")
    return pet


def _load(db: Database, reminder_id: int, user: dict) -> dict:
    reminder = db.reminders.find_one({"_id": reminder_id, "user_id": user["_id"]})
    if reminder is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")
    return reminder


@router.get("", response_model=List[ReminderOut])
def list_reminders(
    include_completed: bool = True,
    pet_id: Optional[int] = None,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    query = {"user_id": user["_id"]}
    if not include_completed:
        query["is_completed"] = False
    if pet_id is not None:
        query["pet_id"] = pet_id
    return [to_out(r) for r in db.reminders.find(query).sort([("is_completed", 1), ("due_date", 1)])]


@router.post("", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(data: ReminderIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    pet = _own_pet(db, data.pet_id, user)
    values = data.model_dump(mode="json")
    values["pet_name"] = pet["name"] if pet else None
    reminder = new_document(db, "reminders", user_id=user["_id"], is_completed=False, source=None, **values)
    db.reminders.insert_one(reminder)
    return to_out(reminder)


@router.put("/{reminder_id}", response_model=ReminderOut)
def update_reminder(
    reminder_id: int, data: ReminderUpdate, user: dict = Depends(get_current_user), db: Database = Depends(get_db)
):
    _load(db, reminder_id, user)
    changes = data.model_dump(mode="json", exclude_unset=True)
    if "pet_id" in changes:
        pet = _own_pet(db, changes["pet_id"], user)
        changes["pet_name"] = pet["name"] if pet else None
    changes["updated_at"] = now()
    db.reminders.update_one({"_id": reminder_id}, {"$set": changes})
    return to_out(db.reminders.find_one({"_id": reminder_id}))


@router.post("/{reminder_id}/complete", response_model=ReminderOut)
def mark_complete(reminder_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    _load(db, reminder_id, user)
    db.reminders.update_one({"_id": reminder_id}, {"$set": {"is_completed": True, "updated_at": now()}})
    return to_out(db.reminders.find_one({"_id": reminder_id}))


@router.post("/{reminder_id}/snooze", response_model=ReminderOut)
def snooze(
    reminder_id: int, data: SnoozeIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)
):
    reminder = _load(db, reminder_id, user)
    new_due = datetime.fromisoformat(reminder["due_date"]) + timedelta(minutes=data.minutes)
    db.reminders.update_one(
        {"_id": reminder_id},
        {"$set": {"due_date": new_due.isoformat(), "is_completed": False, "updated_at": now()}},
    )
    return to_out(db.reminders.find_one({"_id": reminder_id}))


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    _load(db, reminder_id, user)
    db.reminders.delete_one({"_id": reminder_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
