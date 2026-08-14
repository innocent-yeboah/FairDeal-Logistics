import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS, SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import type { Address, Order, OrderItem } from "@/lib/types";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Order>();
  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, tracking_number, carrier, status, estimated_delivery, delivered_at")
    .eq("order_id", order.id);

  const shipping = order.shipping_address as Address | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/account/orders" className="text-sm text-ink/60 hover:text-brand-700">
            ← All orders
          </Link>
          <h1 className="mt-1 font-display text-2xl">Order #{order.order_number}</h1>
          <p className="text-sm text-ink/60">Placed {formatDate(order.placed_at ?? order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone={statusTone(order.status)}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
          <Badge tone={statusTone(order.payment_status)}>Payment: {order.payment_status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px] items-start">
        <div className="space-y-6">
          <Card>
            <CardBody className="p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Item</TH>
                    <TH>Qty</TH>
                    <TH className="text-right">Price</TH>
                    <TH className="text-right">Total</TH>
                  </TR>
                </THead>
                <tbody>
                  {(items as OrderItem[] | null)?.map((i) => (
                    <TR key={i.id}>
                      <TD>
                        <div className="font-medium">{i.name_snapshot}</div>
                        <div className="text-xs text-ink/60">{i.sku_snapshot}</div>
                      </TD>
                      <TD>{i.quantity}</TD>
                      <TD className="text-right">{formatMoney(i.unit_price)}</TD>
                      <TD className="text-right font-medium">{formatMoney(i.line_total)}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>

          {shipments && shipments.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-display text-lg mb-3">Shipments</h2>
                <ul className="space-y-3 text-sm">
                  {shipments.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-lg border border-line p-3">
                      <div>
                        <div className="font-medium">{s.carrier || "Fair Deal Logistics"}</div>
                        <div className="text-xs text-ink/60">
                          Tracking: {s.tracking_number ?? "—"} · ETA {formatDate(s.estimated_delivery)}
                        </div>
                      </div>
                      <Badge tone={statusTone(s.status)}>{SHIPMENT_STATUS_LABELS[s.status] ?? s.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardBody>
            <h2 className="font-display text-lg">Summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink/70">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/70">Shipping</dt><dd>{formatMoney(order.shipping_amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/70">Tax</dt><dd>{formatMoney(order.tax_amount)}</dd></div>
              {order.discount_amount ? (
                <div className="flex justify-between"><dt className="text-ink/70">Discount</dt><dd>-{formatMoney(order.discount_amount)}</dd></div>
              ) : null}
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold text-brand-700">{formatMoney(order.total)}</dd>
              </div>
            </dl>

            {shipping ? (
              <div className="mt-6">
                <h3 className="text-xs uppercase tracking-wider text-ink/60">Ship to</h3>
                <address className="mt-1 not-italic text-sm text-ink">
                  {shipping.recipient}<br />
                  {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
                  {shipping.city}, {shipping.region}<br />
                  {shipping.country}<br />
                  {shipping.phone}
                </address>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
