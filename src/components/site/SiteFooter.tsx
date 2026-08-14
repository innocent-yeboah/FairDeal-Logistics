import Link from "next/link";
import { SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-ink text-white/80">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-400 text-brand-700 font-display text-lg">
              F
            </span>
            <div>
              <div className="font-display text-white text-lg">Fair Deal</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Logistics Gh</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-xs">
            Authentic beauty essentials, sourced with care and delivered across Ghana. Retail & wholesale.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop?category=perfumes">Perfumes</Link></li>
            <li><Link href="/shop?category=body-sprays">Body Sprays</Link></li>
            <li><Link href="/shop?category=cosmetics">Cosmetics</Link></li>
            <li><Link href="/shop?category=body-essentials">Body Essentials</Link></li>
            <li><Link href="/wholesale">Wholesale Enquiries</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Support</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/account/orders">Track my order</Link></li>
            <li><Link href="/policies/shipping">Shipping & delivery</Link></li>
            <li><Link href="/policies/returns">Returns policy</Link></li>
            <li><Link href="/policies/privacy">Privacy</Link></li>
            <li><Link href="/policies/terms">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></li>
            <li><a href={`tel:${SITE.supportPhone}`}>{SITE.supportPhone}</a></li>
            <li className="text-white/60">Accra · Kumasi · Nationwide delivery</li>
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
