import Link from "next/link";
import { SITE } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const CATEGORIES = [
  { href: "/shop?category=perfumes", label: "Perfumes" },
  { href: "/shop?category=oil-perfumes", label: "Oil Perfumes" },
  { href: "/shop?category=body-sprays", label: "Body Sprays" },
  { href: "/shop?category=cosmetics", label: "Cosmetics" },
  { href: "/shop?category=skincare", label: "Skincare" },
  { href: "/shop?category=body-essentials", label: "Body Essentials" },
] as const;

const HELP_LINKS = [
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns" },
  { href: "/faq", label: "FAQ" },
  { href: "/policies/privacy", label: "Privacy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-brand-800 bg-brand-900 text-white/80">
      <div className="container py-8 sm:py-12">
        {/* Brand — compact on mobile */}
        <div className="flex items-start gap-3 sm:gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-400 text-brand-800 font-display text-base ring-2 ring-terracotta-500/50 sm:h-9 sm:w-9 sm:text-lg">
            F
          </span>
          <div className="min-w-0">
            <div className="font-display text-white text-base sm:text-lg leading-tight">Fair Deal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Logistics Gh</div>
            <p className="mt-1.5 hidden text-sm text-white/70 max-w-xs sm:block">{SITE.tagline}</p>
            <p className="mt-2 text-xs text-white/65 sm:mt-3 sm:text-sm">
              <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
              <span className="mx-1.5 text-white/35">·</span>
              <a href={`tel:${SITE.supportPhone}`}>{SITE.supportPhone}</a>
            </p>
          </div>
        </div>

        {/* Link columns — 2-up on mobile, 3-up from sm */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:mt-8 sm:grid-cols-3 sm:gap-8">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-white sm:text-sm sm:normal-case sm:tracking-normal">
              Quick Links
            </h4>
            <ul className="mt-2 space-y-1 text-sm sm:mt-3 sm:space-y-1.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-white sm:text-sm sm:normal-case sm:tracking-normal">
              Categories
            </h4>
            <ul className="mt-2 space-y-1 text-sm sm:mt-3 sm:space-y-1.5">
              {CATEGORIES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-white sm:text-sm sm:normal-case sm:tracking-normal">
              Help
            </h4>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm sm:mt-3 sm:block sm:space-y-1.5">
              {HELP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-3.5 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs text-white/60 text-center sm:text-left">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>Paystack · Made in Ghana</span>
        </div>
      </div>
    </footer>
  );
}
