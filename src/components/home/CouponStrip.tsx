import Link from "next/link";

/**
 * Sticky-feel coupon strip — Make the welcome deal obvious.
 */
export function CouponStrip() {
  return (
    <div className="rounded-xl bg-gold-50 border border-gold-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink">
        <span className="font-semibold text-brand-700">First order?</span>{" "}
        Use code <span className="font-bold text-terracotta-500">WELCOME10</span> for 10% off.
      </p>
      <Link
        href="/shop"
        className="inline-flex h-9 items-center rounded-full bg-brand-600 px-4 text-xs font-semibold text-white hover:bg-brand-700"
      >
        Shop deals →
      </Link>
    </div>
  );
}
