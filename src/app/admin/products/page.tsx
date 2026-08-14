import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { formatMoney, formatDate } from "@/lib/format";
import { ProductCsvImport } from "@/components/admin/ProductCsvImport";

export const dynamic = "force-dynamic";

export default async function AdminProducts({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createSupabaseServerClient();
  const q = (searchParams.q ?? "").trim();

  let query = supabase
    .from("products")
    .select("id, slug, name, base_price, is_active, is_featured, updated_at, category:categories(name), brand:brands(name)")
    .order("updated_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  const { data: products } = await query.limit(100);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Products</h1>
          <p className="text-sm text-ink/60">Manage the catalog, prices and status.</p>
        </div>
        <div className="flex gap-2">
          <form action="/admin/products" className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="h-10 w-64 rounded-lg border border-line bg-white px-3 text-sm"
            />
            <Button variant="outline" type="submit">Search</Button>
          </form>
          <Button href="/admin/products/new">+ New product</Button>
          <ProductCsvImport />
        </div>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Product</TH>
            <TH>Category</TH>
            <TH>Brand</TH>
            <TH>Price</TH>
            <TH>Status</TH>
            <TH>Updated</TH>
            <TH></TH>
          </TR>
        </THead>
        <tbody>
          {(products ?? []).map((p) => {
            const cat = Array.isArray(p.category) ? p.category[0] : p.category;
            const br = Array.isArray(p.brand) ? p.brand[0] : p.brand;
            return (
              <TR key={p.id}>
                <TD>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-ink/60">/{p.slug}</div>
                </TD>
                <TD>{cat?.name ?? "—"}</TD>
                <TD>{br?.name ?? "—"}</TD>
                <TD>{formatMoney(p.base_price)}</TD>
                <TD className="space-x-1">
                  {p.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Hidden</Badge>}
                  {p.is_featured ? <Badge tone="gold">Featured</Badge> : null}
                </TD>
                <TD className="text-ink/60 text-xs">{formatDate(p.updated_at)}</TD>
                <TD className="text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-700 text-sm font-medium">
                    Edit
                  </Link>
                </TD>
              </TR>
            );
          })}
          {(products ?? []).length === 0 ? (
            <TR><TD colSpan={7} className="text-center py-8 text-ink/60">No products yet.</TD></TR>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
