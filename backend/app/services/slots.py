"""Free appointment times for a clinic on a date (Schedule.checkAvailability).

A clinic's opening_hours list uses day_of_week 0 = Sunday ... 6 = Saturday.
"""

from datetime import date
from typing import List, Optional, Tuple

from pymongo.database import Database

# Statuses whose time slot is taken
BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"]


def _day_hours(clinic: dict, day: date) -> Optional[Tuple[str, str]]:
    if clinic.get("is_open_24_hours"):
        return "00:00", "23:59"
    day_of_week = (day.weekday() + 1) % 7  # Python: Monday=0 -> Sunday=0 like the frontend
    for hours in clinic.get("opening_hours") or []:
        if hours.get("day_of_week") == day_of_week:
            if hours.get("is_open") and hours.get("open_time") and hours.get("close_time"):
                return hours["open_time"], hours["close_time"]
            return None
    return None


def _to_minutes(hhmm: str) -> int:
    hours, minutes = hhmm.split(":")
    return int(hours) * 60 + int(minutes)


def all_slots(clinic: dict, day: date) -> Optional[List[str]]:
    """Every slot in the clinic's opening hours, or None if the clinic is closed that day."""
    hours = _day_hours(clinic, day)
    if hours is None:
        return None
    start, end = _to_minutes(hours[0]), _to_minutes(hours[1])
    step = clinic.get("appointment_duration_minutes") or 30
    return [f"{m // 60:02d}:{m % 60:02d}" for m in range(start, end - step + 1, step)]


def booked_times(db: Database, clinic_id: int, day: date, exclude_id: Optional[int] = None) -> set:
    day_str = day.isoformat()
    query = {"clinic_id": clinic_id, "appointment_date": day_str, "status": {"$in": BLOCKING_STATUSES}}
    suggested_query = {"clinic_id": clinic_id, "suggested_date": day_str, "status": "RESCHEDULE_REQUESTED"}
    if exclude_id is not None:
        query["_id"] = {"$ne": exclude_id}
        suggested_query["_id"] = {"$ne": exclude_id}
    taken = {a["appointment_time"] for a in db.appointments.find(query)}
    # A time the clinic suggested is held for that owner until they answer
    taken |= {a["suggested_time"] for a in db.appointments.find(suggested_query)}
    return taken


def free_slots(
    db: Database, clinic: dict, day: date, after: Optional[str] = None, exclude_id: Optional[int] = None
) -> Tuple[str, List[str]]:
    """Returns (status, slots). `after` ("HH:MM") hides times already past today."""
    slots = all_slots(clinic, day)
    if slots is None:
        return "CLINIC_CLOSED", []
    taken = booked_times(db, clinic["_id"], day, exclude_id)
    result = [s for s in slots if s not in taken and (after is None or s > after)]
    return ("AVAILABLE" if result else "FULLY_BOOKED"), result
