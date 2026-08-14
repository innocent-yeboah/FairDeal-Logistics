import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { ShipmentStatusButton } from "@/components/admin/ShipmentStatusButton";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  driver_name: string | null;
  order: { id: string; order_number: string } | { id: string; order_number: string }[] | null;
}

export default async function AdminShipments() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("shipments")
    .select(
      "id, tracking_number, carrier, status, estimated_delivery, delivered_at, driver_name, order:orders(id, order_number)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Shipments</h1>
        <p className="text-sm text-ink/60">Track deliveries end-to-end.</p>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Tracking</TH>
            <TH>Order</TH>
            <TH>Carrier / driver</TH>
            <TH>Status</TH>
            <TH>ETA</TH>
            <TH>Delivered</TH>
            <TH className="text-right">Advance</TH>
          </TR>
        </THead>
        <tbody>
          {rows.map((s) => {
            const order = Array.isArray(s.order) ? s.order[0] : s.order;
            return (
              <TR key={s.id}>
                <TD className="text-xs font-mono">{s.tracking_number ?? s.id.slice(0, 8)}</TD>
                <TD>
                  {order ? (
                    <Link href={`/admin/orders/${order.id}`} className="text-brand-700 font-medium">
                      #{order.order_number}
                    </Link>
                  ) : "—"}
                </TD>
                <TD>
                  <div>{s.carrier || "Fair Deal Logistics"}</div>
                  <div className="text-xs text-ink/60">{s.driver_name || "—"}</div>
                </TD>
                <TD><Badge tone={statusTone(s.status)}>{SHIPMENT_STATUS_LABELS[s.status] ?? s.status}</Badge></TD>
                <TD className="text-xs">{formatDate(s.estimated_delivery)}</TD>
                <TD className="text-xs">{formatDate(s.delivered_at)}</TD>
                <TD className="text-right">
                  <ShipmentStatusButton shipmentId={s.id} currentStatus={s.status} />
                </TD>
              </TR>
            );
          })}
          {rows.length === 0 ? (
            <TR><TD colSpan={7} className="text-center py-8 text-ink/60">No shipments yet. Shipments are created from orders.</TD></TR>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
