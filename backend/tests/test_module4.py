"""Module 4: shop (products, cart, orders, test payment) and community (posts, comments, likes)."""

import pytest

from app.database import new_document
from tests.conftest import auth_headers

ADDRESS = {"fullName": "Dana", "street": "1 Lake Rd", "city": "Tiberias", "postalCode": "14100"}


def add_product(db, name="Ball", price=12.5, stock=5, status="ACTIVE"):
    product = new_document(db, "products", name=name, category="Toys", price=price, stock_quantity=stock,
                           image_url=None, description=None, status=status)
    db.products.insert_one(product)
    return product["_id"]


@pytest.fixture()
def buyer(client):
    return auth_headers(client, email="buyer@test.com")


def put_cart(client, headers, product_id, qty):
    return client.put(f"/api/cart/items/{product_id}", headers=headers, json={"quantity": qty})


def order(client, headers, method="TEST_PAYMENT"):
    return client.post("/api/orders", headers=headers, json={"shippingAddress": ADDRESS, "paymentMethod": method})


# ---------------- products ----------------

def test_products_public_and_admin_only_management(client, db, buyer, admin_headers):
    add_product(db, "Visible")
    add_product(db, "Hidden", status="HIDDEN")
    assert [p["name"] for p in client.get("/api/products").json()] == ["Visible"]

    body = {"name": "Bed", "category": "Beds", "price": 65, "stockQuantity": 3}
    assert client.post("/api/products", headers=buyer, json=body).status_code == 403
    created = client.post("/api/products", headers=admin_headers, json=body)
    assert created.status_code == 201
    pid = created.json()["id"]
    assert client.put(f"/api/products/{pid}", headers=admin_headers, json={"stockQuantity": 9}).json()["stockQuantity"] == 9
    assert client.post("/api/products", headers=admin_headers, json={**body, "price": -1}).status_code == 422
    assert client.delete(f"/api/products/{pid}", headers=admin_headers).status_code == 204


# ---------------- cart ----------------

def test_cart_quantities_and_total(client, db, buyer):
    ball = add_product(db, "Ball", price=12.5, stock=5)
    food = add_product(db, "Food", price=45, stock=3)

    put_cart(client, buyer, ball, 2)
    cart = put_cart(client, buyer, food, 1).json()
    assert cart["total"] == 70.0 and cart["itemCount"] == 3

    cart = put_cart(client, buyer, ball, 4).json()  # change quantity
    assert cart["total"] == 95.0
    assert [i["name"] for i in cart["items"]] == ["Ball", "Food"]  # order kept

    cart = client.delete(f"/api/cart/items/{food}", headers=buyer).json()
    assert cart["total"] == 50.0
    assert client.get("/api/cart", headers=buyer).json()["itemCount"] == 4


def test_cannot_add_more_than_stock_or_out_of_stock(client, db, buyer):
    ball = add_product(db, stock=2)
    empty = add_product(db, "Bed", stock=0)
    assert put_cart(client, buyer, ball, 3).status_code == 409
    assert put_cart(client, buyer, empty, 1).status_code == 409
    assert put_cart(client, buyer, ball, 0).status_code == 422


def test_carts_are_private(client, db, buyer):
    ball = add_product(db)
    put_cart(client, buyer, ball, 1)
    other = auth_headers(client, email="other@test.com")
    assert client.get("/api/cart", headers=other).json()["items"] == []


# ---------------- orders ----------------

def test_order_takes_stock_empties_cart_and_test_payment(client, db, buyer):
    ball = add_product(db, price=10, stock=5)
    put_cart(client, buyer, ball, 2)
    res = order(client, buyer)
    assert res.status_code == 201
    o = res.json()
    assert o["totalAmount"] == 20.0 and o["paymentStatus"] == "PAID" and o["paymentReference"].startswith("TEST-")
    assert o["status"] == "PROCESSING" and o["shippingAddress"]["city"] == "Tiberias"
    assert db.products.find_one({"_id": ball})["stock_quantity"] == 3
    assert client.get("/api/cart", headers=buyer).json()["items"] == []
    assert len(client.get("/api/orders", headers=buyer).json()) == 1


