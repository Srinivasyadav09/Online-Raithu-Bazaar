export interface FarmerSummary {
  id: number;
  farm_name: string;
  location: string | null;
  district: string | null;
  state: string | null;
  profile_image: string | null;
  organic_certified: boolean;
  rating: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  unit: string;
  stock_quantity: string;
  image: string | null;
  organic: boolean;
  is_available: boolean;
  farmer_id: number;
  category_id: number;

  // Available on the product detail API
  farmer?: FarmerSummary;
  category?: Category;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}
