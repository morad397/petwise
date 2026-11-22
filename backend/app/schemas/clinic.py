from typing import List, Literal, Optional

from pydantic import Field

from app.schemas.common import CamelModel


class OpeningHour(CamelModel):
    day_of_week: int = Field(ge=0, le=6)  # 0 = Sunday
    is_open: bool = False
    open_time: Optional[str] = None  # "08:00"
    close_time: Optional[str] = None  # "18:00"


class ClinicBase(CamelModel):
    name: str = Field(min_length=1, max_length=150)
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_emergency_clinic: bool = False
    is_open_24_hours: bool = False
    appointment_duration_minutes: int = Field(default=30, ge=5, le=240)
    opening_hours: List[OpeningHour] = []
    services: List[str] = []


class ClinicCreate(ClinicBase):
    status: Literal["ACTIVE", "PENDING", "SUSPENDED"] = "ACTIVE"


class ClinicUpdate(CamelModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_emergency_clinic: Optional[bool] = None
    is_open_24_hours: Optional[bool] = None
    appointment_duration_minutes: Optional[int] = Field(default=None, ge=5, le=240)
    opening_hours: Optional[List[OpeningHour]] = None
    services: Optional[List[str]] = None
    status: Optional[Literal["ACTIVE", "PENDING", "SUSPENDED"]] = None


class ClinicOut(ClinicBase):
    id: int
    status: str
