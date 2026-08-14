import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/admin/KpiCard";
import { Sparkline } from "@/components/admin/Sparkline";
import { Card, CardBody } from "@/components/ui/Card";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface SalesDay { day: string; orders: number; revenue: number }
interface LowStock { id: string; product_name: string; variant_name: string; sku: string; warehouse_name: string; quantity: number; reorder_level: number }

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();

  const [
    { count: ordersTotal },
    { count: productsTotal },
    { count: customersTotal },
    { data: salesRaw },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("v_sales_by_day").select("*").order("day", { ascending: true }).limit(30),
    supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("v_low_stock").select("*").limit(6),
  ]);

  const sales = (salesRaw as SalesDay[] | null) ?? [];
  const revenue30d = sales.reduce((s, d) => s + Number(d.revenue ?? 0), 0);
  const trend = sales.map((d) => Number(d.revenue ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Overview</h1>
        <p className="text-sm text-ink/60">Snapshot of the last 30 days.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/products/new" className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">Add product</Link>
        <Link href="/admin/orders" className="rounded-lg border border-line bg-white px-4 py-2 text-sm">Create / manage orders</Link>
        <Link href="/admin/inventory" className="rounded-lg border border-line bg-white px-4 py-2 text-sm">Update inventory</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard tone="brand" label="Revenue (30d)" value={formatMoney(revenue30d)} />
        <KpiCard tone="gold" label="Orders" value={String(ordersTotal ?? 0)} />
        <KpiCard tone="neutral" label="Active products" value={String(productsTotal ?? 0)} />
        <KpiCard tone="neutral" label="Customers" value={String(customersTotal ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Revenue trend</h2>
              <span className="text-xs text-ink/60">Last 30 days</span>
            </div>
            <div className="mt-4">
              <Sparkline data={trend} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Low stock</h2>
              <Link href="/admin/inventory" className="text-xs text-brand-700">Manage →</Link>
            </div>
            {!lowStock || lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-ink/60">Everything is well-stocked.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {(lowStock as LowStock[]).map((l) => (
                  <li key={l.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{l.product_name}</div>
                      <div className="text-xs text-ink/60">{l.warehouse_name} · {l.sku}</div>
                    </div>
                    <span className="text-rose-500 font-semibold">{l.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-700">View all →</Link>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Order</TH>
              <TH>Date</TH>
              <TH>Status</TH>
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <tbody>
            {(recentOrders ?? []).map((o) => (
              <TR key={o.id}>
                <TD>
                  <Link className="text-brand-700 font-medium" href={`/admin/orders/${o.id}`}>
                    #{o.order_number}
                  </Link>
                </TD>
                <TD>{formatDate(o.created_at)}</TD>
                <TD>
                  <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
                </TD>
                <TD className="text-right font-medium">{formatMoney(o.total)}</TD>
              </TR>
            ))}
            {(recentOrders ?? []).length === 0 ? (
              <TR><TD colSpan={4} className="text-center text-ink/60 py-8">No orders yet.</TD></TR>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
