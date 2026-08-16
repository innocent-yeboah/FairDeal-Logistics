import Link from "next/link";
import { DealProductCard } from "@/components/home/DealProductCard";
import type { ProductWithRelations } from "@/lib/types";

/**
 * Dense “You may like” product wall — Temu-style discovery grid.
 */
export function YouMayLike({ products }: { products: ProductWithRelations[] }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl text-ink">You may like</h2>
          <p className="text-xs text-ink/55 mt-0.5">Authentic stock · Clear prices · Add in one tap</p>
        </div>
        <Link href="/shop" className="text-xs font-semibold text-gold-600 hover:text-gold-500">
          Shop all →
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-display text-lg text-ink">Products loading soon</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-brand-700">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {products.map((p) => (
            <DealProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
