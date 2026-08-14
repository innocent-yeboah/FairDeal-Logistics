import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";
import { PrintButton } from "@/components/admin/PrintButton";
import type { Address, Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).maybeSingle<Order>();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  const shipping = order.shipping_address as Address | null;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 print:p-0">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-2xl">{SITE.name}</div>
          <p className="text-sm text-ink/60">{SITE.supportEmail} · {SITE.supportPhone}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-ink/50">Invoice</div>
          <div className="font-display text-xl">#{order.order_number}</div>
          <div className="text-xs text-ink/60">{formatDate(order.placed_at ?? order.created_at)}</div>
        </div>
      </div>

      {shipping ? (
        <div className="mt-8 text-sm">
          <div className="text-xs uppercase tracking-wider text-ink/50">Bill / ship to</div>
          <p className="mt-1">
            {shipping.recipient}<br />
            {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
            {shipping.city}, {shipping.region}, {shipping.country}<br />
            {shipping.phone}
          </p>
        </div>
      ) : null}

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink/50">
            <th className="py-2">Item</th>
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(items as OrderItem[] | null)?.map((i) => (
            <tr key={i.id} className="border-b border-line">
              <td className="py-2">{i.name_snapshot}</td>
              <td className="py-2">{i.quantity}</td>
              <td className="py-2 text-right">{formatMoney(i.unit_price)}</td>
              <td className="py-2 text-right">{formatMoney(i.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{formatMoney(order.shipping_amount)}</dd></div>
        {order.discount_amount ? (
          <div className="flex justify-between"><dt>Discount</dt><dd>-{formatMoney(order.discount_amount)}</dd></div>
        ) : null}
        <div className="flex justify-between border-t border-line pt-2 font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(order.total)}</dd>
        </div>
      </dl>

      <p className="mt-10 text-xs text-ink/50">Thank you for shopping with {SITE.name}.</p>
      <PrintButton />
    </div>
  );
}
