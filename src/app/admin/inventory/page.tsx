import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { InventoryRow } from "@/components/admin/InventoryRow";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  quantity: number;
  reorder_level: number;
  variant: { id: string; sku: string; name: string; product: { name: string } | { name: string }[] | null } | null;
  warehouse: { id: string; name: string } | { id: string; name: string }[] | null;
}

export default async function AdminInventory() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("inventory")
    .select(
      "id, quantity, reorder_level, variant:product_variants(id, sku, name, product:products(name)), warehouse:warehouses(id, name)",
    )
    .order("quantity", { ascending: true })
    .limit(200);

  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Inventory</h1>
        <p className="text-sm text-ink/60">Stock levels per variant, per warehouse. Adjustments are logged.</p>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Product / variant</TH>
            <TH>SKU</TH>
            <TH>Warehouse</TH>
            <TH>Reorder at</TH>
            <TH className="text-right">Quantity</TH>
            <TH className="text-right">Adjust</TH>
          </TR>
        </THead>
        <tbody>
          {rows.map((r) => {
            const variant = r.variant;
            const product = variant ? (Array.isArray(variant.product) ? variant.product[0] : variant.product) : null;
            const warehouse = Array.isArray(r.warehouse) ? r.warehouse[0] : r.warehouse;
            const low = r.quantity <= r.reorder_level;
            return (
              <TR key={r.id}>
                <TD>
                  <div className="font-medium">{product?.name ?? "—"}</div>
                  <div className="text-xs text-ink/60">{variant?.name ?? ""}</div>
                </TD>
                <TD className="text-xs">{variant?.sku ?? "—"}</TD>
                <TD>{warehouse?.name ?? "—"}</TD>
                <TD>{r.reorder_level}</TD>
                <TD className="text-right">
                  {low ? (
                    <Badge tone="danger">Low · {r.quantity}</Badge>
                  ) : (
                    <span className="font-medium">{r.quantity}</span>
                  )}
                </TD>
                <TD className="text-right">
                  <InventoryRow inventoryId={r.id} variantId={variant?.id ?? ""} warehouseId={warehouse?.id ?? ""} quantity={r.quantity} />
                </TD>
              </TR>
            );
          })}
          {rows.length === 0 ? (
            <TR><TD colSpan={6} className="text-center py-8 text-ink/60">No inventory yet.</TD></TR>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
