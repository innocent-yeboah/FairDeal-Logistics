import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CouponStrip } from "@/components/home/CouponStrip";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { FlashDeals } from "@/components/home/FlashDeals";
import { PromoBanners } from "@/components/home/PromoBanners";
import { YouMayLike } from "@/components/home/YouMayLike";
import { HomeNewsletter } from "@/components/home/HomeNewsletter";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import type { ProductWithRelations } from "@/lib/types";

export const revalidate = 300;

const PRODUCT_SELECT =
  "*, category:categories(slug,name), brand:brands(slug,name), media:product_media(url,alt,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price)";

async function getCatalog(): Promise<{ deals: ProductWithRelations[]; feed: ProductWithRelations[] }> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("rating_count", { ascending: false })
      .limit(40);

    const products = (data as ProductWithRelations[] | null) ?? [];
    const deals = products.filter((p) => p.is_featured).slice(0, 6);
    return {
      deals: deals.length > 0 ? deals : products.slice(0, 6),
      feed: products,
    };
  } catch {
    return { deals: [], feed: [] };
  }
}

/**
 * Temu-inspired Fair Deal homepage: search, shortcuts, flash deals, dense feed.
 */
export default async function HomePage() {
  const { deals, feed } = await getCatalog();

  return (
    <main className="bg-cream min-h-screen">
      <div className="fd-brand-wash text-white">
        <div className="container py-4 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">
            Fair Deal Logistics Gh
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl leading-tight">
            Authentic beauty deals · Delivered across Ghana
          </h1>
          <div className="mt-4 max-w-xl [&_form]:bg-white [&_form]:border-0 [&_input]:text-ink [&_input]:placeholder:text-ink/40">
            <SearchAutocomplete />
          </div>
        </div>
      </div>

      <div className="container space-y-4 py-4 sm:py-6 pb-16">
        <CouponStrip />
        <CategoryShortcuts />
        <FlashDeals products={deals} />
        <PromoBanners />
        <YouMayLike products={feed} />
      </div>

      <HomeNewsletter />
    </main>
  );
}
