// Supabase Database Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  website?: string;
  display_order: number;
  is_active: boolean;
  featured: boolean;
  db_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  brand_id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  sku: string;
  tags: string[];
  original_price: number;
  discount_price: number;
  offer_percentage: number;
  tax: number;
  gender?: "men" | "women" | "unisex";
  product_type?: string;
  collection?: string;
  featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  thumbnail_url: string;
  hover_image_url?: string;
  video_url?: string;
  display_order: number;
  is_main: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  strap_type?: string;
  material?: string;
  dial_color?: string;
  sku: string;
  stock_quantity: number;
  stock_status: "in_stock" | "out_of_stock" | "low_stock";
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  variant_id?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  last_updated: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "staff" | "customer";
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
}

export interface HomepageContent {
  id: string;
  section_name: string;
  content: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  description: string;
  updated_at: string;
  updated_by: string;
}

export interface ContactInfo {
  id: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  social_media: Record<string, unknown>;
  business_hours: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  banner_image: string;
  featured_image: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  display_order: number;
  created_at: string;
}
