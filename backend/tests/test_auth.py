from tests.conftest import auth_headers, register


def test_register_returns_token_and_camelcase_user(client):
    res = register(client, email="  New@Test.com ")
    assert res.status_code == 201
    body = res.json()
    assert body["accessToken"]
    assert body["user"]["email"] == "new@test.com"
    assert body["user"]["fullName"] == "Test User"
    assert body["user"]["role"] == "PET_OWNER"
    assert "passwordHash" not in body["user"]


def test_register_duplicate_email_rejected(client):
    register(client)
    res = register(client)
    assert res.status_code == 409


def test_cannot_self_register_as_admin(client):
    res = register(client, role="ADMIN")
    assert res.status_code == 422


def test_staff_register_with_clinic(client, clinic_id):
    res = register(client, email="vet@test.com", role="CLINIC_STAFF", clinicId=clinic_id, department="Surgery")
    assert res.status_code == 201
    user = res.json()["user"]
    assert user["clinicId"] == clinic_id
    assert user["department"] == "Surgery"


def test_staff_register_with_unknown_clinic_rejected(client):
    res = register(client, email="vet@test.com", role="CLINIC_STAFF", clinicId=999)
    assert res.status_code == 400


def test_login_correct_and_wrong_password(client):
    register(client, password="secret123")
    ok = client.post("/api/auth/login", json={"email": "owner@test.com", "password": "secret123"})
    assert ok.status_code == 200
    assert ok.json()["user"]["email"] == "owner@test.com"

    bad = client.post("/api/auth/login", json={"email": "owner@test.com", "password": "wrong"})
    assert bad.status_code == 401
    unknown = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "x"})
    assert unknown.status_code == 401
    assert bad.json()["detail"] == unknown.json()["detail"]


def test_me_requires_valid_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401

    headers = auth_headers(client)
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "owner@test.com"


def test_update_me_cannot_change_role(client):
    headers = auth_headers(client)
    res = client.put("/api/auth/me", headers=headers, json={"fullName": "Renamed", "role": "ADMIN"})
    assert res.status_code == 200
    assert res.json()["fullName"] == "Renamed"
    assert res.json()["role"] == "PET_OWNER"


def test_admin_only_user_list(client, admin_headers):
    owner = auth_headers(client)
    assert client.get("/api/users", headers=owner).status_code == 403
    res = client.get("/api/users", headers=admin_headers)
    assert res.status_code == 200
    assert {u["email"] for u in res.json()} == {"admin@test.com", "owner@test.com"}


def test_admin_creates_staff_user_who_can_log_in(client, admin_headers, clinic_id):
    body = {"fullName": "Dr. Vet", "email": "vet@test.com", "password": "vetpass1", "role": "CLINIC_STAFF"}
    # staff without a clinic is rejected
    assert client.post("/api/users", headers=admin_headers, json=body).status_code == 400

    res = client.post("/api/users", headers=admin_headers, json={**body, "clinicId": clinic_id})
    assert res.status_code == 201
    assert res.json()["clinicId"] == clinic_id
    login = client.post("/api/auth/login", json={"email": "vet@test.com", "password": "vetpass1"})
    assert login.status_code == 200
    assert login.json()["user"]["role"] == "CLINIC_STAFF"


def test_non_admin_cannot_create_users(client):
    owner = auth_headers(client)
    body = {"fullName": "X", "email": "x@test.com", "password": "secret123", "role": "ADMIN"}
    assert client.post("/api/users", headers=owner, json=body).status_code == 403


def test_admin_suspends_user_and_login_blocked(client, admin_headers):
    register(client)
    users = client.get("/api/users", headers=admin_headers).json()
    owner_id = next(u["id"] for u in users if u["email"] == "owner@test.com")

    res = client.patch(f"/api/users/{owner_id}", headers=admin_headers, json={"status": "SUSPENDED"})
    assert res.status_code == 200
    login = client.post("/api/auth/login", json={"email": "owner@test.com", "password": "secret123"})
    assert login.status_code == 403


def test_seeded_admin_with_special_use_domain_can_log_in(client, db):
    """Seed-created accounts may use addresses like admin@petwise.test."""
    from tests.conftest import add_user

    add_user(db, "admin@petwise.test", "pw123456", "ADMIN")
    res = client.post("/api/auth/login", json={"email": "admin@petwise.test", "password": "pw123456"})
    assert res.status_code == 200
    assert res.json()["user"]["email"] == "admin@petwise.test"


def test_admin_deleting_user_also_deletes_their_pets(client, admin_headers, db):
    owner = auth_headers(client)
    client.post("/api/pets", headers=owner, json={"name": "Rex", "species": "dog"})
    owner_id = db.users.find_one({"email": "owner@test.com"})["_id"]
    assert client.delete(f"/api/users/{owner_id}", headers=admin_headers).status_code == 204
    assert db.pets.count_documents({}) == 0
