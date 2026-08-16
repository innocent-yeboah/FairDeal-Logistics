"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/components/ui/Toast";

export function ProductCard({ product, wholesale = false }: { product: ProductWithRelations; wholesale?: boolean }) {
  const image = product.media?.[0]?.url ?? "/products/placeholder-product.svg";
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const retail = defaultVariant?.price ?? product.base_price;
  const price = wholesale && product.wholesale_price ? product.wholesale_price : retail;
  const add = useCart((s) => s.add);
  const toast = useToast();

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    add({
      productId: product.id,
      variantId: defaultVariant.id,
      slug: product.slug,
      name: product.name,
      variantName: defaultVariant.name,
      price: Number(price),
      quantity: 1,
      image,
      sku: defaultVariant.sku,
    });
    toast.push(`${product.name} added to cart`, "success");
  }

  return (
    <div className="group flex flex-col rounded-xl2 overflow-hidden bg-white border border-line shadow-soft hover:shadow-pop transition">
      <Link href={`/product/${product.slug}`} className="relative aspect-square bg-cream">
        <ProductImage
          src={image}
          alt={product.name}
          fill
          sizes="(min-width:1024px) 22vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_featured ? (
          <span className="absolute left-3 top-3">
            <Badge tone="gold">Featured</Badge>
          </span>
        ) : null}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[11px] uppercase tracking-wide text-ink/50">
          {product.brand?.name ?? product.category?.name ?? "Fair Deal"}
        </div>
        <Link href={`/product/${product.slug}`} className="font-display text-lg text-ink mt-0.5 line-clamp-2 hover:text-brand-700">
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/60">
          <StarRow value={Number(product.rating_avg ?? 0)} />
          <span>
            {product.rating_count > 0
              ? `${Number(product.rating_avg).toFixed(1)} (${product.rating_count})`
              : "New"}
          </span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-semibold text-brand-700">{formatMoney(price)}</span>
          <button
            type="button"
            onClick={quickAdd}
            className="text-xs font-semibold rounded-full bg-brand-600 text-white px-3 h-8 hover:bg-brand-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="inline-flex text-gold-400" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i < filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="m12 3 2.7 5.5 6 .9-4.4 4.3 1 6L12 16.9 6.7 19.7l1-6L3.3 9.4l6-.9L12 3Z" />
        </svg>
      ))}
    </span>
  );
}
