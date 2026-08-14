import Link from "next/link";
import { requireWholesaleUser } from "@/lib/auth";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function WholesaleDashboard() {
  const { supabase, user, profile } = await requireWholesaleUser();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Wholesale portal"
          title={`Welcome back${profile.full_name ? `, ${profile.full_name}` : ""}`}
          subtitle={profile.business_name ? `${profile.business_name} · Approved partner` : "Approved wholesale partner"}
          className="mb-0"
        />
        <div className="flex gap-2">
          <Button href="/wholesale/catalog">Browse catalog</Button>
          <Button href="/wholesale/checkout" variant="outline">Checkout</Button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-ink/50">Orders</div>
            <div className="mt-1 font-display text-3xl">{orders?.length ?? 0}</div>
            <p className="text-xs text-ink/60 mt-1">Recent wholesale orders</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-ink/50">MOQ</div>
            <div className="mt-1 font-display text-3xl">10</div>
            <p className="text-xs text-ink/60 mt-1">Units to unlock wholesale price</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-ink/50">Payment terms</div>
            <div className="mt-1 font-display text-3xl">30d</div>
            <p className="text-xs text-ink/60 mt-1">Net terms for verified partners</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Order history</h2>
          <Link href="/account/orders" className="text-sm text-brand-700">All orders →</Link>
        </div>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-ink/60">No wholesale orders yet. Start from the catalog.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl2 border border-line bg-white">
            {orders.map((o) => (
              <li key={o.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <Link href={`/account/orders/${o.id}`} className="font-medium text-brand-700">#{o.order_number}</Link>
                  <div className="text-xs text-ink/60">{formatDate(o.created_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
                  <span className="font-medium">{formatMoney(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
