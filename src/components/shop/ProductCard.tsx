"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/components/ui/Toast";

export function ProductCard({ product, wholesale = false }: { product: ProductWithRelations; wholesale?: boolean }) {
  const image = product.media?.[0]?.url ?? "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop";
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
        <Image
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
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-semibold text-brand-700">{formatMoney(price)}</span>
          <button
            type="button"
            onClick={quickAdd}
            className="text-xs font-medium rounded-full border border-line px-3 h-8 hover:bg-brand-600 hover:text-white hover:border-brand-600"
          >
            Quick add
          </button>
        </div>
      </div>
    </div>
  );
}
