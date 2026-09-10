from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
)

router = APIRouter(
    prefix="/cart",
    tags=["Cart"],
)


def get_or_create_cart(
    current_user: User,
    db: Session,
) -> Cart:
    cart = db.scalar(
        select(Cart)
        .where(Cart.customer_id == current_user.id)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product)
        )
    )

    if cart is not None:
        return cart

    cart = Cart(
        customer_id=current_user.id,
    )

    db.add(cart)
    db.commit()
    db.refresh(cart)

    return cart


def calculate_subtotal(cart: Cart) -> Decimal:
    return sum(
        (
            item.product.price * item.quantity
            for item in cart.items
        ),
        Decimal("0.00"),
    )


def build_cart_response(cart: Cart) -> CartResponse:
    return CartResponse(
        id=cart.id,
        customer_id=cart.customer_id,
        items=[
            CartItemResponse.model_validate(item)
            for item in cart.items
        ],
        subtotal=calculate_subtotal(cart),
    )


@router.get(
    "",
    response_model=CartResponse,
)
def get_my_cart(
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> CartResponse:
    cart = get_or_create_cart(
        current_user=current_user,
        db=db,
    )

    return build_cart_response(cart)


@router.post(
    "/items",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_cart_item(
    request: CartItemCreate,
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> CartItem:
    product = db.scalar(
        select(Product).where(
            Product.id == request.product_id
        )
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    if not product.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available",
        )

    if product.stock_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is out of stock",
        )

    cart = get_or_create_cart(
        current_user=current_user,
        db=db,
    )

    existing_item = db.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product.id,
        )
    )

    if existing_item is not None:
        new_quantity = (
            existing_item.quantity + request.quantity
        )

        if new_quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Requested quantity exceeds available "
                    f"stock. Available: {product.stock_quantity}"
                ),
            )

        existing_item.quantity = new_quantity

        db.commit()

        db.refresh(existing_item)

        return existing_item

    if request.quantity > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Requested quantity exceeds available "
                f"stock. Available: {product.stock_quantity}"
            ),
        )

    cart_item = CartItem(
        cart_id=cart.id,
        product_id=product.id,
        quantity=request.quantity,
    )

    db.add(cart_item)

    db.commit()

    db.refresh(cart_item)

    return cart_item


@router.put(
    "/items/{item_id}",
    response_model=CartItemResponse,
)
def update_cart_item(
    item_id: int,
    request: CartItemUpdate,
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> CartItem:
    cart = db.scalar(
        select(Cart).where(
            Cart.customer_id == current_user.id
        )
    )

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    cart_item = db.scalar(
        select(CartItem)
        .where(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id,
        )
        .options(
            joinedload(CartItem.product)
        )
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    if not cart_item.product.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is no longer available",
        )

    if request.quantity > cart_item.product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Requested quantity exceeds available "
                f"stock. Available: "
                f"{cart_item.product.stock_quantity}"
            ),
        )

    cart_item.quantity = request.quantity

    db.commit()

    db.refresh(cart_item)

    return cart_item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> None:
    cart = db.scalar(
        select(Cart).where(
            Cart.customer_id == current_user.id
        )
    )

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id,
        )
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    db.delete(cart_item)

    db.commit()


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clear_cart(
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> None:
    cart = db.scalar(
        select(Cart).where(
            Cart.customer_id == current_user.id
        )
    )

    if cart is None:
        return

    for item in list(cart.items):
        db.delete(item)

    db.commit()