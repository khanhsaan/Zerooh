import { Session, SupabaseClient } from '@supabase/supabase-js';

export interface AuthContextObject {
  supabase: SupabaseClient | null;
  authSession: Session | null;
  authError: ErrorType | null;
  authLoading: boolean;
}

export interface ResponseType {
  data: any;
  error: ErrorType | null;
}

export interface ErrorType {
  message: string;
  isFatal: boolean;
}

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

// Auth / Profile types
export interface CustomerProfile {
  firstName: string;
  lastName: string;
}

export interface BusinessProfile {
  businessName: string;
  phone: string;
  address: string;
  suburb: string;
  postcode: string;
}

// Product types
export type ProductCategoryEnum = 'Bakery' | 'Cafe' | 'Meals' | 'Drinks' | 'Grocery';

export interface ProductCategory {
  id: string;
  name: ProductCategoryEnum;
  created_at: string | null;
}

export interface ProductStatus {
  id: string;
  status_name: 'active' | 'sold_out';
  created_at: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string | null;
  status_id: string | null;
  product_name: string;
  short_description: string;
  long_description: string;
  original_price_cents: number;
  discounted_price_cents: number;
  stock: number;
  pickup_start: string | null;   // ISO timestamp
  pickup_end: string | null;     // ISO timestamp
  created_at: string | null;
  updated_at: string | null;
  // Joined fields
  images?: ProductImage[];
  category?: ProductCategory;
  business?: BusinessProfileRow | null;
}

export interface BusinessProfileRow {
  id: string;
  user_id: string;
  business_name: string;
  phone: string;
  address: string;
  suburb: string;
  postcode: string;
  created_at: string;
}

// Cart
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string | null;
  quantity: number | null;
  created_at: string;
  expired_at: string | null;
  // Joined
  product?: Product | null;
}

// Orders
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price_cents: number;
  status: OrderStatus;
  pickup_time: string | null;
  created_at: string;
  // Joined
  product?: Product | null;
}
