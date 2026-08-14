import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { initializePaystackTransaction } from "@/lib/paystack";
import { PAYMENT_METHODS, SITE, shippingCost } from "@/lib/constants";
import { computeDiscount, validateCoupon, type CouponRow } from "@/lib/coupons";
import { notifyCustomer } from "@/lib/notify";

const AddressSchema = z.object({
  recipient: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().default("Ghana"),
});

const ItemSchema = z.object({
  variant_id: z.string().uuid(),
  product_id: z.string().uuid(),
  name: z.string(),
  variant_name: z.string(),
  sku: z.string().optional(),
  unit_price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

const BodySchema = z.object({
  customer: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    notes: z.string().optional().nullable(),
    createAccount: z.boolean().optional(),
  }),
  shipping_address: AddressSchema,
  shipping_method: z.string().default("standard"),
  payment_method: z.string().default("mobile_money"),
  coupon_code: z.string().optional().nullable(),
  order_type: z.enum(["retail", "wholesale", "distributor"]).default("retail"),
  business_name: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  items: z.array(ItemSchema).min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  const admin = createSupabaseAdminClient();
  const variantIds = body.items.map((i) => i.variant_id);
  const { data: variants, error: vErr } = await admin
    .from("product_variants")
    .select("id, price, product_id, sku, name, products:products(name, wholesale_price)")
    .in("id", variantIds);

  if (vErr || !variants) {
    return NextResponse.json({ error: "Unable to price cart" }, { status: 500 });
  }

  const isWholesale = body.order_type === "wholesale";
  const priceMap = new Map<string, number>();
  for (const v of variants) {
    const product = Array.isArray(v.products) ? v.products[0] : v.products;
    const wholesale = product && typeof product === "object" && "wholesale_price" in product
      ? Number((product as { wholesale_price: number | null }).wholesale_price)
      : NaN;
    const retail = Number(v.price);
    priceMap.set(v.id, isWholesale && Number.isFinite(wholesale) && wholesale > 0 ? wholesale : retail);
  }

  let subtotal = 0;
  for (const item of body.items) {
    const authoritative = priceMap.get(item.variant_id);
    if (authoritative == null) {
      return NextResponse.json({ error: `Unknown variant ${item.variant_id}` }, { status: 400 });
    }
    subtotal += authoritative * item.quantity;
  }

  let discount = 0;
  let couponCode: string | null = null;
  if (body.coupon_code) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", body.coupon_code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle<CouponRow>();
    if (coupon) {
      const invalid = validateCoupon(coupon, subtotal);
      if (!invalid) {
        discount = computeDiscount(coupon, subtotal);
        couponCode = coupon.code;
      }
    }
  }

  const shipping = shippingCost(body.shipping_method, subtotal);
  const total = Math.max(0.01, subtotal - discount + shipping);

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payment = PAYMENT_METHODS.find((m) => m.id === body.payment_method) ?? PAYMENT_METHODS[0]!;
  const reference = `FDL_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : body.customer.email,
      guest_name: user ? null : body.customer.fullName,
      guest_phone: user ? null : body.customer.phone,
      status: "pending",
      payment_status: "pending",
      payment_provider: "paystack",
      payment_reference: reference,
      payment_method: body.payment_method,
      shipping_method: body.shipping_method,
      coupon_code: couponCode,
      order_type: body.order_type,
      business_name: body.business_name ?? null,
      tax_id: body.tax_id ?? null,
      payment_terms: body.payment_terms ?? null,
      currency: SITE.currency,
      subtotal,
      shipping_amount: shipping,
      tax_amount: 0,
      discount_amount: discount,
      total,
      shipping_address: body.shipping_address,
      notes: body.customer.notes ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message ?? "Order create failed" }, { status: 500 });
  }

  const orderItemsRows = body.items.map((i) => {
    const unit = priceMap.get(i.variant_id) ?? i.unit_price;
    return {
      order_id: order.id,
      product_id: i.product_id,
      variant_id: i.variant_id,
      name_snapshot: i.name,
      sku_snapshot: i.sku ?? null,
      unit_price: unit,
      quantity: i.quantity,
      line_total: unit * i.quantity,
    };
  });

  const { error: itemsErr } = await admin.from("order_items").insert(orderItemsRows);
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  void notifyCustomer({
    template: "order_confirmation",
    email: body.customer.email,
    phone: body.customer.phone,
    order: { id: order.id, order_number: order.order_number, total },
  });

  try {
    const data = await initializePaystackTransaction({
      email: body.customer.email,
      amountKobo: Math.round(total * 100),
      reference,
      currency: SITE.currency,
      callbackUrl: `${SITE.url}/checkout/success`,
      channels: payment.channels,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        create_account: body.customer.createAccount ?? false,
      },
    });
    return NextResponse.json({ url: data.authorization_url, reference, order_number: order.order_number });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment init failed";
    await admin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
