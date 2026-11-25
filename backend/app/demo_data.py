"""Fills the database with demo data for presentations.

Run from the backend folder:
    python -m app.demo_data           # add demo data (skips if it already exists)
    python -m app.demo_data --reset   # remove all demo data again

It goes through the real API (in-process), so every normal rule applies: stock goes down
on orders, reminders and notifications are created, permissions are checked.

All demo accounts use emails ending in @petwise-demo.com and the password from
DEMO_PASSWORD in backend/.env. Your real accounts are never touched.
It needs ADMIN_EMAIL / ADMIN_PASSWORD in .env (the admin performs the admin steps).
"""

import os
import sys
from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app
from app.seed import seed

DEMO_DOMAIN = "@petwise-demo.com"

OWNERS = [
    ("Dana Levi", "dana.levi"),
    ("Yossi Cohen", "yossi.cohen"),
]
STAFF = [  # (name, email user, clinic name, department)
    ("Dr. Noa Katz", "dr.noa", "Lake Veterinary Center", "General Medicine"),
    ("Dr. Amir Haddad", "dr.amir", "PetWise Central Veterinary Clinic", "Emergency"),
]


class Api:
    """Small helper around the in-process API client."""

    def __init__(self, client: TestClient):
        self.client = client

    def call(self, method: str, path: str, token: str = None, body=None, ok=(200, 201, 204)):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        res = self.client.request(method, f"/api{path}", headers=headers, json=body)
        if res.status_code not in ok:
            raise RuntimeError(f"{method} {path} -> {res.status_code}: {res.text[:300]}")
        return res.json() if res.content else None

    def login(self, email: str, password: str) -> str:
        return self.call("POST", "/auth/login", body={"email": email, "password": password})["accessToken"]


def days_from_today(n: int) -> str:
    return (date.today() + timedelta(days=n)).isoformat()


def next_free_slot(api: Api, clinic_id: int, start_in_days: int, prefer: str = None):
    """First open day (from start_in_days on) with a free slot; returns (date, time)."""
    for offset in range(start_in_days, start_in_days + 14):
        day = days_from_today(offset)
        slots = api.call("GET", f"/clinics/{clinic_id}/slots?date={day}")
        if slots["status"] == "AVAILABLE":
            time = prefer if prefer in slots["slots"] else slots["slots"][min(2, len(slots["slots"]) - 1)]
            return day, time
    raise RuntimeError(f"No free slot found at clinic {clinic_id}")


# ---------------------------------------------------------------------------

