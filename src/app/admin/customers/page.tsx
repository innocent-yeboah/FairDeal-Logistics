import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomers({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createSupabaseServerClient();
  const q = (searchParams.q ?? "").trim();

  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, role, wholesale, created_at")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("full_name", `%${q}%`);
  const { data } = await query.limit(200);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Customers</h1>
          <p className="text-sm text-ink/60">All registered customers and staff.</p>
        </div>
        <form action="/admin/customers" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name…"
            className="h-10 w-56 rounded-lg border border-line bg-white px-3 text-sm"
          />
        </form>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Phone</TH>
            <TH>Role</TH>
            <TH>Wholesale</TH>
            <TH>Joined</TH>
          </TR>
        </THead>
        <tbody>
          {(data ?? []).map((c) => (
            <TR key={c.id}>
              <TD className="font-medium">{c.full_name || "—"}</TD>
              <TD>{c.phone || "—"}</TD>
              <TD>
                <Badge tone={c.role === "admin" ? "gold" : c.role === "staff" ? "info" : "neutral"}>
                  {c.role}
                </Badge>
              </TD>
              <TD>{c.wholesale ? <Badge tone="success">Yes</Badge> : <span className="text-ink/40">No</span>}</TD>
              <TD className="text-xs text-ink/60">{formatDate(c.created_at)}</TD>
            </TR>
          ))}
          {(data ?? []).length === 0 ? (
            <TR><TD colSpan={5} className="text-center py-8 text-ink/60">No customers found.</TD></TR>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
