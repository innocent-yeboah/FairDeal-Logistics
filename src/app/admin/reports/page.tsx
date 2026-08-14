import { createSupabaseServerClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/admin/KpiCard";
import { Sparkline } from "@/components/admin/Sparkline";
import { Card, CardBody } from "@/components/ui/Card";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { formatMoney, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface SalesDay { day: string; orders: number; revenue: number }
interface TopProduct { id: string; name: string; units_sold: number; revenue: number }
interface LowStock { id: string; product_name: string; variant_name: string; sku: string; warehouse_name: string; quantity: number; reorder_level: number }

export default async function AdminReports() {
  const supabase = createSupabaseServerClient();

  const [{ data: sales }, { data: top }, { data: low }] = await Promise.all([
    supabase.from("v_sales_by_day").select("*").order("day", { ascending: true }),
    supabase.from("v_top_products").select("*").limit(10),
    supabase.from("v_low_stock").select("*"),
  ]);

  const salesArr = (sales as SalesDay[] | null) ?? [];
  const topArr = (top as TopProduct[] | null) ?? [];
  const lowArr = (low as LowStock[] | null) ?? [];

  const totalRevenue = salesArr.reduce((s, d) => s + Number(d.revenue ?? 0), 0);
  const totalOrders = salesArr.reduce((s, d) => s + Number(d.orders ?? 0), 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Reports</h1>
        <p className="text-sm text-ink/60">Sales, inventory & logistics insights.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard tone="brand" label="Total revenue" value={formatMoney(totalRevenue)} />
        <KpiCard tone="gold" label="Total orders" value={String(totalOrders)} />
        <KpiCard tone="neutral" label="Avg. order value" value={formatMoney(avgOrder)} />
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Revenue trend</h2>
            <span className="text-xs text-ink/60">All completed orders</span>
          </div>
          <div className="mt-3">
            <Sparkline data={salesArr.map((d) => Number(d.revenue ?? 0))} height={120} />
          </div>
        </CardBody>
      </Card>

      <div>
        <h2 className="font-display text-lg mb-3">Top-selling products</h2>
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH className="text-right">Units sold</TH>
              <TH className="text-right">Revenue</TH>
            </TR>
          </THead>
          <tbody>
            {topArr.map((p) => (
              <TR key={p.id}>
                <TD className="font-medium">{p.name}</TD>
                <TD className="text-right">{p.units_sold}</TD>
                <TD className="text-right">{formatMoney(p.revenue)}</TD>
              </TR>
            ))}
            {topArr.length === 0 ? (
              <TR><TD colSpan={3} className="text-center py-6 text-ink/60">No sales yet.</TD></TR>
            ) : null}
          </tbody>
        </Table>
      </div>

      <div>
        <h2 className="font-display text-lg mb-3">Low stock alerts</h2>
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>Variant</TH>
              <TH>Warehouse</TH>
              <TH className="text-right">Qty</TH>
              <TH className="text-right">Reorder</TH>
            </TR>
          </THead>
          <tbody>
            {lowArr.map((l) => (
              <TR key={l.id}>
                <TD className="font-medium">{l.product_name}</TD>
                <TD>{l.variant_name}</TD>
                <TD>{l.warehouse_name}</TD>
                <TD className="text-right text-rose-500 font-semibold">{l.quantity}</TD>
                <TD className="text-right">{l.reorder_level}</TD>
              </TR>
            ))}
            {lowArr.length === 0 ? (
              <TR><TD colSpan={5} className="text-center py-6 text-ink/60">All stock is above reorder levels.</TD></TR>
            ) : null}
          </tbody>
        </Table>
      </div>

      <p className="text-xs text-ink/50">
        Report window: {salesArr[0] ? formatDate(salesArr[0].day) : "—"} →{" "}
        {salesArr[salesArr.length - 1] ? formatDate(salesArr[salesArr.length - 1]!.day) : "—"}
      </p>
    </div>
  );
}
