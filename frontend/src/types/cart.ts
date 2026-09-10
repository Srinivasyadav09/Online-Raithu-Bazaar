export interface CartProduct {
  id: number;
  name: string;
  price: string;
  unit: string;
  image: string | null;
  stock_quantity: string;
  organic: boolean;
  is_available: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: string;
  product: CartProduct;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  customer_id: number;
  items: CartItem[];
  subtotal: string;
}