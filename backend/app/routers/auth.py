from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.user import LoginIn, RegisterIn, TokenOut, UpdateMeIn, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

EMAIL_TAKEN = "An account with this email already exists."


def _token_response(user: dict) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user["_id"], user["role"]),
        user=UserOut.model_validate(to_out(user)),
    )


def check_clinic_exists(db: Database, clinic_id) -> None:
    if clinic_id is not None and db.clinics.find_one({"_id": clinic_id}) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Selected clinic does not exist")


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: Database = Depends(get_db)):
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_TAKEN)

    is_staff = data.role == Role.CLINIC_STAFF.value
    if is_staff:
        check_clinic_exists(db, data.clinic_id)

    user = new_document(
        db,
        "users",
        full_name=data.full_name.strip() or "User",
        email=data.email,
        password_hash=hash_password(data.password),
        phone=None,
        role=data.role,
        clinic_id=data.clinic_id if is_staff else None,
        department=(data.department or "General Medicine") if is_staff else None,
    )
    try:
        db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_TAKEN)
    return _token_response(user)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Database = Depends(get_db)):
    user = db.users.find_one({"email": data.email})
    # Same message for "no such user" and "wrong password" so emails can't be guessed.
    if user is None or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account is suspended.")
    return _token_response(user)


@router.get("/me", response_model=UserOut)
def read_me(user: dict = Depends(get_current_user)):
    return to_out(user)


@router.put("/me", response_model=UserOut)
def update_me(
    data: UpdateMeIn,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    incoming = data.model_dump(exclude_unset=True)
    changes = {}

    if incoming.get("email"):
        new_email = incoming["email"].strip().lower()
        if db.users.find_one({"email": new_email, "_id": {"$ne": user["_id"]}}):
            raise HTTPException(status.HTTP_409_CONFLICT, "This email is already in use.")
        changes["email"] = new_email
    if incoming.get("full_name"):
        changes["full_name"] = incoming["full_name"].strip()
    if "phone" in incoming:
        changes["phone"] = incoming["phone"]
    # Staff can pick their clinic / department from their profile page.
    if user["role"] == Role.CLINIC_STAFF.value:
        if "clinic_id" in incoming:
            check_clinic_exists(db, incoming["clinic_id"])
            changes["clinic_id"] = incoming["clinic_id"]
        if "department" in incoming:
            changes["department"] = incoming["department"]

    if changes:
        changes["updated_at"] = now()
        db.users.update_one({"_id": user["_id"]}, {"$set": changes})
    return to_out(db.users.find_one({"_id": user["_id"]}))
