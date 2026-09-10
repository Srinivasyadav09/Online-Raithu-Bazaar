from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


def generate_order_number() -> str:
    return f"ORB-{uuid4().hex[:12].upper()}"


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    request: OrderCreate,
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> Order:
    cart = db.scalar(
        select(Cart)
        .where(Cart.customer_id == current_user.id)
        .options(
            joinedload(Cart.items).joinedload(CartItem.product)
        )
    )

    if cart is None or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty",
        )

    # Get the product IDs from the cart.
    product_ids = [
        item.product_id
        for item in cart.items
    ]

    # Lock product rows during checkout validation.
    # This prevents stock from changing while the order
    # is being prepared.
    products = list(
        db.scalars(
            select(Product)
            .where(Product.id.in_(product_ids))
            .with_for_update()
        ).all()
    )

    products_by_id = {
        product.id: product
        for product in products
    }

    subtotal = Decimal("0.00")
    validated_items = []

    for cart_item in cart.items:
        product = products_by_id.get(cart_item.product_id)

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Product {cart_item.product_id} "
                    "no longer exists"
                ),
            )

        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Product '{product.name}' "
                    "is no longer available"
                ),
            )

        if cart_item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid quantity for "
                    f"'{product.name}'"
                ),
            )

        if cart_item.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for "
                    f"'{product.name}'. "
                    f"Available: {product.stock_quantity}"
                ),
            )

        item_total = product.price * cart_item.quantity
        subtotal += item_total

        validated_items.append(
            {
                "cart_item": cart_item,
                "product": product,
                "item_total": item_total,
            }
        )

    # Create the ORB order.
    #
    # IMPORTANT:
    # Stock is NOT reduced here.
    # The cart is NOT cleared here.
    #
    # Both happen only after successful Razorpay
    # payment verification.
    order = Order(
        customer_id=current_user.id,
        order_number=generate_order_number(),
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
        subtotal=subtotal,
        total_amount=subtotal,
        shipping_name=request.shipping.name.strip(),
        shipping_phone=request.shipping.phone.strip(),
        shipping_address=request.shipping.address.strip(),
        shipping_city=request.shipping.city.strip(),
        shipping_state=request.shipping.state.strip(),
        shipping_pincode=request.shipping.pincode.strip(),
    )

    db.add(order)
    db.flush()

    # Store a snapshot of the products/prices at checkout.
    for validated_item in validated_items:
        cart_item = validated_item["cart_item"]
        product = validated_item["product"]
        item_total = validated_item["item_total"]

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            farmer_id=product.farmer_id,
            product_name=product.name,
            unit=product.unit,
            quantity=cart_item.quantity,
            unit_price=product.price,
            total_price=item_total,
        )

        db.add(order_item)

    db.commit()
    db.refresh(order)

    return order


@router.get(
    "",
    response_model=list[OrderResponse],
)
def list_my_orders(
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> list[Order]:
    statement = (
        select(Order)
        .where(Order.customer_id == current_user.id)
        .options(
            joinedload(Order.items)
        )
        .order_by(Order.created_at.desc())
    )

    return list(
        db.scalars(statement).unique().all()
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_my_order(
    order_id: int,
    current_user: User = Depends(
        require_role(UserRole.CUSTOMER)
    ),
    db: Session = Depends(get_db),
) -> Order:
    statement = (
        select(Order)
        .where(
            Order.id == order_id,
            Order.customer_id == current_user.id,
        )
        .options(
            joinedload(Order.items)
        )
    )

    order = db.scalar(statement)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order