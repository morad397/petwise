from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import Field, model_validator

from app.schemas.common import CamelModel
from app.schemas.pet import PetOut

TIME_PATTERN = r"^([01]\d|2[0-3]):[0-5]\d$"  # "HH:MM"

AppointmentStatus = Literal[
    "PENDING", "CONFIRMED", "REJECTED", "RESCHEDULE_REQUESTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
]
StaffAction = Literal["CONFIRMED", "REJECTED", "RESCHEDULE_REQUESTED", "IN_PROGRESS", "COMPLETED"]


class AppointmentIn(CamelModel):
    pet_id: int
    clinic_id: int
    service: str = Field(min_length=1, max_length=100)
    appointment_date: date
    appointment_time: str = Field(pattern=TIME_PATTERN)
    notes: Optional[str] = Field(default=None, max_length=500)


class AppointmentUpdate(CamelModel):
    pet_id: Optional[int] = None
    clinic_id: Optional[int] = None
    service: Optional[str] = Field(default=None, min_length=1, max_length=100)
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = Field(default=None, pattern=TIME_PATTERN)
    notes: Optional[str] = Field(default=None, max_length=500)


class StatusChangeIn(CamelModel):
    status: StaffAction
    note: Optional[str] = Field(default=None, max_length=1000)
    suggested_date: Optional[date] = None
    suggested_time: Optional[str] = Field(default=None, pattern=TIME_PATTERN)

    @model_validator(mode="after")
    def suggestion_needed(self):
        if self.status == "RESCHEDULE_REQUESTED" and not (self.suggested_date and self.suggested_time):
            raise ValueError("Suggest a new date and time")
        return self


class AppointmentOut(CamelModel):
    id: int
    user_id: int
    pet_id: int
    clinic_id: int
    service: str
    appointment_date: date
    appointment_time: str
    notes: Optional[str] = None
    status: AppointmentStatus
    staff_note: Optional[str] = None
    suggested_date: Optional[date] = None
    suggested_time: Optional[str] = None
    # copies kept on the appointment so lists show names without extra lookups
    pet_name: Optional[str] = None
    pet_species: Optional[str] = None
    owner_name: Optional[str] = None
    clinic_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class SlotsOut(CamelModel):
    status: Literal["AVAILABLE", "CLINIC_CLOSED", "FULLY_BOOKED"]
    slots: List[str]


class PatientOut(PetOut):
    owner_name: Optional[str] = None
    last_appointment_date: Optional[date] = None
    appointment_count: int = 0
