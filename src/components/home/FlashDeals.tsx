"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DealProductCard } from "@/components/home/DealProductCard";
import type { ProductWithRelations } from "@/lib/types";

function nextMidnight() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Flash deals row with end-of-day countdown — Temu-style urgency, Fair Deal brand.
 */
export function FlashDeals({ products }: { products: ProductWithRelations[] }) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const ms = Math.max(0, nextMidnight() - Date.now());
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      setLeft({ h, m, s });
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="rounded-xl bg-white border border-line overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 fd-brand-wash px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg sm:text-xl">Flash Deals</h2>
          <div className="flex items-center gap-1 text-xs font-semibold" aria-live="polite">
            <span className="opacity-90">Ends in</span>
            <TimeBox value={pad(left.h)} />
            <span className="text-gold-300">:</span>
            <TimeBox value={pad(left.m)} />
            <span className="text-gold-300">:</span>
            <TimeBox value={pad(left.s)} />
          </div>
        </div>
        <Link href="/shop?collection=best-sellers" className="text-xs font-medium text-gold-300 hover:text-gold-200">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3">
        {products.slice(0, 6).map((p) => (
          <DealProductCard key={p.id} product={p} compact />
        ))}
      </div>
    </section>
  );
}

function TimeBox({ value }: { value: string }) {
  return (
    <span className="inline-grid min-w-[1.6rem] place-items-center rounded bg-gold-400 px-1 py-0.5 text-[11px] font-bold text-ink">
      {value}
    </span>
  );
}
