"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { CartItem } from "@/lib/types";

interface Variant {
  id: string;
  sku: string;
  name: string;
  price: number;
}

interface Props {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variants: Variant[];
  defaultVariantId?: string;
}

export function AddToCartButton({ productId, slug, name, image, variants, defaultVariantId }: Props) {
  const [variantId, setVariantId] = useState<string>(defaultVariantId ?? variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const toast = useToast();
  const router = useRouter();

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];

  function handleAdd(navigate?: boolean) {
    if (!variant) return;
    const item: CartItem = {
      productId,
      variantId: variant.id,
      slug,
      name,
      variantName: variant.name,
      price: variant.price,
      quantity: qty,
      image,
      sku: variant.sku,
    };
    add(item);
    toast.push(`${name} added to cart`, "success");
    if (navigate) router.push("/cart");
  }

  return (
    <div className="space-y-4">
      {variants.length > 1 ? (
        <div>
          <div className="text-sm font-medium text-ink mb-2">Variant</div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={
                  "px-3 h-10 rounded-full border text-sm " +
                  (variantId === v.id
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-line bg-white text-ink hover:border-brand-600")
                }
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-white h-11">
          <button
            type="button"
            className="w-10 h-11 text-lg text-ink/70"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm">{qty}</span>
          <button
            type="button"
            className="w-10 h-11 text-lg text-ink/70"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button size="lg" onClick={() => handleAdd(false)} className="flex-1 sm:flex-none">
          Add to cart
        </Button>
        <Button variant="secondary" size="lg" onClick={() => handleAdd(true)}>
          Buy now
        </Button>
      </div>
    </div>
  );
}
