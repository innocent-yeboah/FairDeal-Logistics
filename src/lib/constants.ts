export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Fair Deal Logistics Gh",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  currency: process.env.NEXT_PUBLIC_CURRENCY?.trim() || "GHS",
  currencySymbol: "₵",
  supportEmail: "hello@fairdealgh.com",
  supportPhone: "+233 53 330 4602",
  /** WhatsApp wa.me digits (no + or spaces). */
  whatsapp: "233533304602",
  tagline: "Authentic products. Trusted quality. Nationwide delivery.",
} as const;

export const CATEGORY_SLUGS = [
  { slug: "perfumes", label: "Perfumes" },
  { slug: "oil-perfumes", label: "Oil Perfumes" },
  { slug: "body-sprays", label: "Body Sprays" },
  { slug: "cosmetics", label: "Cosmetics" },
  { slug: "skincare", label: "Skincare" },
  { slug: "body-essentials", label: "Body Essentials" },
] as const;

export const COLLECTIONS = [
  { slug: "new-arrivals", label: "New Arrivals", blurb: "The freshest drops, straight from the warehouse." },
  { slug: "best-sellers", label: "Best Sellers", blurb: "Loved and reordered by our community." },
  { slug: "limited-editions", label: "Limited Editions", blurb: "Rare finds — when they're gone, they're gone." },
  { slug: "wholesale-deals", label: "Wholesale Deals", blurb: "Bulk pricing for retailers and resellers." },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
] as const;

export interface ShippingMethod {
  id: string;
  label: string;
  eta: string;
  price: number;
  /** Order subtotal above which this method becomes free (null = never free). */
  freeOver: number | null;
  note?: string;
}

export const SHIPPING_METHODS: readonly ShippingMethod[] = [
  { id: "standard", label: "Standard delivery", eta: "3–5 business days", price: 30, freeOver: 500 },
  { id: "express", label: "Express delivery", eta: "1–2 business days", price: 60, freeOver: null },
  { id: "same_day", label: "Same-day delivery", eta: "Today, within Accra", price: 80, freeOver: null, note: "Accra only" },
] as const;

export function shippingCost(methodId: string, subtotal: number): number {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId) ?? SHIPPING_METHODS[0]!;
  if (method.freeOver !== null && subtotal >= method.freeOver) return 0;
  return method.price;
}

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  /** Paystack channels enabled for this method. */
  channels: string[];
}

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  {
    id: "mobile_money",
    label: "Mobile Money",
    description: "MTN, Vodafone Cash, AirtelTigo Money",
    channels: ["mobile_money"],
  },
  {
    id: "card",
    label: "Card payment",
    description: "Visa, Mastercard — secured by Paystack",
    channels: ["card"],
  },
  {
    id: "bank_transfer",
    label: "Bank transfer",
    description: "Pay directly from your bank account",
    channels: ["bank_transfer"],
  },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  created: "Created",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  failed: "Delivery Failed",
  returned: "Returned",
};

export const WHOLESALE_TIERS = [
  { minUnits: 10, label: "10+ units", benefit: "Wholesale price unlocked" },
  { minUnits: 50, label: "50+ units", benefit: "Priority dispatch + dedicated support" },
  { minUnits: 100, label: "100+ units", benefit: "Best rates — contact us for a custom quote" },
] as const;

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "Savannah",
  "North East",
] as const;

export const WHOLESALE_MOQ = 10;
