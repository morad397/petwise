"""Module 2: medical records, reminders, appointments (Agile iteration 2)."""

from datetime import date, timedelta

import pytest

from app.database import new_document
from tests.conftest import auth_headers

FUTURE = (date.today() + timedelta(days=7)).isoformat()
PET = {"name": "Rex", "species": "dog"}


def open_clinic(db, name="Open Clinic"):
    clinic = new_document(
        db,
        "clinics",
        name=name,
        city="Tiberias",
        appointment_duration_minutes=30,
        is_open_24_hours=False,
        opening_hours=[
            {"day_of_week": d, "is_open": True, "open_time": "09:00", "close_time": "11:00"} for d in range(7)
        ],
        services=["Vaccination", "General Checkup"],
    )
    db.clinics.insert_one(clinic)
    return clinic["_id"]


@pytest.fixture()
def owner(client):
    headers = auth_headers(client, email="owner@test.com")
    pet_id = client.post("/api/pets", headers=headers, json=PET).json()["id"]
    return headers, pet_id


def staff_for(client, clinic_id, email="vet@test.com"):
    return auth_headers(client, email=email, role="CLINIC_STAFF", clinicId=clinic_id)


def book(client, headers, pet_id, clinic_id, time="09:00", day=FUTURE, service="Vaccination"):
    return client.post(
        "/api/appointments",
        headers=headers,
        json={"petId": pet_id, "clinicId": clinic_id, "service": service, "appointmentDate": day, "appointmentTime": time},
    )


# ---------------- medical records ----------------

def test_vaccination_crud_and_automatic_reminder(client, owner):
    headers, pet_id = owner
    res = client.post(
        f"/api/pets/{pet_id}/vaccinations",
        headers=headers,
        json={"vaccineName": "Rabies", "dateAdministered": "2026-01-10", "nextDueDate": "2027-01-10"},
    )
    assert res.status_code == 201
    vac_id = res.json()["id"]
    assert client.get(f"/api/pets/{pet_id}/vaccinations", headers=headers).json()[0]["vaccineName"] == "Rabies"

    reminders = client.get("/api/reminders", headers=headers).json()
    assert len(reminders) == 1
    assert reminders[0]["type"] == "VACCINATION"
    assert reminders[0]["dueDate"].startswith("2027-01-10")

    client.put(f"/api/pets/{pet_id}/vaccinations/{vac_id}", headers=headers, json={"nextDueDate": "2027-02-01"})
    assert client.get("/api/reminders", headers=headers).json()[0]["dueDate"].startswith("2027-02-01")

    assert client.delete(f"/api/pets/{pet_id}/vaccinations/{vac_id}", headers=headers).status_code == 204
    assert client.get("/api/reminders", headers=headers).json() == []


def test_vaccination_due_date_must_be_after_given_date(client, owner):
    headers, pet_id = owner
    res = client.post(
        f"/api/pets/{pet_id}/vaccinations",
        headers=headers,
        json={"vaccineName": "Rabies", "dateAdministered": "2026-05-01", "nextDueDate": "2026-01-01"},
    )
    assert res.status_code == 422


def test_weight_entries_update_pet_weight(client, owner):
    headers, pet_id = owner
    client.post(f"/api/pets/{pet_id}/weights", headers=headers, json={"weightKg": 20, "recordedDate": "2026-01-01"})
    client.post(f"/api/pets/{pet_id}/weights", headers=headers, json={"weightKg": 22.5, "recordedDate": "2026-03-01"})
    client.post(f"/api/pets/{pet_id}/weights", headers=headers, json={"weightKg": 21, "recordedDate": "2026-02-01"})
    assert client.get(f"/api/pets/{pet_id}", headers=headers).json()["weightKg"] == 22.5
    weights = client.get(f"/api/pets/{pet_id}/weights", headers=headers).json()
    assert [w["weightKg"] for w in weights] == [22.5, 21, 20]  # newest first


def test_treatments_medication_and_vet_visit(client, owner):
    headers, pet_id = owner
    for kind, title in [("MEDICATION", "Ear infection"), ("VET_VISIT", "Annual checkup")]:
        res = client.post(
            f"/api/pets/{pet_id}/treatments",
            headers=headers,
            json={"kind": kind, "diagnosis": title, "treatmentDate": "2026-04-01", "medication": "Drops"},
        )
        assert res.status_code == 201
    assert {t["kind"] for t in client.get(f"/api/pets/{pet_id}/treatments", headers=headers).json()} == {
        "MEDICATION",
        "VET_VISIT",
    }


def test_other_owner_cannot_see_records(client, owner):
    _, pet_id = owner
    stranger = auth_headers(client, email="stranger@test.com")
    assert client.get(f"/api/pets/{pet_id}/vaccinations", headers=stranger).status_code == 403
    res = client.post(
        f"/api/pets/{pet_id}/weights", headers=stranger, json={"weightKg": 5, "recordedDate": "2026-01-01"}
    )
    assert res.status_code == 403


