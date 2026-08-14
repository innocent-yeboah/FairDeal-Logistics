import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";
import { CATEGORY_SLUGS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { ProductWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  collection?: string;
  sort?: string;
  min?: string;
  max?: string;
  page?: string;
}

const PAGE_SIZE = 12;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createSupabaseServerClient();

  const category = searchParams.category;
  const brand = searchParams.brand;
  const collection = searchParams.collection;
  const q = (searchParams.q ?? "").trim();
  let sort = searchParams.sort ?? "newest";
  const min = Number(searchParams.min ?? "");
  const max = Number(searchParams.max ?? "");
  const page = Math.max(1, Number(searchParams.page ?? "1"));

  // Collections map onto query behaviour
  if (collection === "best-sellers") sort = "popular";
  if (collection === "new-arrivals") sort = "newest";

  const [categoryRes, brandsRes] = await Promise.all([
    category
      ? supabase.from("categories").select("id").eq("slug", category).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("brands").select("slug, name").order("name"),
  ]);
  const categoryId: string | null = categoryRes.data?.id ?? null;
  const brands = brandsRes.data ?? [];

  let brandId: string | null = null;
  if (brand) {
    const { data } = await supabase.from("brands").select("id").eq("slug", brand).maybeSingle();
    brandId = data?.id ?? null;
  }

  let query = supabase
    .from("products")
    .select(
      "*, category:categories(slug,name), brand:brands(slug,name), media:product_media(url,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price)",
      { count: "exact" },
    )
    .eq("is_active", true);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (brandId) query = query.eq("brand_id", brandId);
  if (collection === "limited-editions") query = query.contains("tags", ["limited"]);
  if (collection === "wholesale-deals") query = query.not("wholesale_price", "is", null);
  if (q) query = query.ilike("name", `%${q}%`);
  if (Number.isFinite(min) && min > 0) query = query.gte("base_price", min);
  if (Number.isFinite(max) && max > 0) query = query.lte("base_price", max);

  if (sort === "price-asc") query = query.order("base_price", { ascending: true });
  else if (sort === "price-desc") query = query.order("base_price", { ascending: false });
  else if (sort === "popular") query = query.order("rating_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  const products = (data as ProductWithRelations[] | null) ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="The catalog"
        title="Shop everything"
        subtitle="Filter by category, price and popularity. All prices in Ghana cedis (₵)."
      />

      <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
        <aside className="space-y-8">
          <FilterSection title="Categories">
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href="/shop"
                  className={cn("block px-2 py-1.5 rounded-md", !category && "bg-brand-50 text-brand-700 font-medium")}
                >
                  All
                </Link>
              </li>
              {CATEGORY_SLUGS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className={cn(
                      "block px-2 py-1.5 rounded-md hover:bg-cream",
                      category === c.slug && "bg-brand-50 text-brand-700 font-medium",
                    )}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FilterSection>

          {brands.length > 0 ? (
            <FilterSection title="Brands">
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href={category ? `/shop?category=${category}` : "/shop"}
                    className={cn("block px-2 py-1.5 rounded-md", !brand && "bg-brand-50 text-brand-700 font-medium")}
                  >
                    All brands
                  </Link>
                </li>
                {brands.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/shop?brand=${b.slug}${category ? `&category=${category}` : ""}`}
                      className={cn(
                        "block px-2 py-1.5 rounded-md hover:bg-cream",
                        brand === b.slug && "bg-brand-50 text-brand-700 font-medium",
                      )}
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterSection>
          ) : null}

          <FilterSection title="Price (₵)">
            <form action="/shop" className="grid grid-cols-2 gap-2 text-sm">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <input
                name="min"
                type="number"
                placeholder="Min"
                defaultValue={searchParams.min}
                className="rounded-md border border-line bg-white h-9 px-2"
              />
              <input
                name="max"
                type="number"
                placeholder="Max"
                defaultValue={searchParams.max}
                className="rounded-md border border-line bg-white h-9 px-2"
              />
              <button className="col-span-2 h-9 rounded-md bg-ink text-white text-sm">Apply</button>
            </form>
          </FilterSection>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3 justify-between">
            <p className="text-sm text-ink/70">
              {count ?? 0} {(count ?? 0) === 1 ? "product" : "products"}
              {q ? ` for "${q}"` : ""}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink/60">Sort:</span>
              <SortSelect value={sort} />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
              <p className="font-display text-lg text-ink">Catalog is warming up.</p>
              <p className="mt-1 text-sm text-ink/60">Check your Supabase environment variables.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
              <p className="font-display text-lg text-ink">No products match your filters.</p>
              <p className="mt-1 text-sm text-ink/60">Try clearing filters or a different search.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                const params = new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(q ? { q } : {}),
                  ...(sort ? { sort } : {}),
                  page: String(n),
                });
                return (
                  <Link
                    key={n}
                    href={`/shop?${params.toString()}`}
                    className={cn(
                      "min-w-9 h-9 grid place-items-center rounded-md border border-line bg-white",
                      n === page && "bg-brand-600 text-white border-brand-600",
                    )}
                  >
                    {n}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/60 mb-3">{title}</h3>
      {children}
    </div>
  );
}
