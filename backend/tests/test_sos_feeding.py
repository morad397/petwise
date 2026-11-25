"""SOS emergency settings + first-aid guides, and the feeding schedule with its "fed today" log."""

from tests.conftest import auth_headers

GUIDE = {"title": "Bee sting", "summary": "Swelling after a sting", "instructions": ["Remove the stinger", "Call a vet"]}


# ---------------- emergency settings ----------------

def test_settings_public_read_admin_write(client, admin_headers):
    default = client.get("/api/emergency/settings").json()
    assert default["emergencyPhone"] == "" and "veterinarian" in default["emergencyDisclaimer"]

    body = {"emergencyPhone": "*3939", "emergencyContactName": "Lake Vet 24/7", "availabilityText": "24/7", "emergencyDisclaimer": "Call a vet."}
    owner = auth_headers(client)
    assert client.put("/api/emergency/settings", headers=owner, json=body).status_code == 403
    assert client.put("/api/emergency/settings", headers=admin_headers, json=body).status_code == 200
    # every user (even logged out) sees the admin's settings
    assert client.get("/api/emergency/settings").json()["emergencyContactName"] == "Lake Vet 24/7"


# ---------------- guides ----------------

def test_guides_crud_and_hidden_guides(client, admin_headers):
    owner = auth_headers(client)
    assert client.post("/api/emergency/guides", headers=owner, json=GUIDE).status_code == 403
    created = client.post("/api/emergency/guides", headers=admin_headers, json=GUIDE)
    assert created.status_code == 201
    gid = created.json()["id"]
    assert [g["title"] for g in client.get("/api/emergency/guides").json()] == ["Bee sting"]

    hidden = client.put(f"/api/emergency/guides/{gid}", headers=admin_headers, json={**GUIDE, "active": False}).json()
    assert hidden["active"] is False
    assert client.get("/api/emergency/guides").json() == []  # public list shows active only
    assert len(client.get("/api/emergency/guides?include_inactive=true").json()) == 1

    assert client.post("/api/emergency/guides", headers=admin_headers, json={**GUIDE, "instructions": []}).status_code == 422
    assert client.post("/api/emergency/guides", headers=admin_headers, json={**GUIDE, "instructions": ["  "]}).status_code == 400
    assert client.delete(f"/api/emergency/guides/{gid}", headers=admin_headers).status_code == 204


def test_seed_adds_starter_guides_once(db):
    from app.seed import seed

    seed(db)
    seed(db)
    guides = list(db.emergency_guides.find())
    assert len(guides) == 4 and all(g["active"] for g in guides)


# ---------------- feeding ----------------

def make_pet(client, headers):
    return client.post("/api/pets", headers=headers, json={"name": "Rex", "species": "dog"}).json()["id"]


def test_feeding_schedule_sorted_by_time(client):
    owner = auth_headers(client)
    pet = make_pet(client, owner)
    url = f"/api/pets/{pet}/feeding"
    client.post(url, headers=owner, json={"mealName": "Dinner", "time": "18:30", "food": "Dry food", "amount": "200 g"})
    client.post(url, headers=owner, json={"mealName": "Breakfast", "time": "07:00", "food": "Wet food"})
    meals = client.get(url, headers=owner).json()
    assert [m["mealName"] for m in meals] == ["Breakfast", "Dinner"] and meals[1]["amount"] == "200 g"
    assert client.post(url, headers=owner, json={"mealName": "X", "time": "25:00", "food": "y"}).status_code == 422

    meal_id = meals[0]["id"]
    assert client.put(f"{url}/{meal_id}", headers=owner, json={"time": "07:30"}).json()["time"] == "07:30"
    assert client.delete(f"{url}/{meal_id}", headers=owner).status_code == 204
    assert len(client.get(url, headers=owner).json()) == 1


def test_fed_today_log_once_per_day_and_undo(client):
    owner = auth_headers(client)
    pet = make_pet(client, owner)
    url = f"/api/pets/{pet}/feeding"
    meal = client.post(url, headers=owner, json={"mealName": "Breakfast", "time": "07:00", "food": "Wet food"}).json()

    fed = client.post(f"{url}/{meal['id']}/fed", headers=owner, json={"date": "2026-11-25"}).json()
    assert fed["fed"] is True and fed["fedByName"] == "Test User" and fed["fedAt"]
    client.post(f"{url}/{meal['id']}/fed", headers=owner, json={"date": "2026-11-25"})  # twice = still one log
    today = client.get(f"{url}?date=2026-11-25", headers=owner).json()[0]
    assert today["fed"] is True
    tomorrow = client.get(f"{url}?date=2026-11-26", headers=owner).json()[0]
    assert tomorrow["fed"] is False  # a new day starts unfed

    undone = client.delete(f"{url}/{meal['id']}/fed?date=2026-11-25", headers=owner).json()
    assert undone["fed"] is False


def test_feeding_permissions_and_cleanup(client, db):
    owner = auth_headers(client)
    pet = make_pet(client, owner)
    url = f"/api/pets/{pet}/feeding"
    meal = client.post(url, headers=owner, json={"mealName": "Breakfast", "time": "07:00", "food": "Wet food"}).json()
    client.post(f"{url}/{meal['id']}/fed", headers=owner, json={"date": "2026-11-25"})

    stranger = auth_headers(client, email="stranger@test.com")
    assert client.get(url, headers=stranger).status_code == 403
    assert client.post(url, headers=stranger, json={"mealName": "X", "time": "08:00", "food": "y"}).status_code == 403
    assert client.post(f"{url}/{meal['id']}/fed", headers=stranger, json={"date": "2026-11-25"}).status_code == 403

    client.delete(f"/api/pets/{pet}", headers=owner)
    assert db.feeding_schedules.count_documents({}) == 0 and db.feeding_logs.count_documents({}) == 0
