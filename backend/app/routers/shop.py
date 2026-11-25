"""Shop: products (Product), cart (Cart/CartItem) and orders (Order/OrderItem).

- Anyone can browse active products; only admins manage them.
- Each user has one cart, stored on the server.
- Placing an order re-checks prices and stock on the server, reduces the stock,
  and empties the cart. Payment is simulated (test environment only): no card data.
"""

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo import ReturnDocument
from pymongo.database import Database

from app.core.deps import get_current_user, require_roles
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.shop import (
    CartOut,
    CartQuantityIn,
    OrderIn,
    OrderOut,
    OrderStatusIn,
    ProductIn,
    ProductOut,
    ProductUpdate,
)

router = APIRouter(tags=["Shop"])
admin_only = require_roles(Role.ADMIN)


# ---------------- products ----------------

@router.get("/products", response_model=List[ProductOut])
def list_products(category: Optional[str] = None, include_hidden: bool = False, db: Database = Depends(get_db)):
    query = {} if include_hidden else {"status": "ACTIVE"}
    if category:
        query["category"] = category
    return [to_out(p) for p in db.products.find(query).sort("_id", 1)]


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Database = Depends(get_db)):
    product = db.products.find_one({"_id": product_id})
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return to_out(product)


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductIn, db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    product = new_document(db, "products", **data.model_dump())
    db.products.insert_one(product)
    return to_out(product)


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    changes = data.model_dump(exclude_unset=True)
    changes["updated_at"] = now()
    result = db.products.update_one({"_id": product_id}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return to_out(db.products.find_one({"_id": product_id}))


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    result = db.products.delete_one({"_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    # remove it from everyone's cart (past orders keep their own copy of the item)
    db.carts.update_many({}, {"$pull": {"items": {"product_id": product_id}}})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------------- cart ----------------

def _cart_view(db: Database, user_id: int) -> dict:
    """The cart with current product names, prices and stock (Cart.calculateTotal)."""
    cart = db.carts.find_one({"_id": user_id}) or {"items": []}
    product_ids = [i["product_id"] for i in cart["items"]]
    products = {p["_id"]: p for p in db.products.find({"_id": {"$in": product_ids}, "status": "ACTIVE"})}
    items = []
    for line in cart["items"]:
        product = products.get(line["product_id"])
        if product is None:
            continue  # product removed or hidden
        price = round(float(product["price"]), 2)
        items.append(
            {
                "product_id": product["_id"],
                "name": product["name"],
                "image_url": product.get("image_url"),
                "unit_price": price,
                "quantity": line["quantity"],
                "subtotal": round(price * line["quantity"], 2),
                "in_stock": product["stock_quantity"],
            }
        )
    return {
        "items": items,
        "total": round(sum(i["subtotal"] for i in items), 2),
        "item_count": sum(i["quantity"] for i in items),
    }


@router.get("/cart", response_model=CartOut)
def get_cart(user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    return _cart_view(db, user["_id"])


@router.put("/cart/items/{product_id}", response_model=CartOut)
def set_cart_quantity(
    product_id: int, data: CartQuantityIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)
):
    """Adds a product to the cart or sets its quantity (CartItem.update)."""
    product = db.products.find_one({"_id": product_id, "status": "ACTIVE"})
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    if product["stock_quantity"] < data.quantity:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Only {product['stock_quantity']} left in stock" if product["stock_quantity"] else "This product is out of stock",
        )
    cart = db.carts.find_one({"_id": user["_id"]}) or {"_id": user["_id"], "items": []}
    items = [i for i in cart["items"] if i["product_id"] != product_id]
    existing = next((i for i in cart["items"] if i["product_id"] == product_id), None)
    position = cart["items"].index(existing) if existing else len(items)
    items.insert(position, {"product_id": product_id, "quantity": data.quantity})
    db.carts.update_one({"_id": user["_id"]}, {"$set": {"items": items, "updated_at": now()}}, upsert=True)
    return _cart_view(db, user["_id"])


@router.delete("/cart/items/{product_id}", response_model=CartOut)
def remove_from_cart(product_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    db.carts.update_one({"_id": user["_id"]}, {"$pull": {"items": {"product_id": product_id}}})
    return _cart_view(db, user["_id"])


@router.delete("/cart", response_model=CartOut)
def clear_cart(user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    db.carts.update_one({"_id": user["_id"]}, {"$set": {"items": [], "updated_at": now()}}, upsert=True)
    return _cart_view(db, user["_id"])


# ---------------- orders ----------------

def _restock(db: Database, items: list) -> None:
    for item in items:
        db.products.update_one({"_id": item["product_id"]}, {"$inc": {"stock_quantity": item["quantity"]}})


@router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(data: OrderIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """Order.create + processOrder: check stock, take it, save the order, empty the cart."""
    cart = _cart_view(db, user["_id"])
    if not cart["items"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Your cart is empty")

    taken = []
    for item in cart["items"]:
        # Only succeeds if enough stock is left, so two buyers can't take the last item twice.
        updated = db.products.find_one_and_update(
            {"_id": item["product_id"], "stock_quantity": {"$gte": item["quantity"]}},
            {"$inc": {"stock_quantity": -item["quantity"]}},
            return_document=ReturnDocument.AFTER,
        )
        if updated is None:
            _restock(db, taken)  # give back what was already taken
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Not enough stock for {item['name']} (only {item['in_stock']} left). Please update your cart.",
            )
        taken.append(item)

    paid = data.payment_method == "TEST_PAYMENT"
    order = new_document(
        db,
        "orders",
        status="PROCESSING",
        user_id=user["_id"],
        customer_name=user["full_name"],
        items=[{k: i[k] for k in ("product_id", "name", "image_url", "unit_price", "quantity", "subtotal")} for i in cart["items"]],
        total_amount=cart["total"],
        payment_method=data.payment_method,
        payment_status="PAID" if paid else "PENDING",
        # Simulated payment: a fake reference, no card details are collected or stored.
        payment_reference=f"TEST-{uuid.uuid4().hex[:10].upper()}" if paid else None,
        shipping_address=data.shipping_address.model_dump(),
        order_date=now(),
    )
    db.orders.insert_one(order)
    db.carts.update_one({"_id": user["_id"]}, {"$set": {"items": [], "updated_at": now()}}, upsert=True)
    return to_out(order)


@router.get("/orders", response_model=List[OrderOut])
def list_orders(user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """My orders (admins see all orders)."""
    query = {} if user["role"] == Role.ADMIN.value else {"user_id": user["_id"]}
    return [to_out(o) for o in db.orders.find(query).sort("_id", -1)]


def _load_order(db: Database, order_id: int, user: dict) -> dict:
    order = db.orders.find_one({"_id": order_id})
    if order is None or (order["user_id"] != user["_id"] and user["role"] != Role.ADMIN.value):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return order


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """Order.trackOrder"""
    return to_out(_load_order(db, order_id, user))


def _cancel(db: Database, order: dict) -> dict:
    _restock(db, order["items"])
    changes = {"status": "CANCELLED", "updated_at": now()}
    if order["payment_status"] == "PAID":
        changes["payment_status"] = "REFUNDED"
    db.orders.update_one({"_id": order["_id"]}, {"$set": changes})
    return db.orders.find_one({"_id": order["_id"]})


@router.post("/orders/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """Order.cancel: allowed until the order is shipped; the stock goes back."""
    order = _load_order(db, order_id, user)
    if order["status"] != "PROCESSING":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"A {order['status'].lower()} order cannot be cancelled")
    return to_out(_cancel(db, order))


ORDER_TRANSITIONS = {"SHIPPED": ["PROCESSING"], "DELIVERED": ["SHIPPED"], "CANCELLED": ["PROCESSING"]}


@router.post("/orders/{order_id}/status", response_model=OrderOut)
def change_order_status(
    order_id: int, data: OrderStatusIn, db: Database = Depends(get_db), admin: dict = Depends(admin_only)
):
    order = _load_order(db, order_id, admin)
    if order["status"] not in ORDER_TRANSITIONS[data.status]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Cannot change a {order['status'].lower()} order to {data.status.lower()}")
    if data.status == "CANCELLED":
        return to_out(_cancel(db, order))
    changes = {"status": data.status, "updated_at": now()}
    if data.status == "DELIVERED" and order["payment_method"] == "CASH_ON_DELIVERY":
        changes["payment_status"] = "PAID"
    db.orders.update_one({"_id": order_id}, {"$set": changes})
    return to_out(db.orders.find_one({"_id": order_id}))