def create_demo(api: Api, password: str) -> None:
    admin = api.login(settings.admin_email, settings.admin_password)
    clinics = {c["name"]: c["id"] for c in api.call("GET", "/clinics")}
    products = {p["name"]: p["id"] for p in api.call("GET", "/products")}

    # --- accounts ---
    tokens = {}
    for name, user in OWNERS:
        res = api.call("POST", "/auth/register", body={
            "fullName": name, "email": user + DEMO_DOMAIN, "password": password, "role": "PET_OWNER"})
        tokens[user] = res["accessToken"]
    for name, user, clinic, department in STAFF:
        res = api.call("POST", "/auth/register", body={
            "fullName": name, "email": user + DEMO_DOMAIN, "password": password, "role": "CLINIC_STAFF",
            "clinicId": clinics[clinic], "department": department})
        tokens[user] = res["accessToken"]
    dana, yossi, noa, amir = tokens["dana.levi"], tokens["yossi.cohen"], tokens["dr.noa"], tokens["dr.amir"]
    print("  accounts: 2 pet owners, 2 clinic staff")

    # --- pets ---
    luna = api.call("POST", "/pets", dana, {"name": "Luna", "species": "cat", "breed": "Persian", "age": 3, "gender": "Female"})
    rex = api.call("POST", "/pets", dana, {"name": "Rex", "species": "dog", "breed": "Golden Retriever", "age": 5, "gender": "Male"})
    max_ = api.call("POST", "/pets", yossi, {"name": "Max", "species": "dog", "breed": "Beagle", "age": 2, "gender": "Male"})
    print("  pets: Luna, Rex (Dana) and Max (Yossi)")

    # --- medical records ---
    def records(token, pet, vaccinations, weights, medications, visits):
        for name, given, due, vet in vaccinations:
            api.call("POST", f"/pets/{pet['id']}/vaccinations", token, {
                "vaccineName": name, "dateAdministered": given, "nextDueDate": due, "veterinarian": vet})
        for kg, day in weights:
            api.call("POST", f"/pets/{pet['id']}/weights", token, {"weightKg": kg, "recordedDate": day})
        for med, reason, day, notes in medications:
            api.call("POST", f"/pets/{pet['id']}/treatments", token, {
                "kind": "MEDICATION", "medication": med, "diagnosis": reason, "treatmentDate": day, "notes": notes})
        for reason, day, clinic, vet, notes in visits:
            api.call("POST", f"/pets/{pet['id']}/treatments", token, {
                "kind": "VET_VISIT", "diagnosis": reason, "treatmentDate": day, "clinicName": clinic,
                "veterinarian": vet, "notes": notes})

    records(
        dana, rex,
        vaccinations=[("Rabies", days_from_today(-300), days_from_today(65), "Dr. Noa Katz"),
                      ("DHPP", days_from_today(-120), days_from_today(245), "Dr. Noa Katz")],
        weights=[(29.5, days_from_today(-150)), (30.4, days_from_today(-90)), (31.2, days_from_today(-30)), (30.8, days_from_today(-3))],
        medications=[("Flea & tick tablet", "Monthly prevention", days_from_today(-10), "One tablet every month with food")],
        visits=[("Annual checkup", days_from_today(-120), "Lake Veterinary Center", "Dr. Noa Katz", "Healthy. Watch weight."),
                ("Limping on front leg", days_from_today(-45), "Lake Veterinary Center", "Dr. Noa Katz", "Mild sprain, rest for one week.")],
    )
    records(
        dana, luna,
        vaccinations=[("Feline trivalent (FVRCP)", days_from_today(-200), days_from_today(165), "Dr. Amir Haddad")],
        weights=[(4.0, days_from_today(-100)), (4.2, days_from_today(-40)), (4.1, days_from_today(-5))],
        medications=[],
        visits=[("Dental cleaning", days_from_today(-60), "PetWise Central Veterinary Clinic", "Dr. Amir Haddad", "Two teeth cleaned, all fine.")],
    )
    records(
        yossi, max_,
        vaccinations=[("Rabies", days_from_today(-350), days_from_today(15), "Dr. Noa Katz")],
        weights=[(11.0, days_from_today(-60)), (11.6, days_from_today(-7))],
        medications=[("Ear drops", "Ear infection", days_from_today(-4), "3 drops twice a day for 7 days")],
        visits=[],
    )
    print("  medical records: vaccinations (with automatic due-date reminders), weights, medications, vet visits")

    # --- feeding ---
    for token, pet, meals in [
        (dana, rex, [("Breakfast", "07:30", "Salmon dry food", "250 g"), ("Dinner", "18:30", "Salmon dry food", "250 g")]),
        (dana, luna, [("Breakfast", "08:00", "Wet food", "1 pouch"), ("Dinner", "19:00", "Dry kitten food", "40 g")]),
        (yossi, max_, [("Breakfast", "07:00", "Beagle adult food", "1 cup"), ("Dinner", "18:00", "Beagle adult food", "1 cup")]),
    ]:
        created = [api.call("POST", f"/pets/{pet['id']}/feeding", token, {"mealName": m, "time": t, "food": f, "amount": a})
                   for m, t, f, a in meals]
        api.call("POST", f"/pets/{pet['id']}/feeding/{created[0]['id']}/fed", token, {"date": days_from_today(0)})
    print("  feeding schedules (breakfast marked as fed today)")

    # --- reminders ---
    api.call("POST", "/reminders", dana, {"type": "WALK", "title": "Evening walk with Rex", "dueDate": f"{days_from_today(0)}T19:30", "petId": rex["id"]})
    api.call("POST", "/reminders", dana, {"type": "MEDICATION", "title": "Flea & tick tablet", "dueDate": f"{days_from_today(20)}T09:00", "petId": rex["id"]})
    api.call("POST", "/reminders", yossi, {"type": "MEDICATION", "title": "Ear drops for Max", "dueDate": f"{days_from_today(0)}T20:00", "petId": max_["id"]})

    # --- appointments in different states ---
    lake, central = clinics["Lake Veterinary Center"], clinics["PetWise Central Veterinary Clinic"]

    d, t = next_free_slot(api, lake, 1, "10:00")
    api.call("POST", "/appointments", dana, {"petId": rex["id"], "clinicId": lake, "service": "Vaccination",
                                            "appointmentDate": d, "appointmentTime": t, "notes": "Rabies booster"})  # PENDING

    d, t = next_free_slot(api, central, 2, "09:00")
    confirmed = api.call("POST", "/appointments", dana, {"petId": luna["id"], "clinicId": central, "service": "Dental Care",
                                                        "appointmentDate": d, "appointmentTime": t})
    api.call("POST", f"/appointments/{confirmed['id']}/status", amir, {"status": "CONFIRMED"})

    d, t = next_free_slot(api, lake, 2, "11:00")
    moved = api.call("POST", "/appointments", yossi, {"petId": max_["id"], "clinicId": lake, "service": "General Checkup",
                                                     "appointmentDate": d, "appointmentTime": t, "notes": "Scratching his ears a lot"})
    new_day, new_time = next_free_slot(api, lake, 3, "14:00")
    api.call("POST", f"/appointments/{moved['id']}/status", noa, {
        "status": "RESCHEDULE_REQUESTED", "suggestedDate": new_day, "suggestedTime": new_time,
        "note": "The doctor is in surgery that morning, can you come later?"})

    d, t = next_free_slot(api, lake, 1, "09:00")
    done = api.call("POST", "/appointments", yossi, {"petId": max_["id"], "clinicId": lake, "service": "Vaccination",
                                                    "appointmentDate": d, "appointmentTime": t})
    api.call("POST", f"/appointments/{done['id']}/status", noa, {"status": "CONFIRMED"})
    api.call("POST", f"/appointments/{done['id']}/status", noa, {"status": "IN_PROGRESS"})
    api.call("POST", f"/appointments/{done['id']}/status", noa, {"status": "COMPLETED", "note": "Rabies booster given. Next one in a year."})

    d, t = next_free_slot(api, lake, 4)
    api.call("POST", "/staff/schedule/blocks", noa, {"date": d, "time": "12:00", "reason": "Lunch break"}, ok=(201, 400, 409))
    print("  appointments: pending, confirmed, new time suggested, completed; a blocked lunch slot")

    # --- shop ---
    def buy(token, items, method):
        for product, qty in items:
            if product in products:
                api.call("PUT", f"/cart/items/{products[product]}", token, {"quantity": qty})
        return api.call("POST", "/orders", token, {
            "shippingAddress": {"fullName": "Demo customer", "street": "1 Lake Road", "city": "Tiberias", "postalCode": "14100"},
            "paymentMethod": method})

    order1 = buy(dana, [("Healthy Dry Pet Food", 1), ("Interactive Rubber Ball", 2)], "TEST_PAYMENT")
    api.call("POST", f"/orders/{order1['id']}/status", admin, {"status": "SHIPPED"})
    buy(yossi, [("Dog Leash & Collar", 1)], "CASH_ON_DELIVERY")
    api.call("PUT", f"/cart/items/{products['Premium Pet Shampoo']}", dana, {"quantity": 1})  # something left in the cart
    print("  shop: one shipped order (test payment), one cash-on-delivery order, an item in Dana's cart")

    # --- community ---
    p1 = api.call("POST", "/posts", dana, {"content": "Rex's first swim in the Kinneret today! 🐕🌊 #dogs #kinneret", "petId": rex["id"]})
    p2 = api.call("POST", "/posts", yossi, {"content": "Any tips for a Beagle who scratches his ears all the time? #beagle #help"})
    p3 = api.call("POST", "/posts", noa, {"content": "Reminder from the clinic: summer heat is dangerous for dogs. Walk early in the morning and bring water! #summer #safety"})
    api.call("POST", f"/posts/{p1['id']}/like", yossi)
    api.call("POST", f"/posts/{p1['id']}/like", noa)
    api.call("POST", f"/posts/{p3['id']}/like", dana)
    api.call("POST", f"/posts/{p1['id']}/comments", yossi, {"content": "So cute! Max is afraid of water 😅"})
    api.call("POST", f"/posts/{p2['id']}/comments", noa, {"content": "It could be an ear infection. Book a checkup and we'll take a look."})
    api.call("POST", f"/posts/{p2['id']}/comments", dana, {"content": "Rex had the same, ear drops helped."})
    api.call("POST", f"/posts/{p2['id']}/bookmark", dana)
    spam = api.call("POST", "/posts", yossi, {"content": "Cheap pet medicine without prescription!!! Click here #deal"})
    api.call("POST", f"/posts/{spam['id']}/report", dana, {"reason": "Spam / selling medicine without a prescription"})
    print("  community: 4 posts, likes, comments, a saved post, one reported post")


