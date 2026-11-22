from datetime import datetime
from typing import Literal, Optional

from pydantic import Field

from app.schemas.common import CamelModel

ReminderType = Literal["FEEDING", "MEDICATION", "VACCINATION", "VET_VISIT", "WALK", "APPOINTMENT", "OTHER"]


class ReminderIn(CamelModel):
    type: ReminderType = "OTHER"
    title: str = Field(min_length=1, max_length=120)
    message: Optional[str] = Field(default=None, max_length=500)
    due_date: datetime  # local date + time, e.g. "2026-11-24T09:00"
    pet_id: Optional[int] = None


class ReminderUpdate(CamelModel):
    type: Optional[ReminderType] = None
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    message: Optional[str] = Field(default=None, max_length=500)
    due_date: Optional[datetime] = None
    pet_id: Optional[int] = None
    is_completed: Optional[bool] = None


class SnoozeIn(CamelModel):
    minutes: int = Field(default=60, ge=5, le=60 * 24 * 7)


class ReminderOut(CamelModel):
    id: int
    type: ReminderType
    title: str
    message: Optional[str] = None
    due_date: datetime
    pet_id: Optional[int] = None
    pet_name: Optional[str] = None
    is_completed: bool = False
    source: Optional[str] = None  # set when the system created it (vaccination / appointment)
    created_at: datetime
