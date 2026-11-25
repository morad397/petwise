"""Starting data for an empty database.

This runs automatically every time the server starts (and is safe to repeat):
- creates the indexes (unique email, ...)
- adds the 3 demo clinics if there are no clinics yet
- adds the 8 demo shop products if there are no products yet
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


# Starter products (the ones the shop prototype showed). "asset:" images are bundled with the frontend.
DEMO_PRODUCTS = [
    ("Premium Pet Shampoo", "Grooming", 18, 15, "asset:shop-shampoo", "Gentle, soothing wash for a shiny, healthy coat."),
    ("Interactive Rubber Ball", "Toys", 12, 45, "asset:shop-toy", "Durable, bouncy toy perfect for fetch and playtime."),
    ("Healthy Dry Pet Food", "Food", 45, 5, "asset:shop-food", "Nutrient-rich, balanced meal for optimal health."),
    ("Cozy Knitted Sweater", "Accessories", 24, 12, "asset:shop-clothes", "Keep your pet warm and stylish in cold weather."),
    ("Luxurious Plush Pet Bed", "Beds", 65, 0, "asset:shop-bed", "Ultra-soft, comfortable bed for perfect sleep."),
    ("Cat Litter Tray", "Accessories", 22, 8,
     "https://images.unsplash.com/photo-1615461066841-211d7a4166b5?auto=format&fit=crop&w=900&q=80",
     "Easy-clean enclosure for daily care."),
    ("Dog Leash & Collar", "Accessories", 21, 24,
     "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=900&q=80",
     "Comfortable everyday walking set."),
    ("Dog Bath Set", "Grooming", 19, 0,
     "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80",
     "Cleaning essentials for grooming and hygiene."),
]


def seed(db: Database) -> None:
    create_indexes(db)

    if db.products.count_documents({}) == 0:
        db.products.insert_many(
            [
                new_document(
                    db, "products", name=name, category=category, price=float(price), stock_quantity=stock,
                    image_url=image, description=description,
                )
                for name, category, price, stock, image, description in DEMO_PRODUCTS
            ]
        )
        print(f"Added {len(DEMO_PRODUCTS)} demo products.")

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
