import api from "./axios";

export interface ShippingDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOrderRequest {
  shipping: ShippingDetails;
}

export interface OrderItem {
  id: number;
  product_id: number;
  farmer_id: number;
  product_name: string;
  unit: string;
  quantity: string;
  unit_price: string;
  total_price: string;
}

export interface Order {
  id: number;
  customer_id: number;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: string;
  total_amount: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export async function createOrder(
  data: CreateOrderRequest,
): Promise<Order> {
  const response = await api.post<Order>(
    "/orders",
    data,
  );

  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>(
    "/orders",
  );

  return response.data;
}

export async function getOrder(
  orderId: number,
): Promise<Order> {
  const response = await api.get<Order>(
    `/orders/${orderId}`,
  );

  return response.data;
}