from tests.conftest import auth_headers

NEW_CLINIC = {
    "name": "Galilee Vet",
    "city": "Safed",
    "appointmentDurationMinutes": 30,
    "openingHours": [{"dayOfWeek": 1, "isOpen": True, "openTime": "09:00", "closeTime": "17:00"}],
    "services": ["Vaccination"],
}


def test_clinic_list_is_public(client, clinic_id):
    res = client.get("/api/clinics")
    assert res.status_code == 200
    assert res.json()[0]["name"] == "Test Clinic"


def test_only_admin_creates_and_updates_clinics(client, admin_headers):
    owner = auth_headers(client)
    assert client.post("/api/clinics", headers=owner, json=NEW_CLINIC).status_code == 403

    created = client.post("/api/clinics", headers=admin_headers, json=NEW_CLINIC)
    assert created.status_code == 201
    body = created.json()
    assert body["openingHours"][0]["openTime"] == "09:00"

    res = client.put(f"/api/clinics/{body['id']}", headers=admin_headers, json={"status": "SUSPENDED"})
    assert res.status_code == 200
    assert res.json()["status"] == "SUSPENDED"
    assert res.json()["name"] == "Galilee Vet"


def test_seed_is_safe_to_run_twice(db):
    from app.seed import seed

    seed(db)
    seed(db)
    assert db.clinics.count_documents({}) == 3
    first = db.clinics.find_one({"_id": 1})
    assert first["opening_hours"][0]["open_time"] == "08:00"
