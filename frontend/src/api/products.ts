import api from "./axios";
import type {
  Product,
  ProductListResponse,
} from "../types/product";

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[] | ProductListResponse>(
    "/products",
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.items;
}

export async function getProduct(
  productId: number,
): Promise<Product> {
  const response = await api.get<Product>(
    `/products/${productId}`,
  );

  return response.data;
}
export async function getCategories(): Promise<import("../types/product").Category[]> {
  const response = await api.get<import("../types/product").Category[]>("/categories");
  return response.data;
}
