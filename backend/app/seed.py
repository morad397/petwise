"""Starting data for an empty database.

This runs automatically every time the server starts (and is safe to repeat):
- creates the indexes (unique email, ...)
- adds the 3 demo clinics if there are no clinics yet
- creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist

You can also run it by hand from the backend folder:  python -m app.seed
"""

from pymongo.database import Database

from app.config import settings
from app.core.security import hash_password
from app.database import create_indexes, get_db, new_document
from app.roles import Role


def _week(open_time, close_time, closed_days=()):
    return [
        {
            "day_of_week": d,
            "is_open": d not in closed_days,
            "open_time": None if d in closed_days else open_time,
            "close_time": None if d in closed_days else close_time,
        }
        for d in range(7)
    ]


DEMO_CLINICS = [
    dict(
        name="PetWise Central Veterinary Clinic",
        city="Tiberias",
        address="Demo location — Tiberias",
        phone="1-800-PETWISE",
        email=None,
        is_emergency_clinic=True,
        is_open_24_hours=False,
        appointment_duration_minutes=30,
        opening_hours=_week("08:00", "18:00", closed_days=(5, 6)),
        services=["General Checkup", "Vaccination", "Dental Care", "Health Follow-up", "Emergency Consultation"],
    ),
    dict(
        name="Lake Veterinary Center",
        city="Kinneret Area",
        address="Demo location — Kinneret Area",
        phone=None,
        email=None,
        is_emergency_clinic=False,
        is_open_24_hours=False,
        appointment_duration_minutes=30,
        opening_hours=_week("09:00", "17:00", closed_days=(6,)),
        services=["General Checkup", "Vaccination", "Grooming Consultation", "Nutrition Consultation"],
    ),
    dict(
        name="North Pet Care Clinic",
        city="Nazareth",
        address="Demo location — Nazareth",
        phone=None,
        email=None,
        is_emergency_clinic=False,
        is_open_24_hours=False,
        appointment_duration_minutes=45,
        opening_hours=_week("08:30", "19:00", closed_days=(0,)),
        services=["General Checkup", "Vaccination", "Health Follow-up", "Dental Care"],
    ),
]


def seed(db: Database) -> None:
    create_indexes(db)

    if db.clinics.count_documents({}) == 0:
        db.clinics.insert_many([new_document(db, "clinics", **c) for c in DEMO_CLINICS])
        print(f"Added {len(DEMO_CLINICS)} demo clinics.")

    if settings.admin_email and settings.admin_password:
        email = settings.admin_email.strip().lower()
        if db.users.find_one({"email": email}) is None:
            db.users.insert_one(
                new_document(
                    db,
                    "users",
                    full_name=settings.admin_name,
                    email=email,
                    password_hash=hash_password(settings.admin_password),
                    phone=None,
                    role=Role.ADMIN.value,
                    clinic_id=None,
                    department=None,
                )
            )
            print(f"Created admin account {email}.")


if __name__ == "__main__":
    seed(get_db())
    print("Seed finished.")
