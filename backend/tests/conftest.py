"""Test setup: every test gets a fresh in-memory fake MongoDB (mongomock),
so tests never touch the real database."""

import mongomock
import pytest
from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.database import create_indexes, get_db, new_document
from app.main import app


@pytest.fixture()
def db():
    database = mongomock.MongoClient()["petwise_test"]
    create_indexes(database)
    return database


@pytest.fixture()
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    # Not using "with TestClient(...)" on purpose: that would run the startup
    # hook, which connects to the real database.
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture()
def clinic_id(db):
    clinic = new_document(
        db, "clinics", name="Test Clinic", city="Tiberias", opening_hours=[], services=["Vaccination"]
    )
    db.clinics.insert_one(clinic)
    return clinic["_id"]


def add_user(db, email, password, role):
    db.users.insert_one(
        new_document(
            db, "users", full_name="Someone", email=email,
            password_hash=hash_password(password), role=role, clinic_id=None, department=None,
        )
    )


@pytest.fixture()
def admin_headers(client, db):
    add_user(db, "admin@test.com", "adminpass", "ADMIN")
    res = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "adminpass"})
    return {"Authorization": f"Bearer {res.json()['accessToken']}"}


def register(client, email="owner@test.com", password="secret123", role="PET_OWNER", **extra):
    body = {"fullName": "Test User", "email": email, "password": password, "role": role, **extra}
    return client.post("/api/auth/register", json=body)


def auth_headers(client, email="owner@test.com", **kwargs):
    res = register(client, email=email, **kwargs)
    assert res.status_code == 201, res.text
    return {"Authorization": f"Bearer {res.json()['accessToken']}"}
