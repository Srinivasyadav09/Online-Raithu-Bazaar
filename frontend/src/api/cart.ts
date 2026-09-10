import api from "./axios";
import type { Cart } from "../types/cart";

export interface AddCartItemRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>("/cart");
  return response.data;
}

export async function addToCart(data: AddCartItemRequest): Promise<Cart> {
  const response = await api.post<Cart>("/cart/items", data);
  return response.data;
}

export async function updateCartItem(
  itemId: number,
  quantity: number,
): Promise<Cart> {
  const response = await api.put<Cart>(`/cart/items/${itemId}`, {
    quantity,
  });

  return response.data;
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  const response = await api.delete<Cart>(`/cart/items/${itemId}`);

  return response.data;
}

export async function clearCart(): Promise<Cart> {
  const response = await api.delete<Cart>("/cart");
  return response.data;
}
