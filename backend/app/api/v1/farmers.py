from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.category import Category
from app.models.farmer import Farmer, FarmerVerificationStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.farmer import (
    FarmerCreate,
    FarmerResponse,
    FarmerUpdate,
)
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"],
)


def _require_verified(farmer: Farmer) -> None:
    if farmer.verification_status != FarmerVerificationStatus.COMPLETED or not farmer.organic_certified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Farmer verification must be completed before this action")


# ============================================================
# Farmer's own profile
# ============================================================


@router.post(
    "/me",
    response_model=FarmerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_farmer_profile(
    request: FarmerCreate,
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> Farmer:
    existing_farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if existing_farmer is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Farmer profile already exists",
        )

    farmer = Farmer(
        user_id=current_user.id,
        farm_name=request.farm_name.strip(),
        description=request.description,
        location=request.location,
        district=request.district,
        state=request.state,
        profile_image=request.profile_image,
        farm_image=request.farm_image,
        years_of_farming=request.years_of_farming,
        organic_certified=False,
        verification_status=FarmerVerificationStatus.PROFILE_SUBMITTED,
    )

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return farmer


@router.get(
    "/me/profile",
    response_model=FarmerResponse,
)
def get_my_farmer_profile(
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> Farmer:
    farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    return farmer


@router.put(
    "/me",
    response_model=FarmerResponse,
)
def update_my_farmer_profile(
    request: FarmerUpdate,
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> Farmer:
    farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    if "farm_name" in update_data:
        update_data["farm_name"] = (
            update_data["farm_name"].strip()
        )

    for field, value in update_data.items():
        setattr(farmer, field, value)

    db.commit()
    db.refresh(farmer)

    return farmer


# ============================================================
# Farmer product management
# ============================================================


@router.post(
    "/me/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_product(
    request: ProductCreate,
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> Product:
    farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    _require_verified(farmer)

    category = db.get(
        Category,
        request.category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    product = Product(
        farmer_id=farmer.id,
        category_id=request.category_id,
        name=request.name.strip(),
        description=request.description,
        price=request.price,
        unit=request.unit.strip(),
        stock_quantity=request.stock_quantity,
        image=request.image,
        organic=request.organic,
        is_available=request.is_available,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.get(
    "/me/products",
    response_model=list[ProductResponse],
)
def list_my_products(
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> list[Product]:
    farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    return list(
        db.scalars(
            select(Product)
            .where(Product.farmer_id == farmer.id)
            .order_by(Product.name)
        ).all()
    )


@router.put(
    "/me/products/{product_id}",
    response_model=ProductResponse,
)
def update_my_product(
    product_id: int,
    request: ProductUpdate,
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> Product:
    farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    _require_verified(farmer)

    # Important:
    # farmer_id is checked here so a farmer cannot
    # modify another farmer's product.
    product = db.scalar(
        select(Product).where(
            Product.id == product_id,
            Product.farmer_id == farmer.id,
        )
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = request.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        update_data["name"] = (
            update_data["name"].strip()
        )

    if "unit" in update_data:
        update_data["unit"] = (
            update_data["unit"].strip()
        )

    if "category_id" in update_data:
        category = db.get(
            Category,
            update_data["category_id"],
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete(
    "/me/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_my_product(
    product_id: int,
    current_user: User = Depends(
        require_role(UserRole.FARMER)
    ),
    db: Session = Depends(get_db),
) -> None:
    farmer = db.scalar(
        select(Farmer).where(
            Farmer.user_id == current_user.id
        )
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    _require_verified(farmer)

    product = db.scalar(
        select(Product).where(
            Product.id == product_id,
            Product.farmer_id == farmer.id,
        )
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()


@router.post("/me/images")
async def upload_my_farmer_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.FARMER)),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    farmer = db.scalar(select(Farmer).where(Farmer.user_id == current_user.id))
    if farmer is None:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    _require_verified(farmer)

    allowed = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP and GIF images are supported")

    upload_dir = Path("uploads/farmers")
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{current_user.id}_{uuid4().hex}{allowed[file.content_type]}"
    destination = upload_dir / filename
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")
    destination.write_bytes(content)
    return {"url": f"/media/farmers/{filename}"}


# ============================================================
# Public farmer endpoints
# ============================================================


@router.get(
    "",
    response_model=list[FarmerResponse],
)
def list_farmers(
    db: Session = Depends(get_db),
) -> list[Farmer]:
    return list(
        db.scalars(
            select(Farmer).order_by(Farmer.farm_name)
        ).all()
    )


@router.get(
    "/{farmer_id}",
    response_model=FarmerResponse,
)
def get_farmer(
    farmer_id: int,
    db: Session = Depends(get_db),
) -> Farmer:
    farmer = db.get(
        Farmer,
        farmer_id,
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found",
        )

    return farmer


@router.get(
    "/{farmer_id}/products",
    response_model=list[ProductResponse],
)
def get_farmer_products(
    farmer_id: int,
    db: Session = Depends(get_db),
) -> list[Product]:
    farmer = db.get(
        Farmer,
        farmer_id,
    )

    if farmer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found",
        )

    return list(
        db.scalars(
            select(Product)
            .where(Product.farmer_id == farmer_id)
            .order_by(Product.name)
        ).all()
    )