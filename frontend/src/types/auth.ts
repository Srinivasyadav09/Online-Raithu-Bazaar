export type UserRole = "CUSTOMER" | "FARMER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface FarmerRegisterRequest extends RegisterRequest {
  farm_name: string;
  description?: string;
  location?: string;
  district?: string;
  state?: string;
  years_of_farming?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
