import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatMoney, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function AccountDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl2 border border-line bg-white p-8 text-center">
        <p className="font-display text-xl">You&rsquo;re not signed in.</p>
        <p className="mt-1 text-sm text-ink/60">Sign in to view your orders and profile.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/account/login" className="text-brand-700 font-medium">Sign in</Link>
          <span className="text-ink/30">·</span>
          <Link href="/account/register" className="text-brand-700 font-medium">Create account</Link>
        </div>
      </div>
    );
  }

  const [{ data: recent }, { data: profile }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardBody>
          <h2 className="font-display text-lg">Profile</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Name</dt><dd>{profile?.full_name || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Email</dt><dd>{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Phone</dt><dd>{profile?.phone || "—"}</dd></div>
          </dl>
          <Link href="/account/profile" className="mt-4 inline-block text-sm text-brand-700 font-medium">
            Edit profile →
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Recent orders</h2>
            <Link href="/account/orders" className="text-sm text-brand-700">All orders →</Link>
          </div>
          {!recent || recent.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">You have no orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {recent.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium">#{o.order_number}</div>
                    <div className="text-xs text-ink/60">{formatDate(o.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
                    <div className="font-medium">{formatMoney(o.total)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
