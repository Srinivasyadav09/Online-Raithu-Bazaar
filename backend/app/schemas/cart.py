from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: Decimal = Field(gt=0, decimal_places=2)


class CartItemUpdate(BaseModel):
    quantity: Decimal = Field(gt=0, decimal_places=2)


class CartProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: Decimal
    unit: str
    image: str | None = None
    stock_quantity: Decimal
    organic: bool
    is_available: bool


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: Decimal
    product: CartProductResponse
    created_at: datetime
    updated_at: datetime


class CartResponse(BaseModel):
    id: int
    customer_id: int
    items: list[CartItemResponse]
    subtotal: Decimal