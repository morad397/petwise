"""MongoDB connection.

Collections (one per class-diagram entity):
  users, clinics, pets, vaccinations, treatments, weights, reminders, appointments, counters

Every document keeps the BaseEntity fields from the class diagrams:
  _id (number), created_at, updated_at, status
"""

from datetime import datetime, timezone

import certifi
from pymongo import ASCENDING, MongoClient, ReturnDocument
from pymongo.database import Database

from app.config import settings


def _make_client() -> MongoClient:
    options = {"serverSelectionTimeoutMS": 8000}
    # Cloud databases (MongoDB Atlas) use TLS; certifi supplies trusted certificates.
    if settings.mongodb_url.startswith("mongodb+srv://"):
        options["tlsCAFile"] = certifi.where()
    # MongoClient connects lazily, on the first real query.
    return MongoClient(settings.mongodb_url, **options)


client = _make_client()


def get_db() -> Database:
    """FastAPI dependency: the PetWise database."""
    return client[settings.mongodb_db]


def now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def next_id(db: Database, collection: str) -> int:
    """Simple auto-increment ids (1, 2, 3, ...) so URLs stay short, e.g. /pets/3."""
    counter = db.counters.find_one_and_update(
        {"_id": collection},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return counter["seq"]


def new_document(db: Database, collection: str, **fields) -> dict:
    """Builds a document with the BaseEntity fields filled in."""
    timestamp = now()
    return {
        "_id": next_id(db, collection),
        "created_at": timestamp,
        "updated_at": timestamp,
        "status": fields.pop("status", "ACTIVE"),
        **fields,
    }


def to_out(doc):
    """MongoDB stores the id as `_id`; the API returns it as `id`."""
    if doc is None:
        return None
    out = dict(doc)
    out["id"] = out.pop("_id")
    return out


def create_indexes(db: Database) -> None:
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.pets.create_index([("owner_id", ASCENDING)])
    for records in ("vaccinations", "treatments", "weights"):
        db[records].create_index([("pet_id", ASCENDING)])
    db.reminders.create_index([("user_id", ASCENDING), ("due_date", ASCENDING)])
    db.appointments.create_index([("user_id", ASCENDING)])
    db.appointments.create_index([("clinic_id", ASCENDING), ("appointment_date", ASCENDING)])
