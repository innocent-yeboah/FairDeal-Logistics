import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Table, THead, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function AccountOrders() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, payment_status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your future orders will appear here." />;
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Order</TH>
          <TH>Date</TH>
          <TH>Status</TH>
          <TH>Payment</TH>
          <TH className="text-right">Total</TH>
        </TR>
      </THead>
      <tbody>
        {orders.map((o) => (
          <TR key={o.id}>
            <TD>
              <Link href={`/account/orders/${o.id}`} className="font-medium text-brand-700">
                #{o.order_number}
              </Link>
            </TD>
            <TD>{formatDate(o.created_at)}</TD>
            <TD>
              <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
            </TD>
            <TD>
              <Badge tone={statusTone(o.payment_status)}>{o.payment_status}</Badge>
            </TD>
            <TD className="text-right font-medium">{formatMoney(o.total)}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
