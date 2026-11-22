from datetime import datetime
from typing import Literal, Optional

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel

RoleName = Literal["PET_OWNER", "CLINIC_STAFF", "ADMIN"]


class UserOut(CamelModel):
    id: int
    full_name: str
    email: str  # plain str: accounts created by the seed script may use any address
    phone: Optional[str] = None
    role: RoleName
    clinic_id: Optional[int] = None
    department: Optional[str] = None
    status: str
    created_at: datetime


class RegisterIn(CamelModel):
    full_name: str = Field(default="", max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    # ADMIN cannot be chosen at sign-up; admins are created by the seed script or another admin.
    role: Literal["PET_OWNER", "CLINIC_STAFF"]
    clinic_id: Optional[int] = None
    department: Optional[str] = Field(default=None, max_length=100)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginIn(CamelModel):
    # No strict format check at login: a wrong address simply won't match any account.
    email: str = Field(min_length=1, max_length=255)
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class TokenOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UpdateMeIn(CamelModel):
    """What a user may change about themselves (not their role)."""

    full_name: Optional[str] = Field(default=None, max_length=120)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=30)
    department: Optional[str] = Field(default=None, max_length=100)
    clinic_id: Optional[int] = None


class AdminUserCreateIn(CamelModel):
    """An admin can create any kind of account, including other admins."""

    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: RoleName
    clinic_id: Optional[int] = None
    department: Optional[str] = Field(default=None, max_length=100)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class AdminUserUpdateIn(CamelModel):
    """What an admin may change about any user."""

    full_name: Optional[str] = Field(default=None, max_length=120)
    role: Optional[RoleName] = None
    clinic_id: Optional[int] = None
    department: Optional[str] = Field(default=None, max_length=100)
    status: Optional[Literal["ACTIVE", "SUSPENDED"]] = None
