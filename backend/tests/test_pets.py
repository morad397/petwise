from tests.conftest import auth_headers

PET = {"name": "Rex", "species": "Dog", "breed": "Husky", "age": 3, "weightKg": 22.5}


def test_pets_require_login(client):
    assert client.get("/api/pets").status_code == 401
    assert client.post("/api/pets", json=PET).status_code == 401


def test_create_list_get_update_delete_pet(client):
    headers = auth_headers(client)

    created = client.post("/api/pets", headers=headers, json=PET)
    assert created.status_code == 201
    pet = created.json()
    assert pet["species"] == "dog"
    assert pet["weightKg"] == 22.5
    pet_id = pet["id"]

    listed = client.get("/api/pets", headers=headers).json()
    assert [p["id"] for p in listed] == [pet_id]

    assert client.get(f"/api/pets/{pet_id}", headers=headers).json()["name"] == "Rex"

    updated = client.put(f"/api/pets/{pet_id}", headers=headers, json={"name": "Rexy", "age": 4})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Rexy"
    assert updated.json()["breed"] == "Husky"  # untouched fields kept

    assert client.delete(f"/api/pets/{pet_id}", headers=headers).status_code == 204
    assert client.get(f"/api/pets/{pet_id}", headers=headers).status_code == 404


def test_pet_validation(client):
    headers = auth_headers(client)
    assert client.post("/api/pets", headers=headers, json={"name": "", "species": "dog"}).status_code == 422
    assert client.post("/api/pets", headers=headers, json={"name": "Nemo", "species": "fish"}).status_code == 422


def test_owner_cannot_touch_another_owners_pet(client):
    alice = auth_headers(client, email="alice@test.com")
    bob = auth_headers(client, email="bob@test.com")
    pet_id = client.post("/api/pets", headers=alice, json=PET).json()["id"]

    assert client.get("/api/pets", headers=bob).json() == []
    assert client.get(f"/api/pets/{pet_id}", headers=bob).status_code == 403
    assert client.put(f"/api/pets/{pet_id}", headers=bob, json={"name": "Stolen"}).status_code == 403
    assert client.delete(f"/api/pets/{pet_id}", headers=bob).status_code == 403
    assert client.get(f"/api/pets/{pet_id}", headers=alice).json()["name"] == "Rex"


def test_admin_can_view_any_pet(client, admin_headers):
    owner = auth_headers(client)
    pet_id = client.post("/api/pets", headers=owner, json=PET).json()["id"]
    assert client.get(f"/api/pets/{pet_id}", headers=admin_headers).status_code == 200
