import api from "./axios";
import type {
  AuthResponse,
  FarmerRegisterRequest,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export async function login(
  data: LoginRequest,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data,
  );

  return response.data;
}

export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data,
  );

  return response.data;
}

export async function registerFarmer(
  data: FarmerRegisterRequest,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/register/farmer",
    data,
  );

  return response.data;
}

export async function getMe(): Promise<AuthResponse["user"]> {
  const response = await api.get<AuthResponse["user"]>("/auth/me");
  return response.data;
}
