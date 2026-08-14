"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/format";

interface Entry {
  slug: string;
  name: string;
  price: number;
  image: string | null;
}

const KEY = "fdlgh-recently-viewed";
const MAX = 8;

/** Records the current product and renders other recently viewed ones. */
export function RecentlyViewed({ current }: { current: Entry }) {
  const [items, setItems] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const prev: Entry[] = raw ? (JSON.parse(raw) as Entry[]) : [];
      const others = prev.filter((e) => e.slug !== current.slug);
      setItems(others.slice(0, 4));
      localStorage.setItem(KEY, JSON.stringify([current, ...others].slice(0, MAX)));
    } catch {
      // localStorage unavailable — skip silently
    }
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="recently-viewed-heading">
      <h2 id="recently-viewed-heading" className="font-display text-2xl mb-6">
        Recently viewed
      </h2>
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {items.map((e) => (
          <Link
            key={e.slug}
            href={`/product/${e.slug}`}
            className="group rounded-xl2 overflow-hidden bg-white border border-line shadow-soft hover:shadow-pop transition"
          >
            <div className="relative aspect-square bg-cream">
              {e.image ? (
                <Image
                  src={e.image}
                  alt={e.name}
                  fill
                  sizes="(min-width:1024px) 22vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="p-3">
              <div className="text-sm text-ink line-clamp-1">{e.name}</div>
              <div className="text-sm font-semibold text-gold-600">{formatMoney(e.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
