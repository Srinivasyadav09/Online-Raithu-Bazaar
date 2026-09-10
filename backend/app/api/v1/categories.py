from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
) -> list[Category]:
    return list(
        db.scalars(
            select(Category).order_by(Category.name)
        ).all()
    )


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
) -> Category:
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return category