def test_empty_cart_and_missing_address(client, db, buyer):
    assert order(client, buyer).status_code == 400
    ball = add_product(db)
    put_cart(client, buyer, ball, 1)
    res = client.post("/api/orders", headers=buyer, json={"shippingAddress": {"fullName": "D"}, "paymentMethod": "TEST_PAYMENT"})
    assert res.status_code == 422


def test_stock_ran_out_after_adding_to_cart(client, db, buyer):
    ball = add_product(db, stock=2)
    put_cart(client, buyer, ball, 2)
    db.products.update_one({"_id": ball}, {"$set": {"stock_quantity": 1}})  # someone else bought one
    res = order(client, buyer)
    assert res.status_code == 409
    assert db.products.find_one({"_id": ball})["stock_quantity"] == 1  # nothing taken
    assert db.orders.count_documents({}) == 0


def test_failed_order_gives_back_stock_already_taken(client, db, buyer):
    a = add_product(db, "A", stock=5)
    b = add_product(db, "B", stock=1)
    put_cart(client, buyer, a, 2)
    put_cart(client, buyer, b, 1)
    db.products.update_one({"_id": b}, {"$set": {"stock_quantity": 0}})
    assert order(client, buyer).status_code == 409
    assert db.products.find_one({"_id": a})["stock_quantity"] == 5


def test_cancel_restocks_and_refunds(client, db, buyer):
    ball = add_product(db, stock=5)
    put_cart(client, buyer, ball, 2)
    oid = order(client, buyer).json()["id"]
    cancelled = client.post(f"/api/orders/{oid}/cancel", headers=buyer).json()
    assert cancelled["status"] == "CANCELLED" and cancelled["paymentStatus"] == "REFUNDED"
    assert db.products.find_one({"_id": ball})["stock_quantity"] == 5
    assert client.post(f"/api/orders/{oid}/cancel", headers=buyer).status_code == 400


def test_orders_private_and_admin_status_flow(client, db, buyer, admin_headers):
    ball = add_product(db, stock=5)
    put_cart(client, buyer, ball, 1)
    oid = order(client, buyer, method="CASH_ON_DELIVERY").json()["id"]
    other = auth_headers(client, email="other@test.com")
    assert client.get(f"/api/orders/{oid}", headers=other).status_code == 404
    assert client.post(f"/api/orders/{oid}/status", headers=buyer, json={"status": "SHIPPED"}).status_code == 403

    assert client.post(f"/api/orders/{oid}/status", headers=admin_headers, json={"status": "DELIVERED"}).status_code == 400
    client.post(f"/api/orders/{oid}/status", headers=admin_headers, json={"status": "SHIPPED"})
    done = client.post(f"/api/orders/{oid}/status", headers=admin_headers, json={"status": "DELIVERED"}).json()
    assert done["status"] == "DELIVERED" and done["paymentStatus"] == "PAID"
    # shipped/delivered orders can no longer be cancelled by the owner
    assert client.post(f"/api/orders/{oid}/cancel", headers=buyer).status_code == 400


# ---------------- community ----------------

def make_post(client, headers, content="Hello #dogs #walk"):
    return client.post("/api/posts", headers=headers, json={"content": content})


def test_post_create_list_hashtags(client, buyer):
    res = make_post(client, buyer)
    assert res.status_code == 201
    post = res.json()
    assert post["hashtags"] == ["#dogs", "#walk"] and post["authorName"] == "Test User"
    assert make_post(client, buyer, "").status_code == 422  # empty
    assert len(client.get("/api/posts?hashtag=dogs", headers=buyer).json()) == 1
    assert client.get("/api/posts?hashtag=cats", headers=buyer).json() == []
    assert client.get("/api/posts").status_code == 401  # login required


