import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyCustomer } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Abandoned-cart recovery. Vercel Hobby allows one cron per day
 * (08:00 UTC). Pro can switch vercel.json back to hourly.
 *   GET /api/cron/abandoned-cart
 *   Authorization: Bearer $CRON_SECRET
 *
 * Cadence: 1h, 24h, 48h windows (recovery_emails_sent 0 → 1 → 2).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const now = Date.now();
  const windows = [
    { sent: 0, afterHours: 1 },
    { sent: 1, afterHours: 24 },
    { sent: 2, afterHours: 48 },
  ];

  let sent = 0;
  for (const w of windows) {
    const cutoff = new Date(now - w.afterHours * 60 * 60 * 1000).toISOString();
    const { data: orders } = await admin
      .from("orders")
      .select("id, order_number, total, guest_email, guest_phone, user_id, created_at, recovery_emails_sent")
      .eq("payment_status", "pending")
      .eq("status", "pending")
      .eq("recovery_emails_sent", w.sent)
      .lt("created_at", cutoff)
      .limit(50);

    for (const order of orders ?? []) {
      let email = order.guest_email as string | null;
      let phone = order.guest_phone as string | null;
      if (!email && order.user_id) {
        const { data: user } = await admin.auth.admin.getUserById(order.user_id);
        email = user.user?.email ?? null;
      }
      await notifyCustomer({
        template: "abandoned_cart",
        email,
        phone,
        order: { id: order.id, order_number: order.order_number, total: Number(order.total) },
      });
      await admin
        .from("orders")
        .update({
          recovery_emails_sent: w.sent + 1,
          last_recovery_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
