"""The demo data script runs end to end and --reset removes everything it added."""

from app.config import settings
from app.demo_data import DEMO_DOMAIN, Api, create_demo, reset_demo
from app.seed import seed
from tests.conftest import add_user


def test_demo_data_create_and_reset(client, db, monkeypatch):
    monkeypatch.setattr(settings, "admin_email", "admin@test.com")
    monkeypatch.setattr(settings, "admin_password", "adminpass")
    seed(db)  # also creates the admin from the settings above
    add_user(db, "real.user@gmail.com", "realpass1", "PET_OWNER")  # a real account must survive
    stock_before = {p["_id"]: p["stock_quantity"] for p in db.products.find()}

    api = Api(client)
    create_demo(api, "demo-pass-123")

    demo_users = list(db.users.find({"email": {"$regex": "petwise-demo[.]com$"}}))
    assert len(demo_users) == 4
    assert db.pets.count_documents({}) == 3
    statuses = sorted(a["status"] for a in db.appointments.find())
    assert statuses == ["COMPLETED", "CONFIRMED", "PENDING", "RESCHEDULE_REQUESTED"]
    assert db.orders.count_documents({}) == 2
    assert db.posts.count_documents({}) == 4 and db.post_reports.count_documents({}) == 1
    assert db.vaccinations.count_documents({}) == 4 and db.feeding_logs.count_documents({}) == 3
    assert db.notifications.count_documents({}) > 0  # events created notifications
    # demo users can log in with the demo password
    assert api.login("dana.levi" + DEMO_DOMAIN, "demo-pass-123")

    reset_demo(api, db)
    assert db.users.count_documents({"email": {"$regex": "petwise-demo[.]com$"}}) == 0
    for collection in ("pets", "appointments", "orders", "posts", "comments", "post_reports", "vaccinations",
                       "feeding_schedules", "feeding_logs", "reminders", "carts"):
        assert db[collection].count_documents({}) == 0, collection
    assert db.users.find_one({"email": "real.user@gmail.com"}) is not None
    assert {p["_id"]: p["stock_quantity"] for p in db.products.find()} == stock_before  # stock given back