def test_staff_access_to_records_only_for_their_patients(client, db, owner):
    headers, pet_id = owner
    clinic_a, clinic_b = open_clinic(db, "A"), open_clinic(db, "B")
    vet_a, vet_b = staff_for(client, clinic_a, "a@test.com"), staff_for(client, clinic_b, "b@test.com")

    # before any appointment, staff cannot see the pet
    assert client.get(f"/api/pets/{pet_id}", headers=vet_a).status_code == 403

    book(client, headers, pet_id, clinic_a)
    assert client.get(f"/api/pets/{pet_id}", headers=vet_a).status_code == 200
    assert client.get(f"/api/pets/{pet_id}", headers=vet_b).status_code == 403

    res = client.post(
        f"/api/pets/{pet_id}/treatments",
        headers=vet_a,
        json={"kind": "VET_VISIT", "diagnosis": "Exam", "treatmentDate": "2026-04-01"},
    )
    assert res.status_code == 201
    assert res.json()["createdByName"] == "Test User"
    # staff cannot edit the pet itself
    assert client.put(f"/api/pets/{pet_id}", headers=vet_a, json={"name": "X"}).status_code == 403


# ---------------- reminders ----------------

def test_reminder_crud_complete_snooze(client, owner):
    headers, pet_id = owner
    res = client.post(
        "/api/reminders",
        headers=headers,
        json={"type": "FEEDING", "title": "Dinner", "dueDate": "2026-12-01T18:00", "petId": pet_id},
    )
    assert res.status_code == 201
    rem = res.json()
    assert rem["petName"] == "Rex" and rem["isCompleted"] is False

    snoozed = client.post(f"/api/reminders/{rem['id']}/snooze", headers=headers, json={"minutes": 30}).json()
    assert snoozed["dueDate"].startswith("2026-12-01T18:30")

    done = client.post(f"/api/reminders/{rem['id']}/complete", headers=headers).json()
    assert done["isCompleted"] is True
    assert client.get("/api/reminders?include_completed=false", headers=headers).json() == []

    assert client.delete(f"/api/reminders/{rem['id']}", headers=headers).status_code == 204


def test_reminders_are_private(client, owner):
    headers, pet_id = owner
    rem_id = client.post(
        "/api/reminders", headers=headers, json={"title": "Walk", "dueDate": "2026-12-01T08:00"}
    ).json()["id"]
    other = auth_headers(client, email="other@test.com")
    assert client.get("/api/reminders", headers=other).json() == []
    assert client.delete(f"/api/reminders/{rem_id}", headers=other).status_code == 404
    # cannot attach someone else's pet
    res = client.post("/api/reminders", headers=other, json={"title": "X", "dueDate": "2026-12-01T08:00", "petId": pet_id})
    assert res.status_code == 400


# ---------------- appointments ----------------

def test_slots_and_no_double_booking(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    slots = client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}").json()
    assert slots == {"status": "AVAILABLE", "slots": ["09:00", "09:30", "10:00", "10:30"]}

    assert book(client, headers, pet_id, clinic_id, "09:30").status_code == 201
    assert "09:30" not in client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}").json()["slots"]

    other = auth_headers(client, email="other@test.com")
    other_pet = client.post("/api/pets", headers=other, json=PET).json()["id"]
    assert book(client, other, other_pet, clinic_id, "09:30").status_code == 409  # taken
    assert book(client, other, other_pet, clinic_id, "09:15").status_code == 409  # not a real slot

    # "after" hides earlier times (used for today's date)
    assert client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}&after=10:00").json()["slots"] == ["10:30"]


def test_booking_validation(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    # missing required fields
    assert client.post("/api/appointments", headers=headers, json={"petId": pet_id}).status_code == 422
    # past date
    assert book(client, headers, pet_id, clinic_id, day="2020-01-01").status_code == 400
    # service the clinic does not offer
    assert book(client, headers, pet_id, clinic_id, service="Surgery").status_code == 400
    # someone else's pet
    other = auth_headers(client, email="other@test.com")
    assert book(client, other, pet_id, clinic_id).status_code == 400


def test_closed_clinic(client, db, owner, clinic_id):
    # the conftest clinic has no opening hours = always closed
    assert client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}").json()["status"] == "CLINIC_CLOSED"


def test_request_visible_only_to_selected_clinic(client, db, owner):
    headers, pet_id = owner
    clinic_a, clinic_b = open_clinic(db, "A"), open_clinic(db, "B")
    book(client, headers, pet_id, clinic_a)
    vet_a, vet_b = staff_for(client, clinic_a, "a@test.com"), staff_for(client, clinic_b, "b@test.com")

    assert len(client.get("/api/appointments", headers=vet_a).json()) == 1
    assert client.get("/api/appointments", headers=vet_b).json() == []
    appt_id = client.get("/api/appointments", headers=vet_a).json()[0]["id"]
    # staff of another clinic cannot act on it
    assert client.post(f"/api/appointments/{appt_id}/status", headers=vet_b, json={"status": "CONFIRMED"}).status_code == 404
    # owners cannot use staff actions
    assert client.post(f"/api/appointments/{appt_id}/status", headers=headers, json={"status": "CONFIRMED"}).status_code == 403


