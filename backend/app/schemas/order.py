from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, PaymentStatus


class ShippingAddress(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=20)
    address: str = Field(min_length=5, max_length=500)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)


class OrderCreate(BaseModel):
    shipping: ShippingAddress


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    farmer_id: int
    product_name: str
    unit: str
    quantity: Decimal
    unit_price: Decimal
    total_price: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    subtotal: Decimal
    total_amount: Decimal

    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str

    items: list[OrderItemResponse]

    created_at: datetime
    updated_at: datetime