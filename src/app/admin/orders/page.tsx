import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "pending", "paid", "processing", "packed", "shipped", "delivered", "cancelled", "refunded"] as const;

export default async function AdminOrders({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const supabase = createSupabaseServerClient();
  const status = (searchParams.status ?? "all") as (typeof STATUSES)[number];
  const q = (searchParams.q ?? "").trim();

  let query = supabase
    .from("orders")
    .select("id, order_number, guest_email, guest_name, total, status, payment_status, created_at, user_id")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("order_number", `%${q}%`);
  const { data } = await query.limit(200);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Orders</h1>
          <p className="text-sm text-ink/60">All customer orders across the store.</p>
        </div>
        <form action="/admin/orders" className="flex items-center gap-2">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search order #…"
            className="h-10 w-56 rounded-lg border border-line bg-white px-3 text-sm"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders${s === "all" ? "" : `?status=${s}`}`}
            className={
              "rounded-full px-3 py-1.5 border " +
              (status === s
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white border-line text-ink/70 hover:border-brand-600")
            }
          >
            {s === "all" ? "All" : ORDER_STATUS_LABELS[s] ?? s}
          </Link>
        ))}
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Order</TH>
            <TH>Customer</TH>
            <TH>Date</TH>
            <TH>Status</TH>
            <TH>Payment</TH>
            <TH className="text-right">Total</TH>
          </TR>
        </THead>
        <tbody>
          {(data ?? []).map((o) => (
            <TR key={o.id}>
              <TD>
                <Link href={`/admin/orders/${o.id}`} className="text-brand-700 font-medium">
                  #{o.order_number}
                </Link>
              </TD>
              <TD>{o.guest_name || o.guest_email || (o.user_id ? "Registered customer" : "—")}</TD>
              <TD>{formatDate(o.created_at)}</TD>
              <TD><Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge></TD>
              <TD><Badge tone={statusTone(o.payment_status)}>{o.payment_status}</Badge></TD>
              <TD className="text-right font-medium">{formatMoney(o.total)}</TD>
            </TR>
          ))}
          {(data ?? []).length === 0 ? (
            <TR><TD colSpan={6} className="text-center py-8 text-ink/60">No orders match this filter.</TD></TR>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
