from decimal import Decimal

import razorpay

from app.core.config import settings


class RazorpayService:
    def __init__(self) -> None:
        self.client = razorpay.Client(
            auth=(
                settings.razorpay_key_id,
                settings.razorpay_key_secret,
            )
        )

    @staticmethod
    def amount_to_paise(amount: Decimal) -> int:
        """
        Convert INR amount to paise.

        Example:
        160.00 INR -> 16000 paise
        """
        return int(amount * 100)

    def create_order(
        self,
        amount: Decimal,
        receipt: str,
    ) -> dict:
        amount_in_paise = self.amount_to_paise(amount)

        if amount_in_paise < 1000:
            raise ValueError(
                "Razorpay order amount must be at least ₹10.00"
            )

        return self.client.order.create(
            data={
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt,
            }
        )

    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        try:
            self.client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )

            return True

        except razorpay.errors.SignatureVerificationError:
            return False


razorpay_service = RazorpayService()