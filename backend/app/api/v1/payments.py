from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.payment import (
    RazorpayOrderCreateRequest,
    RazorpayOrderResponse,
    RazorpayPaymentVerifyRequest,
    RazorpayPaymentVerifyResponse,
)
from app.services.razorpay import razorpay_service


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


@router.post(
    "/razorpay/create-order",
    response_model=RazorpayOrderResponse,
)
def create_razorpay_order(
    request: RazorpayOrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RazorpayOrderResponse:
    order = db.scalar(
        select(Order).where(
            Order.id == request.order_id,
            Order.customer_id == current_user.id,
        )
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.payment_status == PaymentStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order has already been paid",
        )

    if order.razorpay_order_id:
        return RazorpayOrderResponse(
            order_id=order.id,
            razorpay_order_id=order.razorpay_order_id,
            amount=int(order.total_amount * 100),
            currency="INR",
            key_id=settings.razorpay_key_id,
        )

    try:
        razorpay_order = razorpay_service.create_order(
            amount=order.total_amount,
            receipt=order.order_number,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to create Razorpay order",
        ) from exc

    order.razorpay_order_id = razorpay_order["id"]

    db.commit()
    db.refresh(order)

    return RazorpayOrderResponse(
        order_id=order.id,
        razorpay_order_id=razorpay_order["id"],
        amount=razorpay_order["amount"],
        currency=razorpay_order["currency"],
        key_id=settings.razorpay_key_id,
    )


@router.post(
    "/razorpay/verify",
    response_model=RazorpayPaymentVerifyResponse,
)
def verify_razorpay_payment(
    request: RazorpayPaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RazorpayPaymentVerifyResponse:
    # Lock the order so two verification requests cannot
    # finalize the same order simultaneously.
    order = db.scalar(
        select(Order)
        .where(
            Order.id == request.order_id,
            Order.customer_id == current_user.id,
        )
        .with_for_update()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Idempotency:
    # If the same order was already successfully processed,
    # don't reduce stock or clear the cart again.
    if order.payment_status == PaymentStatus.PAID:
        return RazorpayPaymentVerifyResponse(
            success=True,
            message="Payment already verified",
            order_id=order.id,
            payment_status=order.payment_status.value,
            order_status=order.status.value,
        )

    if not order.razorpay_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay order has not been created",
        )

    if request.razorpay_order_id != order.razorpay_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay order ID does not match",
        )

    # Verify the Razorpay signature before changing
    # any order or inventory state.
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=order.razorpay_order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_signature=request.razorpay_signature,
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay payment signature",
        )

    # Prevent the same Razorpay payment ID from being
    # associated with another order.
    existing_payment = db.scalar(
        select(Order).where(
            Order.razorpay_payment_id
            == request.razorpay_payment_id,
            Order.id != order.id,
        )
    )

    if existing_payment is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Razorpay payment has already been processed",
        )

    # Lock all products belonging to this order.
    product_ids = [
        item.product_id
        for item in order.items
    ]

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

    # Re-check inventory immediately before finalizing
    # the successful payment.
    for order_item in order.items:
        product = products_by_id.get(order_item.product_id)

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Product '{order_item.product_name}' "
                    "no longer exists"
                ),
            )

        if order_item.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for "
                    f"'{product.name}'. "
                    f"Available: {product.stock_quantity}, "
                    f"required: {order_item.quantity}"
                ),
            )

        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Product '{product.name}' "
                    "is no longer available"
                ),
            )

    # Finalize inventory.
    for order_item in order.items:
        product = products_by_id[order_item.product_id]

        product.stock_quantity -= order_item.quantity

        if product.stock_quantity <= 0:
            product.stock_quantity = 0
            product.is_available = False

    # Clear the customer's cart.
    cart = db.scalar(
        select(Cart)
        .where(Cart.customer_id == current_user.id)
        .with_for_update()
    )

    if cart is not None:
        cart_items = list(
            db.scalars(
                select(CartItem).where(
                    CartItem.cart_id == cart.id
                )
            ).all()
        )

        for cart_item in cart_items:
            db.delete(cart_item)

    # Mark payment and order as successful.
    order.razorpay_payment_id = request.razorpay_payment_id
    order.payment_status = PaymentStatus.PAID
    order.status = OrderStatus.CONFIRMED

    db.commit()
    db.refresh(order)

    return RazorpayPaymentVerifyResponse(
        success=True,
        message="Payment verified successfully",
        order_id=order.id,
        payment_status=order.payment_status.value,
        order_status=order.status.value,
    )