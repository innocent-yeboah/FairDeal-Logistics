import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatusControls } from "@/components/admin/OrderStatusControls";
import { CreateShipmentForm } from "@/components/admin/CreateShipmentForm";
import { Button } from "@/components/ui/Button";
import type { Address, Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).maybeSingle<Order>();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);

  const shipping = order.shipping_address as Address | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-ink/60 hover:text-brand-700">← All orders</Link>
          <h1 className="mt-1 font-display text-2xl">#{order.order_number}</h1>
          <p className="text-sm text-ink/60">Placed {formatDate(order.placed_at ?? order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone={statusTone(order.status)}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
          <Badge tone={statusTone(order.payment_status)}>Payment: {order.payment_status}</Badge>
          <Button href={`/admin/orders/${order.id}/invoice`} variant="outline" size="sm">Print invoice</Button>
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

          <OrderStatusControls orderId={order.id} currentStatus={order.status} />
          <CreateShipmentForm orderId={order.id} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody>
              <h2 className="font-display text-lg">Customer</h2>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-ink/60">Name</dt><dd>{order.guest_name || "Registered"}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/60">Email</dt><dd>{order.guest_email || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/60">Phone</dt><dd>{order.guest_phone || "—"}</dd></div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg">Ship to</h2>
              {shipping ? (
                <address className="mt-2 not-italic text-sm text-ink">
                  {shipping.recipient}<br />
                  {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
                  {shipping.city}, {shipping.region}<br />
                  {shipping.country}<br />
                  {shipping.phone}
                </address>
              ) : (
                <p className="mt-2 text-sm text-ink/60">No shipping address.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg">Totals</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/60">Shipping</dt><dd>{formatMoney(order.shipping_amount)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/60">Tax</dt><dd>{formatMoney(order.tax_amount)}</dd></div>
                {order.discount_amount ? (
                  <div className="flex justify-between"><dt className="text-ink/60">Discount</dt><dd>-{formatMoney(order.discount_amount)}</dd></div>
                ) : null}
                <div className="flex justify-between border-t border-line pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold text-brand-700">{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
