"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/constants";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";

const SHOP_LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=perfumes", label: "Perfumes" },
  { href: "/shop?category=oil-perfumes", label: "Oil Perfumes" },
  { href: "/shop?category=body-sprays", label: "Body Sprays" },
  { href: "/shop?category=cosmetics", label: "Cosmetics" },
  { href: "/shop?category=skincare", label: "Skincare" },
  { href: "/shop?category=body-essentials", label: "Body" },
  { href: "/wholesale", label: "Wholesale" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const count = useCart((s) => s.count());
  const hydrated = useCart((s) => s.hydrated);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/85 backdrop-blur">
      <div className="bg-brand-700 text-white text-xs">
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
            className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-display text-lg text-gold-400 ring-2 ring-gold-400/40"
          >
            F
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg text-ink">Fair Deal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Logistics Gh</div>
          </div>
        </Link>

        <nav className="ml-4 hidden md:flex items-center gap-6 text-sm">
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 text-ink/80 hover:text-brand-700 transition"
              aria-expanded={shopOpen}
              aria-haspopup="true"
              onClick={() => setShopOpen((v) => !v)}
            >
              Shop
              <ChevronDown />
            </button>
            {shopOpen ? (
              <div className="absolute left-0 top-full z-50 min-w-[200px] pt-2">
                <ul className="rounded-xl border border-line bg-white py-2 shadow-soft">
                  {SHOP_LINKS.map((n) => (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        className="block px-4 py-2 text-ink/80 hover:bg-cream hover:text-brand-700"
                        onClick={() => setShopOpen(false)}
                      >
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="ml-auto hidden md:flex flex-1 max-w-md">
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
            className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-700 text-white px-3.5 h-10 text-sm hover:bg-brand-800"
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
          <div className="container py-3 flex flex-col text-sm">
            <div className="pb-3">
              <SearchAutocomplete />
            </div>
            <p className="pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink/50">Shop</p>
            {SHOP_LINKS.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="py-2 text-ink/80"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/account" className="py-2 text-ink/80 border-t border-line mt-1" onClick={() => setOpen(false)}>
              Account
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
function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
