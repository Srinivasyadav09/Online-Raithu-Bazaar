import api from "./axios";

export interface CreateRazorpayOrderRequest {
  order_id: number;
}

export interface CreateRazorpayOrderResponse {
  order_id: number;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  order_id: number;
  status: string;
  payment_status: string;
}

export async function createRazorpayOrder(
  data: CreateRazorpayOrderRequest,
): Promise<CreateRazorpayOrderResponse> {
  const response = await api.post<CreateRazorpayOrderResponse>(
    "/payments/razorpay/create-order",
    data,
  );

  return response.data;
}

export async function verifyRazorpayPayment(
  data: VerifyPaymentRequest,
): Promise<VerifyPaymentResponse> {
  const response = await api.post<VerifyPaymentResponse>(
    "/payments/razorpay/verify",
    data,
  );

  return response.data;
}