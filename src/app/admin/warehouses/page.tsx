import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { WarehouseForm } from "@/components/admin/WarehouseForm";

export const dynamic = "force-dynamic";

export default async function AdminWarehouses() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("warehouses").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Warehouses</h1>
        <p className="text-sm text-ink/60">Physical locations that hold stock.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px] items-start">
        <Table>
          <THead>
            <TR>
              <TH>Code</TH>
              <TH>Name</TH>
              <TH>City / Region</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <tbody>
            {(data ?? []).map((w) => (
              <TR key={w.id}>
                <TD className="font-mono text-xs">{w.code}</TD>
                <TD className="font-medium">{w.name}</TD>
                <TD>{[w.city, w.region].filter(Boolean).join(", ") || "—"}</TD>
                <TD>{w.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}</TD>
              </TR>
            ))}
            {(data ?? []).length === 0 ? (
              <TR><TD colSpan={4} className="text-center py-8 text-ink/60">No warehouses yet.</TD></TR>
            ) : null}
          </tbody>
        </Table>

        <WarehouseForm />
      </div>
    </div>
  );
}
