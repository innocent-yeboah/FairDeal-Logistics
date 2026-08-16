"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/types";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";

function pricing(product: ProductWithRelations, wholesale: boolean) {
  const image = product.media?.[0]?.url ?? "/products/placeholder-product.svg";
  const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
  const retail = Number(defaultVariant?.price ?? product.base_price);
  const price = wholesale && product.wholesale_price ? Number(product.wholesale_price) : retail;
  const compare = defaultVariant?.compare_at_price ? Number(defaultVariant.compare_at_price) : null;
  const discount =
    compare && compare > price ? Math.round(((compare - price) / compare) * 100) : null;
  return { image, defaultVariant, price, compare, discount };
}

/**
 * Dense deal card — Temu-inspired layout for Fair Deal (navy/gold).
 */
export function DealProductCard({
  product,
  wholesale = false,
  compact = false,
}: {
  product: ProductWithRelations;
  wholesale?: boolean;
  compact?: boolean;
}) {
  const { image, defaultVariant, price, compare, discount } = pricing(product, wholesale);
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
      price,
      quantity: 1,
      image,
      sku: defaultVariant.sku,
    });
    toast.push(`${product.name} added`, "success");
  }

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg bg-white border border-line/80 hover:border-gold-300 transition",
        compact ? "shadow-none" : "shadow-sm",
      )}
    >
      <Link href={`/product/${product.slug}`} className="relative aspect-square bg-cream">
        <ProductImage
          src={image}
          alt={product.name}
          fill
          sizes="(min-width:1024px) 16vw, 45vw"
          className="object-cover"
        />
        {discount ? (
          <span className="absolute left-1.5 top-1.5 rounded bg-terracotta-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        ) : product.is_featured ? (
          <span className="absolute left-1.5 top-1.5 rounded bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-ink">
            Hot
          </span>
        ) : null}
      </Link>
      <div className={cn("flex flex-1 flex-col", compact ? "p-2" : "p-2.5")}>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-[12px] leading-snug text-ink hover:text-brand-700"
        >
          {product.name}
        </Link>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold text-brand-700">{formatMoney(price)}</span>
            {compare && compare > price ? (
              <span className="text-[11px] text-ink/40 line-through">{formatMoney(compare)}</span>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-1">
            <span className="text-[10px] text-ink/50">
              {product.rating_count > 0
                ? `${Number(product.rating_avg).toFixed(1)}★ · ${product.rating_count}`
                : "Local stock"}
            </span>
            <button
              type="button"
              onClick={quickAdd}
              className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white text-sm hover:bg-brand-700"
              aria-label={`Add ${product.name} to cart`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
