export interface CouponRow {
  code: string;
  description: string | null;
  percent_off: number | null;
  amount_off: number | null;
  min_subtotal: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export function computeDiscount(coupon: CouponRow, subtotal: number): number {
  if (coupon.percent_off) return Math.round(subtotal * coupon.percent_off) / 100;
  if (coupon.amount_off) return Math.min(Number(coupon.amount_off), subtotal);
  return 0;
}

/** Returns an error message if the coupon can't be applied, otherwise null. */
export function validateCoupon(coupon: CouponRow, subtotal: number): string | null {
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return "This code isn't active yet.";
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return "This code has expired.";
  if (subtotal < Number(coupon.min_subtotal)) {
    return `This code needs a minimum order of ₵${Number(coupon.min_subtotal).toFixed(2)}.`;
  }
  return null;
}
