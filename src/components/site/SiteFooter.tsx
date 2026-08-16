import Link from "next/link";
import { SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-brand-800 bg-brand-900 text-white/80">
      <div className="container py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-400 text-brand-800 font-display text-lg ring-2 ring-terracotta-500/50">
              F
            </span>
            <div>
              <div className="font-display text-white text-lg">Fair Deal</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Logistics Gh</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-xs">{SITE.tagline}</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li><a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></li>
            <li><a href={`tel:${SITE.supportPhone}`}>{SITE.supportPhone}</a></li>
            <li className="text-white/60">Accra · Kumasi · Nationwide</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/wholesale">Wholesale</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Categories</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop?category=perfumes">Perfumes</Link></li>
            <li><Link href="/shop?category=oil-perfumes">Oil Perfumes</Link></li>
            <li><Link href="/shop?category=body-sprays">Body Sprays</Link></li>
            <li><Link href="/shop?category=cosmetics">Cosmetics</Link></li>
            <li><Link href="/shop?category=skincare">Skincare</Link></li>
            <li><Link href="/shop?category=body-essentials">Body Essentials</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Help</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/policies/shipping">Shipping</Link></li>
            <li><Link href="/policies/returns">Returns</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/policies/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>Payments secured by Paystack · Made in Ghana</span>
        </div>
      </div>
    </footer>
  );
}
