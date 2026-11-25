"""Shop class diagram: Product, Category, Cart/CartItem, Order/OrderItem, Address."""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import Field

from app.schemas.common import CamelModel

MAX_IMAGE_CHARS = 8 * 1024 * 1024


class ProductIn(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    category: str = Field(min_length=1, max_length=60)
    price: float = Field(ge=0, le=100000)
    stock_quantity: int = Field(ge=0, le=1000000)
    image_url: Optional[str] = Field(default=None, max_length=MAX_IMAGE_CHARS)
    status: Literal["ACTIVE", "HIDDEN"] = "ACTIVE"


class ProductUpdate(CamelModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    category: Optional[str] = Field(default=None, min_length=1, max_length=60)
    price: Optional[float] = Field(default=None, ge=0, le=100000)
    stock_quantity: Optional[int] = Field(default=None, ge=0, le=1000000)
    image_url: Optional[str] = Field(default=None, max_length=MAX_IMAGE_CHARS)
    status: Optional[Literal["ACTIVE", "HIDDEN"]] = None


class ProductOut(CamelModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    status: str


# --- cart ---
class CartQuantityIn(CamelModel):
    quantity: int = Field(ge=1, le=99)


class CartItemOut(CamelModel):
    product_id: int
    name: str
    image_url: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal: float
    in_stock: int  # current stock, so the UI can warn


class CartOut(CamelModel):
    items: List[CartItemOut]
    total: float
    item_count: int


# --- orders ---
class AddressIn(CamelModel):
    label: Optional[str] = Field(default=None, max_length=40)
    full_name: str = Field(min_length=1, max_length=120)
    street: str = Field(min_length=1, max_length=200)
    city: str = Field(min_length=1, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    country: str = Field(default="Israel", max_length=60)
    phone: Optional[str] = Field(default=None, max_length=30)


class AddressOut(AddressIn):
    pass


PaymentMethod = Literal["TEST_PAYMENT", "CASH_ON_DELIVERY"]


class OrderIn(CamelModel):
    shipping_address: AddressIn
    payment_method: PaymentMethod


OrderStatus = Literal["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]


class OrderStatusIn(CamelModel):
    status: Literal["SHIPPED", "DELIVERED", "CANCELLED"]


class OrderItemOut(CamelModel):
    product_id: int
    name: str
    image_url: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal: float


class OrderOut(CamelModel):
    id: int
    user_id: int
    customer_name: Optional[str] = None
    items: List[OrderItemOut]
    total_amount: float
    payment_method: PaymentMethod
    payment_status: Literal["PAID", "PENDING", "REFUNDED"]
    payment_reference: Optional[str] = None
    status: OrderStatus
    shipping_address: AddressOut
    order_date: datetime
