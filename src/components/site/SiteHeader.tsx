"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE, CATEGORY_SLUGS } from "@/lib/constants";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=perfumes", label: "Perfumes" },
  { href: "/shop?category=cosmetics", label: "Cosmetics" },
  { href: "/shop?category=body-essentials", label: "Body" },
  { href: "/wholesale", label: "Wholesale" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());
  const hydrated = useCart((s) => s.hydrated);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/85 backdrop-blur">
      <div className="bg-brand-600 text-white text-xs">
        <div className="container flex h-8 items-center justify-between">
          <span>Free delivery on orders over ₵500 in Accra & Kumasi.</span>
          <div className="hidden sm:flex gap-4 opacity-90">
            <a href={`tel:${SITE.supportPhone}`}>{SITE.supportPhone}</a>
            <Link href="/account/orders">Track my order</Link>
          </div>
        </div>
      </div>
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-display text-lg text-gold-400"
          >
            F
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg text-ink">Fair Deal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Logistics Gh</div>
          </div>
        </Link>

        <nav className="ml-4 hidden md:flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-ink/80 hover:text-brand-700 transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden lg:flex flex-1 max-w-md">
          <SearchAutocomplete />
        </div>

        <div className="ml-auto lg:ml-2 flex items-center gap-3">
          <Link
            href="/account"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink/80 hover:text-brand-700"
          >
            <UserIcon /> Account
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-3.5 h-10 text-sm hover:bg-ink/90"
          >
            <BagIcon />
            <span className="hidden sm:inline">Cart</span>
            <span
              className={cn(
                "min-w-[20px] h-5 grid place-items-center rounded-full bg-gold-400 text-ink text-[11px] font-semibold px-1",
                (!hydrated || count === 0) && "opacity-70",
              )}
              aria-label={`${count} items in cart`}
            >
              {hydrated ? count : 0}
            </span>
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-line"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-line bg-white">
          <div className="container py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {CATEGORY_SLUGS.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="py-2 text-ink/80"
                onClick={() => setOpen(false)}
              >
                {c.label}
              </Link>
            ))}
            <Link href="/account" className="py-2 text-ink/80" onClick={() => setOpen(false)}>
              Account
            </Link>
            <Link href="/wholesale" className="py-2 text-ink/80" onClick={() => setOpen(false)}>
              Wholesale
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
