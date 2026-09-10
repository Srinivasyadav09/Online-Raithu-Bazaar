export type FarmerVerificationStatus =
  | "PROFILE_SUBMITTED"
  | "VERIFYING"
  | "COMPLETED";

export interface Farmer {
  id: number;
  farm_name: string;
  description: string | null;
  location: string | null;
  district: string | null;
  state: string | null;
  profile_image: string | null;
  farm_image: string | null;
  years_of_farming: number | null;
  organic_certified: boolean;
  verification_status: FarmerVerificationStatus;
  rating: number;
  created_at: string;
  updated_at: string;
}
