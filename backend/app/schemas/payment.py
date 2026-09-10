from pydantic import BaseModel, Field


class RazorpayOrderCreateRequest(BaseModel):
    order_id: int = Field(gt=0)


class RazorpayOrderResponse(BaseModel):
    order_id: int
    razorpay_order_id: str
    amount: int
    currency: str
    key_id: str


class RazorpayPaymentVerifyRequest(BaseModel):
    order_id: int = Field(gt=0)
    razorpay_order_id: str = Field(min_length=1, max_length=100)
    razorpay_payment_id: str = Field(min_length=1, max_length=100)
    razorpay_signature: str = Field(min_length=1, max_length=255)


class RazorpayPaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    order_id: int
    payment_status: str
    order_status: str