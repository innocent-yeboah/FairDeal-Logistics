import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeDiscount, validateCoupon, type CouponRow } from "@/lib/coupons";

const Schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon request" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", parsed.data.code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle<CouponRow>();

  if (!coupon) {
    return NextResponse.json({ error: "That code isn't valid — check the spelling?" }, { status: 404 });
  }

  const problem = validateCoupon(coupon, parsed.data.subtotal);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  return NextResponse.json({
    code: coupon.code,
    description: coupon.description,
    discount: computeDiscount(coupon, parsed.data.subtotal),
  });
}
