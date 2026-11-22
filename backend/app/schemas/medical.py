"""Medical records from the PetManagement class diagram:
VaccinationRecord, TreatmentRecord (vet visits + medications), WeightRecord."""

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import Field, model_validator

from app.schemas.common import CamelModel

ShortText = Optional[str]


class RecordOutBase(CamelModel):
    id: int
    pet_id: int
    created_by_name: Optional[str] = None
    created_at: datetime


# --- Vaccinations ---
class VaccinationIn(CamelModel):
    vaccine_name: str = Field(min_length=1, max_length=100)
    date_administered: date
    next_due_date: Optional[date] = None
    veterinarian: ShortText = Field(default=None, max_length=100)
    notes: ShortText = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def due_after_given(self):
        if self.next_due_date and self.next_due_date < self.date_administered:
            raise ValueError("Next due date must be after the date the vaccine was given")
        return self


class VaccinationUpdate(CamelModel):
    vaccine_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    date_administered: Optional[date] = None
    next_due_date: Optional[date] = None
    veterinarian: ShortText = Field(default=None, max_length=100)
    notes: ShortText = Field(default=None, max_length=500)


class VaccinationOut(RecordOutBase):
    vaccine_name: str
    date_administered: date
    next_due_date: Optional[date] = None
    veterinarian: Optional[str] = None
    notes: Optional[str] = None


# --- Treatments: vet visits and medications ---
TreatmentKind = Literal["VET_VISIT", "MEDICATION"]


class TreatmentIn(CamelModel):
    kind: TreatmentKind
    diagnosis: str = Field(min_length=1, max_length=150)  # reason / diagnosis / title
    treatment_date: date
    medication: ShortText = Field(default=None, max_length=150)
    veterinarian: ShortText = Field(default=None, max_length=100)
    clinic_name: ShortText = Field(default=None, max_length=150)
    notes: ShortText = Field(default=None, max_length=1000)


class TreatmentUpdate(CamelModel):
    diagnosis: Optional[str] = Field(default=None, min_length=1, max_length=150)
    treatment_date: Optional[date] = None
    medication: ShortText = Field(default=None, max_length=150)
    veterinarian: ShortText = Field(default=None, max_length=100)
    clinic_name: ShortText = Field(default=None, max_length=150)
    notes: ShortText = Field(default=None, max_length=1000)


class TreatmentOut(RecordOutBase):
    kind: TreatmentKind
    diagnosis: str
    treatment_date: date
    medication: Optional[str] = None
    veterinarian: Optional[str] = None
    clinic_name: Optional[str] = None
    notes: Optional[str] = None
    appointment_id: Optional[int] = None


# --- Weight ---
class WeightIn(CamelModel):
    weight_kg: float = Field(gt=0, le=200)
    recorded_date: date
    notes: ShortText = Field(default=None, max_length=300)


class WeightUpdate(CamelModel):
    weight_kg: Optional[float] = Field(default=None, gt=0, le=200)
    recorded_date: Optional[date] = None
    notes: ShortText = Field(default=None, max_length=300)


class WeightOut(RecordOutBase):
    weight_kg: float
    recorded_date: date
    notes: Optional[str] = None
