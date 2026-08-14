import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SignOutButton } from "@/components/account/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page bypass
  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "customer";
  if (role !== "admin" && role !== "staff") {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-2xl">Not authorised</h1>
        <p className="mt-2 text-sm text-ink/70">
          Your account doesn&rsquo;t have admin access. Set your role to <code>admin</code> in the
          <code> profiles </code> table via Supabase to continue.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-brand-700 font-medium">Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink/50">Admin</div>
              <div className="font-medium text-sm text-ink">
                {profile?.full_name || user.email}
              </div>
            </div>
            <SignOutButton />
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
