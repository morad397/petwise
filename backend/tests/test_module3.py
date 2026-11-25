"""Module 3: clinic staff schedule (block / unblock time slots)."""

from tests.conftest import auth_headers
from tests.test_module2 import FUTURE, PET, book, open_clinic, staff_for


def setup(client, db):
    clinic_id = open_clinic(db)  # open every day 09:00-11:00, 30 min slots
    vet = staff_for(client, clinic_id)
    owner = auth_headers(client, email="owner@test.com")
    pet_id = client.post("/api/pets", headers=owner, json=PET).json()["id"]
    return clinic_id, vet, owner, pet_id


def test_day_schedule_shows_free_booked_and_blocked(client, db):
    clinic_id, vet, owner, pet_id = setup(client, db)
    book(client, owner, pet_id, clinic_id, "09:30")
    client.post("/api/staff/schedule/blocks", headers=vet, json={"date": FUTURE, "time": "10:00", "reason": "Lunch"})

    day = client.get(f"/api/staff/schedule?date={FUTURE}", headers=vet).json()
    assert day["isOpen"] is True
    states = {s["time"]: s for s in day["slots"]}
    assert states["09:00"]["state"] == "AVAILABLE"
    assert states["09:30"]["state"] == "BOOKED" and states["09:30"]["petName"] == "Rex"
    assert states["10:00"]["state"] == "BLOCKED" and states["10:00"]["reason"] == "Lunch"


def test_blocked_time_cannot_be_booked_and_unblock_frees_it(client, db):
    clinic_id, vet, owner, pet_id = setup(client, db)
    block = client.post("/api/staff/schedule/blocks", headers=vet, json={"date": FUTURE, "time": "09:00"}).json()

    assert "09:00" not in client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}").json()["slots"]
    assert book(client, owner, pet_id, clinic_id, "09:00").status_code == 409

    assert client.delete(f"/api/staff/schedule/blocks/{block['id']}", headers=vet).status_code == 204
    assert book(client, owner, pet_id, clinic_id, "09:00").status_code == 201


def test_cannot_block_booked_invalid_or_duplicate_time(client, db):
    clinic_id, vet, owner, pet_id = setup(client, db)
    book(client, owner, pet_id, clinic_id, "09:30")
    url = "/api/staff/schedule/blocks"
    assert client.post(url, headers=vet, json={"date": FUTURE, "time": "09:30"}).status_code == 409  # booked
    assert client.post(url, headers=vet, json={"date": FUTURE, "time": "09:15"}).status_code == 400  # not a slot
    assert client.post(url, headers=vet, json={"date": FUTURE, "time": "10:30"}).status_code == 201
    assert client.post(url, headers=vet, json={"date": FUTURE, "time": "10:30"}).status_code == 409  # twice


def test_schedule_is_per_clinic_and_staff_only(client, db):
    clinic_id, vet, owner, _ = setup(client, db)
    other_vet = staff_for(client, open_clinic(db, "Other"), "other@test.com")
    block = client.post("/api/staff/schedule/blocks", headers=vet, json={"date": FUTURE, "time": "09:00"}).json()

    # another clinic's staff sees their own (free) schedule and cannot remove this block
    other_day = client.get(f"/api/staff/schedule?date={FUTURE}", headers=other_vet).json()
    assert all(s["state"] == "AVAILABLE" for s in other_day["slots"])
    assert client.delete(f"/api/staff/schedule/blocks/{block['id']}", headers=other_vet).status_code == 404

    # owners have no access
    assert client.get(f"/api/staff/schedule?date={FUTURE}", headers=owner).status_code == 403


def test_staff_without_clinic(client, db):
    vet = auth_headers(client, email="nobody@test.com", role="CLINIC_STAFF")
    assert client.get(f"/api/staff/schedule?date={FUTURE}", headers=vet).status_code == 400
