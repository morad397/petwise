from datetime import date, datetime
from typing import Literal, Optional

from pydantic import Field, field_validator

from app.schemas.common import CamelModel

MAX_IMAGE_CHARS = 8 * 1024 * 1024  # ~6 MB image once base64-encoded


class PetBase(CamelModel):
    name: str = Field(min_length=1, max_length=80)
    species: Literal["dog", "cat"]
    breed: Optional[str] = Field(default=None, max_length=80)
    gender: Optional[str] = Field(default=None, max_length=20)
    birth_date: Optional[date] = None
    age: Optional[int] = Field(default=None, ge=0, le=40)
    weight_kg: Optional[float] = Field(default=None, gt=0, le=200)
    image_url: Optional[str] = Field(default=None, max_length=MAX_IMAGE_CHARS)

    @field_validator("species", mode="before")
    @classmethod
    def lower_species(cls, v):
        return v.strip().lower() if isinstance(v, str) else v

    @field_validator("breed", "gender", "image_url", mode="before")
    @classmethod
    def empty_to_none(cls, v):
        if isinstance(v, str) and not v.strip():
            return None
        return v


class PetCreate(PetBase):
    pass


class PetUpdate(PetBase):
    # Every field is optional on update
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    species: Optional[Literal["dog", "cat"]] = None


class PetOut(CamelModel):
    id: int
    owner_id: int
    name: str
    species: str
    breed: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
