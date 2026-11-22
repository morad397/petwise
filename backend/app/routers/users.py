from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.deps import require_roles
from app.core.security import hash_password
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.user import AdminUserCreateIn, AdminUserUpdateIn, UserOut

# Admin-only user management
router = APIRouter(prefix="/users", tags=["Users (admin)"])
admin_only = require_roles(Role.ADMIN)


def _get_user_or_404(db: Database, user_id: int) -> dict:
    user = db.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.get("", response_model=List[UserOut])
def list_users(db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    return [to_out(u) for u in db.users.find().sort("_id", 1)]


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(data: AdminUserCreateIn, db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    is_staff = data.role == Role.CLINIC_STAFF.value
    if is_staff and (data.clinic_id is None or db.clinics.find_one({"_id": data.clinic_id}) is None):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Clinic staff must be assigned to an existing clinic")

    user = new_document(
        db,
        "users",
        full_name=data.full_name.strip(),
        email=data.email,
        password_hash=hash_password(data.password),
        phone=None,
        role=data.role,
        clinic_id=data.clinic_id if is_staff else None,
        department=(data.department or "General Medicine") if is_staff else None,
    )
    db.users.insert_one(user)
    return to_out(user)


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: AdminUserUpdateIn,
    db: Database = Depends(get_db),
    admin: dict = Depends(admin_only),
):
    user = _get_user_or_404(db, user_id)
    changes = data.model_dump(exclude_unset=True)

    if user["_id"] == admin["_id"] and (
        changes.get("role", Role.ADMIN.value) != Role.ADMIN.value
        or changes.get("status", "ACTIVE") != "ACTIVE"
    ):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot demote or suspend yourself.")
    if changes.get("clinic_id") is not None and db.clinics.find_one({"_id": changes["clinic_id"]}) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Selected clinic does not exist")

    if changes.get("role", user["role"]) != Role.CLINIC_STAFF.value:
        changes["clinic_id"] = None
        changes["department"] = None
    changes["updated_at"] = now()
    db.users.update_one({"_id": user_id}, {"$set": changes})
    return to_out(db.users.find_one({"_id": user_id}))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Database = Depends(get_db), admin: dict = Depends(admin_only)):
    user = _get_user_or_404(db, user_id)
    if user["_id"] == admin["_id"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot delete your own account.")
    db.users.delete_one({"_id": user_id})
    db.pets.delete_many({"owner_id": user_id})  # a user's pets go with them
    return Response(status_code=status.HTTP_204_NO_CONTENT)
