import enum


class Role(str, enum.Enum):
    PET_OWNER = "PET_OWNER"
    CLINIC_STAFF = "CLINIC_STAFF"
    ADMIN = "ADMIN"
