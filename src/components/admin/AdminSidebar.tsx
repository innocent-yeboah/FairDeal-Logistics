"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/products", label: "Products", icon: "🧴" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/customers", label: "Customers", icon: "👤" },
  { href: "/admin/inventory", label: "Inventory", icon: "📦" },
  { href: "/admin/warehouses", label: "Warehouses", icon: "🏢" },
  { href: "/admin/shipments", label: "Shipments", icon: "🚚" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 min-h-screen bg-ink text-white/85 flex flex-col">
      <div className="h-14 flex items-center px-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-400 text-brand-700 font-display">
            F
          </span>
          <div className="leading-tight">
            <div className="text-white font-display">Fair Deal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Admin</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 text-sm">
        {LINKS.map((l) => {
          const active =
            l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5",
                active && "bg-brand-600 text-white hover:bg-brand-600",
              )}
            >
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-white/50 border-t border-white/10">
        Fair Deal Logistics · v1
      </div>
    </aside>
  );
}
