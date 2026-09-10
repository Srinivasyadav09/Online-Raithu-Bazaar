import api from "./axios";
import type { Farmer } from "../types/farmer";
import type { Product } from "../types/product";

export interface FarmerProfileUpdate {
  farm_name?: string;
  description?: string;
  location?: string;
  district?: string;
  state?: string;
  years_of_farming?: number;
  profile_image?: string;
  farm_image?: string;
}

export async function getMyFarmerProfile(): Promise<Farmer> {
  const response = await api.get<Farmer>("/farmers/me/profile");
  return response.data;
}

export async function createFarmerProfile(data: FarmerProfileUpdate & { farm_name: string }): Promise<Farmer> {
  const response = await api.post<Farmer>("/farmers/me", data);
  return response.data;
}

export async function updateMyFarmerProfile(data: FarmerProfileUpdate): Promise<Farmer> {
  const response = await api.put<Farmer>("/farmers/me", data);
  return response.data;
}

export async function uploadFarmerImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ url: string }>("/farmers/me/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.url;
}

export async function getMyProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/farmers/me/products");
  return response.data;
}

export async function createMyProduct(data: Omit<Product, "id" | "farmer_id" | "created_at" | "updated_at" | "category" | "farmer">): Promise<Product> {
  const response = await api.post<Product>("/farmers/me/products", data);
  return response.data;
}

export async function updateMyProduct(productId: number, data: Partial<Omit<Product, "id" | "farmer_id" | "created_at" | "updated_at" | "category" | "farmer">>): Promise<Product> {
  const response = await api.put<Product>(`/farmers/me/products/${productId}`, data);
  return response.data;
}

export async function deleteMyProduct(productId: number): Promise<void> {
  await api.delete(`/farmers/me/products/${productId}`);
}
