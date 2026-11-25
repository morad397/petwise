"""Module 5: notifications on events, admin dashboard numbers, reported posts, activity log."""

from tests.conftest import auth_headers
from tests.test_module2 import FUTURE, PET, book, open_clinic, staff_for
from tests.test_module4 import ADDRESS, add_product, put_cart


def notes(client, headers):
    return client.get("/api/notifications", headers=headers).json()


# ---------------- notifications ----------------

def test_appointment_events_notify_staff_and_owner(client, db):
    clinic_id = open_clinic(db)
    vet = staff_for(client, clinic_id)
    owner = auth_headers(client, email="owner@test.com")
    pet_id = client.post("/api/pets", headers=owner, json=PET).json()["id"]

    appt_id = book(client, owner, pet_id, clinic_id, "09:00").json()["id"]
    staff_inbox = notes(client, vet)
    assert staff_inbox["unreadCount"] == 1
    assert staff_inbox["items"][0]["type"] == "APPOINTMENT_REQUEST" and "Rex" in staff_inbox["items"][0]["title"]

    client.post(f"/api/appointments/{appt_id}/status", headers=vet, json={"status": "CONFIRMED"})
    owner_inbox = notes(client, owner)
    assert owner_inbox["items"][0]["type"] == "APPOINTMENT_CONFIRMED" and owner_inbox["items"][0]["link"] == "/appointments"

    client.post(f"/api/appointments/{appt_id}/status", headers=vet, json={"status": "IN_PROGRESS"})
    assert notes(client, owner)["unreadCount"] == 1  # nothing sent for "in progress"

    client.post(f"/api/appointments/{appt_id}/status", headers=vet, json={"status": "COMPLETED", "note": "All good"})
    latest = notes(client, owner)["items"][0]
    assert latest["type"] == "APPOINTMENT_COMPLETED" and "All good" in latest["message"]
    assert latest["link"] == f"/pets/{pet_id}/vet-visits"


def test_owner_cancel_notifies_only_that_clinic(client, db):
    clinic_a, clinic_b = open_clinic(db, "A"), open_clinic(db, "B")
    vet_a, vet_b = staff_for(client, clinic_a, "a@test.com"), staff_for(client, clinic_b, "b@test.com")
    owner = auth_headers(client, email="owner@test.com")
    pet_id = client.post("/api/pets", headers=owner, json=PET).json()["id"]
    appt_id = book(client, owner, pet_id, clinic_a, "09:00").json()["id"]
    client.post(f"/api/appointments/{appt_id}/cancel", headers=owner)
    assert [n["type"] for n in notes(client, vet_a)["items"]] == ["APPOINTMENT_CANCELLED", "APPOINTMENT_REQUEST"]
    assert notes(client, vet_b)["items"] == []


def test_order_status_notifies_buyer(client, db, admin_headers):
    buyer = auth_headers(client, email="buyer@test.com")
    put_cart(client, buyer, add_product(db), 1)
    oid = client.post("/api/orders", headers=buyer, json={"shippingAddress": ADDRESS, "paymentMethod": "TEST_PAYMENT"}).json()["id"]
    client.post(f"/api/orders/{oid}/status", headers=admin_headers, json={"status": "SHIPPED"})
    item = notes(client, buyer)["items"][0]
    assert item["type"] == "ORDER_SHIPPED" and f"#{oid}" in item["title"] and item["link"] == "/orders"


def test_comment_notifies_author_but_not_self(client):
    author = auth_headers(client, email="author@test.com")
    other = auth_headers(client, email="other@test.com")
    post_id = client.post("/api/posts", headers=author, json={"content": "Hi"}).json()["id"]
    client.post(f"/api/posts/{post_id}/comments", headers=author, json={"content": "my own"})
    assert notes(client, author)["items"] == []
    client.post(f"/api/posts/{post_id}/comments", headers=other, json={"content": "Cute"})
    assert notes(client, author)["items"][0]["type"] == "NEW_COMMENT"