def test_only_author_edits_author_or_admin_deletes(client, buyer, admin_headers):
    post_id = make_post(client, buyer).json()["id"]
    other = auth_headers(client, email="other@test.com")

    assert client.put(f"/api/posts/{post_id}", headers=other, json={"content": "hacked"}).status_code == 403
    edited = client.put(f"/api/posts/{post_id}", headers=buyer, json={"content": "Edited #cats"}).json()
    assert edited["content"] == "Edited #cats" and edited["hashtags"] == ["#cats"]

    assert client.delete(f"/api/posts/{post_id}", headers=other).status_code == 403
    assert client.delete(f"/api/posts/{post_id}", headers=admin_headers).status_code == 204  # moderation


def test_like_toggle_one_per_user(client, buyer):
    post_id = make_post(client, buyer).json()["id"]
    other = auth_headers(client, email="other@test.com")
    assert client.post(f"/api/posts/{post_id}/like", headers=buyer).json() == {"liked": True, "likeCount": 1}
    assert client.post(f"/api/posts/{post_id}/like", headers=other).json()["likeCount"] == 2
    assert client.post(f"/api/posts/{post_id}/like", headers=buyer).json() == {"liked": False, "likeCount": 1}
    feed = client.get("/api/posts", headers=other).json()[0]
    assert feed["likedByMe"] is True and feed["likeCount"] == 1


def test_bookmarks_and_saved_filter(client, buyer):
    post_id = make_post(client, buyer).json()["id"]
    assert client.post(f"/api/posts/{post_id}/bookmark", headers=buyer).json() == {"bookmarked": True}
    assert len(client.get("/api/posts?saved=true", headers=buyer).json()) == 1
    other = auth_headers(client, email="other@test.com")
    assert client.get("/api/posts?saved=true", headers=other).json() == []


def test_comments_count_and_permissions(client, buyer, admin_headers):
    post_id = make_post(client, buyer).json()["id"]
    other = auth_headers(client, email="other@test.com")
    c1 = client.post(f"/api/posts/{post_id}/comments", headers=other, json={"content": "Cute!"}).json()
    client.post(f"/api/posts/{post_id}/comments", headers=buyer, json={"content": "Thanks"})
    assert [c["content"] for c in client.get(f"/api/posts/{post_id}/comments", headers=buyer).json()] == ["Cute!", "Thanks"]
    assert client.get("/api/posts", headers=buyer).json()[0]["commentCount"] == 2

    assert client.delete(f"/api/comments/{c1['id']}", headers=buyer).status_code == 403  # not the author
    assert client.delete(f"/api/comments/{c1['id']}", headers=other).status_code == 204
    assert client.get("/api/posts", headers=buyer).json()[0]["commentCount"] == 1
    assert client.post(f"/api/posts/{post_id}/comments", headers=buyer, json={"content": ""}).status_code == 422


def test_deleting_post_removes_comments_and_report(client, db, buyer):
    post_id = make_post(client, buyer).json()["id"]
    client.post(f"/api/posts/{post_id}/comments", headers=buyer, json={"content": "x"})
    other = auth_headers(client, email="other@test.com")
    assert client.post(f"/api/posts/{post_id}/report", headers=other, json={"reason": "spam"}).status_code == 201
    client.delete(f"/api/posts/{post_id}", headers=buyer)
    assert db.comments.count_documents({}) == 0 and db.post_reports.count_documents({}) == 0


def test_post_with_pet_must_be_own_pet(client, buyer):
    pet_id = client.post("/api/pets", headers=buyer, json={"name": "Rex", "species": "dog"}).json()["id"]
    assert client.post("/api/posts", headers=buyer, json={"content": "hi", "petId": pet_id}).json()["petName"] == "Rex"
    other = auth_headers(client, email="other@test.com")
    assert client.post("/api/posts", headers=other, json={"content": "hi", "petId": pet_id}).status_code == 400


def test_seed_adds_products_once(db):
    from app.seed import seed

    seed(db)
    seed(db)
    assert db.products.count_documents({}) == 8
