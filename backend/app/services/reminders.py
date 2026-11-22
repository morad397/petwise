"""Reminders the system creates by itself (vaccine due dates, confirmed appointments)."""

from typing import Optional

from pymongo.database import Database

from app.database import new_document


def add_system_reminder(
    db: Database,
    *,
    user_id: int,
    pet: Optional[dict],
    type: str,
    title: str,
    due_date: str,  # ISO "YYYY-MM-DDTHH:MM:SS"
    source: str,
    message: Optional[str] = None,
) -> None:
    """Creates a reminder, replacing an earlier one from the same source."""
    remove_system_reminder(db, source)
    db.reminders.insert_one(
        new_document(
            db,
            "reminders",
            user_id=user_id,
            pet_id=pet["_id"] if pet else None,
            pet_name=pet["name"] if pet else None,
            type=type,
            title=title,
            message=message,
            due_date=due_date,
            is_completed=False,
            source=source,
        )
    )


def remove_system_reminder(db: Database, source: str) -> None:
    db.reminders.delete_many({"source": source})