def test_read_read_all_delete_and_privacy(client, db):
    from app.services.notify import notify

    user = auth_headers(client, email="u@test.com")
    other = auth_headers(client, email="o@test.com")
    uid = db.users.find_one({"email": "u@test.com"})["_id"]
    notify(db, uid, type="TEST", title="One")
    notify(db, uid, type="TEST", title="Two")
    inbox = notes(client, user)
    assert inbox["unreadCount"] == 2
    first_id = inbox["items"][0]["id"]

    assert client.post(f"/api/notifications/{first_id}/read", headers=user).json()["isRead"] is True
    assert notes(client, user)["unreadCount"] == 1
    # someone else cannot touch it
    assert client.post(f"/api/notifications/{first_id}/read", headers=other).status_code == 404
    assert client.delete(f"/api/notifications/{first_id}", headers=other).status_code == 404

    assert client.post("/api/notifications/read-all", headers=user).json() == {"updated": 1}
    assert client.delete(f"/api/notifications/{first_id}", headers=user).status_code == 204
    assert len(notes(client, user)["items"]) == 1


# ---------------- admin ----------------

def test_admin_stats(client, db, admin_headers):
    owner = auth_headers(client, email="owner@test.com")
    client.post("/api/pets", headers=owner, json=PET)
    put_cart(client, owner, add_product(db, price=20, stock=3), 2)
    add_product(db, "Empty", stock=0)
    client.post("/api/orders", headers=owner, json={"shippingAddress": ADDRESS, "paymentMethod": "TEST_PAYMENT"})

    stats = client.get("/api/admin/stats", headers=admin_headers).json()
    assert stats["usersTotal"] == 2 and stats["usersByRole"]["ADMIN"] == 1 and stats["usersByRole"]["PET_OWNER"] == 1
    assert stats["petsTotal"] == 1
    assert stats["ordersTotal"] == 1 and stats["revenuePaid"] == 40.0
    assert stats["lowStockProducts"] == 1 and stats["outOfStockProducts"] == 1  # 3-2=1 left, and "Empty"
    assert stats["recentUsers"][0]["email"] == "owner@test.com"
    assert client.get("/api/admin/stats", headers=owner).status_code == 403


def test_reports_review_dismiss_and_remove(client, db, admin_headers):
    author = auth_headers(client, email="author@test.com")
    reporter = auth_headers(client, email="rep@test.com")
    p1 = client.post("/api/posts", headers=author, json={"content": "spam"}).json()["id"]
    p2 = client.post("/api/posts", headers=author, json={"content": "fine"}).json()["id"]
    client.post(f"/api/posts/{p1}/report", headers=reporter, json={"reason": "Spam"})
    client.post(f"/api/posts/{p2}/report", headers=reporter, json={"reason": "Not sure"})

    reports = client.get("/api/admin/reports", headers=admin_headers).json()
    assert {r["postId"] for r in reports} == {p1, p2}
    assert client.get("/api/admin/stats", headers=admin_headers).json()["openReports"] == 2

    assert client.delete(f"/api/admin/reports/{p2}", headers=admin_headers).status_code == 204  # dismiss
    assert client.delete(f"/api/posts/{p1}", headers=admin_headers).status_code == 204  # remove post
    assert client.get("/api/admin/reports", headers=admin_headers).json() == []
    assert notes(client, author)["items"][0]["type"] == "POST_REMOVED"
    assert client.get("/api/admin/reports", headers=author).status_code == 403


def test_activity_log_records_admin_actions(client, db, admin_headers):
    owner_res = client.post("/api/auth/register", json={"fullName": "Bob", "email": "bob@test.com", "password": "secret123", "role": "PET_OWNER"})
    bob_id = owner_res.json()["user"]["id"]
    client.patch(f"/api/users/{bob_id}", headers=admin_headers, json={"status": "SUSPENDED"})
    client.post("/api/products", headers=admin_headers, json={"name": "Bed", "category": "Beds", "price": 65, "stockQuantity": 3})

    log = client.get("/api/admin/activity", headers=admin_headers).json()
    assert [a["action"] for a in log] == ["Product Created", "User Updated"]
    assert "status ACTIVE -> SUSPENDED" in log[1]["target"] and log[1]["actorName"] == "Someone"  # conftest admin
    # non-admins cannot read the log
    owner = auth_headers(client, email="owner@test.com")
    assert client.get("/api/admin/activity", headers=owner).status_code == 403
