import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/account/SignOutButton";

const NAV = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/profile", label: "Profile" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuth = Boolean(user);

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600">Your account</p>
          <h1 className="mt-1 font-display text-3xl">
            {user?.email ? `Hello, ${user.email.split("@")[0] ?? "friend"}` : "Welcome"}
          </h1>
        </div>
        {isAuth ? <SignOutButton /> : null}
      </div>

      {isAuth ? (
        <div className="grid gap-8 lg:grid-cols-[220px,1fr]">
          <aside>
            <nav className="rounded-xl2 border border-line bg-white p-2 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block px-3 py-2 rounded-lg hover:bg-cream"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </Container>
  );
}
