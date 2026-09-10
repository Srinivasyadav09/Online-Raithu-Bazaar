from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.product import Product
from app.models.farmer import Farmer, FarmerVerificationStatus
from app.schemas.product import ProductDetailResponse, ProductResponse


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.get("", response_model=list[ProductResponse])
def list_products(
    category_id: int | None = Query(default=None),
    farmer_id: int | None = Query(default=None),
    organic: bool | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
) -> list[Product]:

    statement = select(Product).join(Farmer, Product.farmer_id == Farmer.id)

    if category_id is not None:
        statement = statement.where(
            Product.category_id == category_id
        )

    if farmer_id is not None:
        statement = statement.where(
            Product.farmer_id == farmer_id
        )

    if organic is not None:
        statement = statement.where(
            Product.organic == organic
        )

    if search:
        search_pattern = f"%{search.strip()}%"

        statement = statement.where(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    statement = statement.where(
        Product.is_available.is_(True),
        Farmer.verification_status == FarmerVerificationStatus.COMPLETED,
        Farmer.organic_certified.is_(True),
    ).order_by(Product.name)

    return list(db.scalars(statement).all())


@router.get(
    "/{product_id}",
    response_model=ProductDetailResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
) -> Product:

    statement = (
        select(Product)
        .options(
            joinedload(Product.farmer),
            joinedload(Product.category),
        )
        .join(Farmer, Product.farmer_id == Farmer.id)
        .where(Product.id == product_id, Farmer.verification_status == FarmerVerificationStatus.COMPLETED, Farmer.organic_certified.is_(True))
    )

    product = db.scalar(statement)

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return product