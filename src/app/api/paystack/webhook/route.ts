import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyCustomer } from "@/lib/notify";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const ok = await verifyPaystackSignature(raw, signature);
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      customer?: { email?: string; phone?: string };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) return NextResponse.json({ ok: true });

  const admin = createSupabaseAdminClient();

  if (event.event === "charge.success" && event.data?.status === "success") {
    const { data: order } = await admin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "paid",
        placed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)
      .select("id, order_number, total, guest_email, guest_phone, user_id")
      .maybeSingle();

    if (order) {
      let email = order.guest_email as string | null;
      let phone = order.guest_phone as string | null;
      if (order.user_id) {
        const { data: profile } = await admin
          .from("profiles")
          .select("phone")
          .eq("id", order.user_id)
          .maybeSingle();
        phone = phone ?? profile?.phone ?? null;
        const { data: user } = await admin.auth.admin.getUserById(order.user_id);
        email = email ?? user.user?.email ?? null;
      }
      void notifyCustomer({
        template: "payment_confirmation",
        email,
        phone,
        order: { id: order.id, order_number: order.order_number, total: Number(order.total) },
      });
    }
  } else if (event.event === "charge.failed") {
    await admin
      .from("orders")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("payment_reference", reference);
  }

  return NextResponse.json({ ok: true });
}
