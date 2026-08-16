import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { ProductImage } from "@/components/ui/ProductImage";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShareButtons } from "@/components/shop/ShareButtons";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ReviewsSection, type Review } from "@/components/shop/ReviewsSection";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import { formatMoney } from "@/lib/format";
import { SITE } from "@/lib/constants";
import type { ProductWithRelations } from "@/lib/types";

export const revalidate = 120;

interface ProductAttributes {
  fragrance_notes?: string;
  ingredients?: string;
  features?: string[];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("products").select("name,description").eq("slug", params.slug).maybeSingle();
  return {
    title: data?.name ?? "Product",
    description: data?.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "*, category:categories(id,slug,name), brand:brands(slug,name), media:product_media(id,url,alt,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price)",
    )
    .eq("slug", params.slug)
    .eq("is_active", true)
    .maybeSingle<ProductWithRelations & {
      category: { id: string; slug: string; name: string } | null;
      attributes: ProductAttributes | null;
    }>();

  if (!product) notFound();

  const media = [...(product.media ?? [])].sort((a, b) => a.position - b.position);
  const cover = media[0]?.url ?? "/products/placeholder-product.svg";
  const variants = (product.variants ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    name: v.name,
    price: Number(v.price),
  }));
  const defaultVariant = product.variants?.find((v) => v.is_default);
  const displayPrice = Number(defaultVariant?.price ?? product.base_price);
  const attributes = (product.attributes ?? {}) as ProductAttributes;
  const productUrl = `${SITE.url}/product/${product.slug}`;

  const [{ data: related }, { data: reviewRows }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(slug,name), media:product_media(url,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price)")
      .eq("is_active", true)
      .neq("id", product.id)
      .eq("category_id", product.category?.id ?? "")
      .limit(4),
    supabase
      .from("reviews")
      .select("id, rating, title, body, created_at")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const reviews = (reviewRows as Review[] | null) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: media.map((m) => m.url),
    sku: defaultVariant?.sku,
    brand: product.brand?.name
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    aggregateRating:
      product.rating_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating_avg),
            reviewCount: product.rating_count,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: SITE.currency,
      price: displayPrice,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Container className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-ink/60 mb-6" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-brand-700">Shop</Link>
        {product.category ? (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-700">
              {product.category.name}
            </Link>
          </>
        ) : null}
        <span className="mx-1.5">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl2 bg-white border border-line">
            <ProductImage
              src={cover}
              alt={product.name}
              fill
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          {media.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {media.slice(0, 4).map((m) => (
                <div key={m.id} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
                  <ProductImage src={m.url} alt={m.alt ?? product.name} fill sizes="15vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-600">
            {product.brand?.name ?? "Fair Deal"}
          </div>
          <h1 className="mt-2 font-display text-3xl lg:text-4xl text-ink">{product.name}</h1>

          {product.rating_count > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gold-400">{"★".repeat(Math.round(Number(product.rating_avg)))}</span>
              <span className="text-ink/60">
                {Number(product.rating_avg).toFixed(1)} ({product.rating_count})
              </span>
            </div>
          ) : null}

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-brand-600">{formatMoney(displayPrice)}</span>
            {product.wholesale_price ? (
              <span className="text-xs text-ink/60">
                Wholesale from {formatMoney(product.wholesale_price)}
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-ink/75 leading-relaxed">
            {product.description ?? "No description provided."}
          </p>

          {attributes.features && attributes.features.length > 0 ? (
            <ul className="mt-4 space-y-1.5 text-sm text-ink/80">
              {attributes.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-gold-500 mt-0.5" aria-hidden>◆</span> {f}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex items-start gap-3">
            <div className="flex-1">
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                name={product.name}
                image={cover}
                variants={variants}
                defaultVariantId={defaultVariant?.id}
              />
            </div>
            <WishlistButton productId={product.id} />
          </div>

          {attributes.fragrance_notes ? (
            <DetailBlock title="Fragrance notes">{attributes.fragrance_notes}</DetailBlock>
          ) : null}
          {attributes.ingredients ? (
            <DetailBlock title="Ingredients">{attributes.ingredients}</DetailBlock>
          ) : null}

          <DetailBlock title="Shipping & returns">
            Same-day dispatch from Accra for orders placed by 2pm. Standard delivery 3–5 business days
            nationwide, express 1–2 days. Unopened items can be returned within 7 days.
          </DetailBlock>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <ShareButtons url={productUrl} title={product.name} />
            <Link href="/shop" className="text-sm text-brand-600 font-medium">
              Continue shopping →
            </Link>
          </div>

          {product.tags && product.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span key={t} className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs text-ink/70">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ReviewsSection
        productId={product.id}
        reviews={reviews}
        ratingAvg={Number(product.rating_avg)}
        ratingCount={product.rating_count}
      />

      {related && related.length > 0 ? (
        <section className="mt-20">
          <h2 className="font-display text-2xl mb-6">You may also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(related as ProductWithRelations[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewed
        current={{ slug: product.slug, name: product.name, price: displayPrice, image: cover }}
      />
    </Container>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="mt-4 rounded-xl2 border border-line bg-white group">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-sm font-medium text-ink">
        {title}
        <span className="text-ink/40 transition-transform group-open:rotate-45" aria-hidden>+</span>
      </summary>
      <div className="px-4 pb-4 text-sm text-ink/75 leading-relaxed">{children}</div>
    </details>
  );
}
