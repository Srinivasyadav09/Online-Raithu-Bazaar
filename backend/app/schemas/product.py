from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse
from app.schemas.farmer import FarmerSummary


class ProductCreate(BaseModel):
    category_id: int = Field(gt=0)
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    price: Decimal = Field(gt=0, decimal_places=2)
    unit: str = Field(min_length=1, max_length=30)
    stock_quantity: Decimal = Field(ge=0, decimal_places=2)
    image: str | None = Field(default=None, max_length=500)
    organic: bool = True
    is_available: bool = True


class ProductUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    description: str | None = None
    price: Decimal | None = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )
    unit: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )
    stock_quantity: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2,
    )
    image: str | None = Field(
        default=None,
        max_length=500,
    )
    organic: bool | None = None
    is_available: bool | None = None


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    unit: str
    stock_quantity: Decimal
    image: str | None = None
    organic: bool = True
    is_available: bool = True


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    category_id: int
    created_at: datetime
    updated_at: datetime


class ProductDetailResponse(ProductResponse):
    farmer: FarmerSummary
    category: CategoryResponse