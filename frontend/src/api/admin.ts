import api from "./axios";
import type { Farmer, FarmerVerificationStatus } from "../types/farmer";

export interface AdminFarmer extends Farmer {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: "FARMER";
    is_active: boolean;
  };
}

export async function getFarmerApplications(): Promise<AdminFarmer[]> {
  const response = await api.get<AdminFarmer[]>("/admin/farmers");
  return response.data;
}

export async function startFarmerVerification(farmerId: number): Promise<AdminFarmer> {
  const response = await api.post<AdminFarmer>(`/admin/farmers/${farmerId}/start-verification`);
  return response.data;
}

export async function approveFarmer(farmerId: number): Promise<AdminFarmer> {
  const response = await api.post<AdminFarmer>(`/admin/farmers/${farmerId}/approve`);
  return response.data;
}

export function getStatusLabel(status: FarmerVerificationStatus): string {
  if (status === "PROFILE_SUBMITTED") return "Profile submitted";
  if (status === "VERIFYING") return "Verifying";
  return "Completed";
}