def test_full_flow_confirm_complete_creates_reminder_and_visit(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    appt = book(client, headers, pet_id, clinic_id, "10:00").json()
    assert appt["status"] == "PENDING" and appt["petName"] == "Rex" and appt["clinicName"] == "Open Clinic"
    vet = staff_for(client, clinic_id)

    confirmed = client.post(f"/api/appointments/{appt['id']}/status", headers=vet, json={"status": "CONFIRMED"}).json()
    assert confirmed["status"] == "CONFIRMED"
    reminders = client.get("/api/reminders", headers=headers).json()
    assert reminders[0]["type"] == "APPOINTMENT" and reminders[0]["dueDate"].startswith(f"{FUTURE}T10:00")

    # cannot jump back to confirmed again
    assert client.post(f"/api/appointments/{appt['id']}/status", headers=vet, json={"status": "CONFIRMED"}).status_code == 400

    client.post(f"/api/appointments/{appt['id']}/status", headers=vet, json={"status": "IN_PROGRESS"})
    done = client.post(
        f"/api/appointments/{appt['id']}/status", headers=vet, json={"status": "COMPLETED", "note": "All good"}
    ).json()
    assert done["status"] == "COMPLETED" and done["staffNote"] == "All good"

    visits = client.get(f"/api/pets/{pet_id}/treatments", headers=headers).json()
    assert visits[0]["kind"] == "VET_VISIT" and visits[0]["appointmentId"] == appt["id"] and visits[0]["notes"] == "All good"
    assert client.get("/api/reminders", headers=headers).json() == []  # appointment reminder removed
    # completed appointments are locked for the owner
    assert client.post(f"/api/appointments/{appt['id']}/cancel", headers=headers).status_code == 400


def test_reschedule_suggestion_and_accept(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    appt_id = book(client, headers, pet_id, clinic_id, "09:00").json()["id"]
    vet = staff_for(client, clinic_id)

    # a suggestion needs a date and time
    assert client.post(f"/api/appointments/{appt_id}/status", headers=vet, json={"status": "RESCHEDULE_REQUESTED"}).status_code == 422
    res = client.post(
        f"/api/appointments/{appt_id}/status",
        headers=vet,
        json={"status": "RESCHEDULE_REQUESTED", "suggestedDate": FUTURE, "suggestedTime": "10:30", "note": "Doctor busy"},
    )
    assert res.status_code == 200 and res.json()["suggestedTime"] == "10:30"
    # the suggested slot is held
    assert "10:30" not in client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}").json()["slots"]

    accepted = client.post(f"/api/appointments/{appt_id}/accept-suggestion", headers=headers).json()
    assert accepted["status"] == "CONFIRMED" and accepted["appointmentTime"] == "10:30" and accepted["suggestedTime"] is None


def test_owner_edit_goes_back_to_pending_and_cancel(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    appt_id = book(client, headers, pet_id, clinic_id, "09:00").json()["id"]
    vet = staff_for(client, clinic_id)
    client.post(f"/api/appointments/{appt_id}/status", headers=vet, json={"status": "CONFIRMED"})

    # moving to own current time is fine (own slot is excluded)
    edited = client.put(f"/api/appointments/{appt_id}", headers=headers, json={"appointmentTime": "09:30"}).json()
    assert edited["status"] == "PENDING" and edited["appointmentTime"] == "09:30"
    assert client.get("/api/reminders", headers=headers).json() == []

    cancelled = client.post(f"/api/appointments/{appt_id}/cancel", headers=headers).json()
    assert cancelled["status"] == "CANCELLED"
    # the slot is free again
    assert "09:30" in client.get(f"/api/clinics/{clinic_id}/slots?date={FUTURE}").json()["slots"]


def test_staff_patients_list(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    vet = staff_for(client, clinic_id)
    assert client.get("/api/staff/patients", headers=vet).json() == []
    book(client, headers, pet_id, clinic_id, "09:00")
    book(client, headers, pet_id, clinic_id, "10:00")
    patients = client.get("/api/staff/patients", headers=vet).json()
    assert len(patients) == 1
    assert patients[0]["name"] == "Rex" and patients[0]["ownerName"] == "Test User" and patients[0]["appointmentCount"] == 2
    assert client.get("/api/staff/patients", headers=headers).status_code == 403


def test_deleting_pet_removes_records_and_cancels_appointments(client, db, owner):
    headers, pet_id = owner
    clinic_id = open_clinic(db)
    client.post(f"/api/pets/{pet_id}/weights", headers=headers, json={"weightKg": 5, "recordedDate": "2026-01-01"})
    appt_id = book(client, headers, pet_id, clinic_id).json()["id"]
    assert client.delete(f"/api/pets/{pet_id}", headers=headers).status_code == 204
    assert db.weights.count_documents({}) == 0
    assert db.appointments.find_one({"_id": appt_id})["status"] == "CANCELLED"
