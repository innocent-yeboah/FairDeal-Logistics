"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";

interface Result {
  slug: string;
  name: string;
  price: number;
  image: string | null;
}

export function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const json = (await res.json()) as { results: Result[] };
        setResults(json.results);
        setOpen(true);
      } catch {
        // aborted or offline — ignore
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative flex-1 max-w-md">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          router.push(`/shop?q=${encodeURIComponent(query)}`);
        }}
        className="flex items-center gap-2 rounded-full border border-line bg-white px-4 h-10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          aria-label="Search products"
          placeholder="Search perfumes, lipsticks, lotions…"
          className="w-full bg-transparent text-sm placeholder:text-ink/40 focus:outline-none"
        />
      </form>

      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl2 border border-line bg-white shadow-pop animate-fadeIn">
          <ul>
            {results.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/product/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-cream border border-line flex-shrink-0">
                    <ProductImage src={r.image} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                  <span className="flex-1 truncate text-sm text-ink">{r.name}</span>
                  <span className="text-sm font-medium text-gold-600">{formatMoney(r.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/shop?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-cream"
          >
            See all results →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