def reset_demo(api: Api, db) -> None:
    admin = api.login(settings.admin_email, settings.admin_password)
    demo_users = list(db.users.find({"email": {"$regex": f"{DEMO_DOMAIN.replace('.', '[.]')}$"}}))
    ids = [u["_id"] for u in demo_users]
    if not ids:
        print("No demo data found.")
        return
    # give back stock of demo orders that were not cancelled
    for order in db.orders.find({"user_id": {"$in": ids}, "status": {"$ne": "CANCELLED"}}):
        for item in order["items"]:
            db.products.update_one({"_id": item["product_id"]}, {"$inc": {"stock_quantity": item["quantity"]}})
    db.orders.delete_many({"user_id": {"$in": ids}})
    db.appointments.delete_many({"user_id": {"$in": ids}})
    post_ids = [p["_id"] for p in db.posts.find({"author_id": {"$in": ids}}, {"_id": 1})]
    db.comments.delete_many({"$or": [{"author_id": {"$in": ids}}, {"post_id": {"$in": post_ids}}]})
    db.post_reports.delete_many({"$or": [{"reported_by": {"$in": ids}}, {"post_id": {"$in": post_ids}}]})
    db.posts.delete_many({"_id": {"$in": post_ids}})
    db.posts.update_many({}, {"$pull": {"liked_by": {"$in": ids}, "bookmarked_by": {"$in": ids}}})
    db.schedule_blocks.delete_many({"created_by": {"$in": ids}})
    for user in demo_users:  # removes pets, records, feeding, reminders, cart, notifications
        api.call("DELETE", f"/users/{user['_id']}", admin)
    print(f"Removed {len(ids)} demo accounts and their data.")


def main() -> None:
    if not (settings.admin_email and settings.admin_password):
        sys.exit("ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env")
    db = get_db()
    seed(db)  # clinics, products, guides, admin
    app.dependency_overrides[get_db] = lambda: db
    api = Api(TestClient(app))

    if "--reset" in sys.argv:
        reset_demo(api, db)
        return

    password = os.environ.get("DEMO_PASSWORD") or settings.demo_password
    if len(password) < 6:
        sys.exit("Set DEMO_PASSWORD (at least 6 characters) in backend/.env first.")
    if db.users.find_one({"email": "dana.levi" + DEMO_DOMAIN}):
        print("Demo data already exists. Run with --reset first to recreate it.")
        return
    print("Adding demo data...")
    create_demo(api, password)
    print("Done. Demo logins (password = DEMO_PASSWORD from .env):")
    for _, user in OWNERS:
        print(f"  pet owner:    {user}{DEMO_DOMAIN}")
    for _, user, clinic, _ in STAFF:
        print(f"  clinic staff: {user}{DEMO_DOMAIN}  ({clinic})")


if __name__ == "__main__":
    main()
