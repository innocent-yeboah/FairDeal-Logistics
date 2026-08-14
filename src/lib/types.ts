export type UUID = string;

export interface Category {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  position: number;
}

export interface Brand {
  id: UUID;
  slug: string;
  name: string;
  logo_url: string | null;
}

export interface ProductVariant {
  id: UUID;
  product_id: UUID;
  sku: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  is_default: boolean;
}

export interface ProductMedia {
  id: UUID;
  product_id: UUID;
  url: string;
  alt: string | null;
  position: number;
}

export interface Product {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  category_id: UUID | null;
  brand_id: UUID | null;
  base_price: number;
  wholesale_price: number | null;
  currency: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  category?: Pick<Category, "slug" | "name"> | null;
  brand?: Pick<Brand, "slug" | "name"> | null;
  variants?: ProductVariant[];
  media?: ProductMedia[];
}

export interface CartItem {
  productId: UUID;
  variantId: UUID;
  slug: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export interface Address {
  id?: UUID;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  country: string;
  postal_code?: string | null;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  currency: string;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  shipping_address: Address | null;
  billing_address: Address | null;
  notes: string | null;
  placed_at: string | null;
  created_at: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID | null;
  variant_id: UUID | null;
  name_snapshot: string;
  sku_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}
