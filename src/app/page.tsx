import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { CareToBeautyHero } from "@/components/site/CareToBeautyHero";
import { CATEGORY_SLUGS, COLLECTIONS } from "@/lib/constants";
import type { ProductWithRelations } from "@/lib/types";

export const revalidate = 300;

async function getFeatured(): Promise<ProductWithRelations[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(slug,name), brand:brands(slug,name), media:product_media(url,alt,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8);
    return (data as ProductWithRelations[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      <CareToBeautyHero />

      {/* Featured collections */}
      <section id="collections" className="py-16 bg-cream">
        <Container>
          <SectionHeading eyebrow="Curated for you" title="Featured collections" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?collection=${c.slug}`}
                className="group rounded-xl2 border border-line bg-white p-6 shadow-soft hover:shadow-pop transition"
              >
                <div className="font-display text-xl text-ink">{c.label}</div>
                <p className="mt-2 text-sm text-ink/60">{c.blurb}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-600 group-hover:gap-2 transition-all">
                  Browse <span aria-hidden>→</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="The essentials" title="Shop by category" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_SLUGS.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="group relative overflow-hidden rounded-xl2 bg-white border border-line aspect-[4/3] shadow-soft"
              >
                <Image
                  src={CATEGORY_IMAGES[c.slug]}
                  alt={c.label}
                  fill
                  sizes="(min-width:1024px) 22vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-600/90 via-brand-600/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-5">
                  <div>
                    <div className="text-white font-display text-xl">{c.label}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-gold-300 text-sm">
                      Explore <span aria-hidden>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="py-8">
        <Container>
          <div className="flex items-end justify-between mb-8">
            <SectionHeading
              eyebrow="Selected for you"
              title="Featured products"
              subtitle="Bestsellers loved by our community — from statement fragrances to everyday essentials."
              className="mb-0"
            />
            <Button href="/shop" variant="outline" className="hidden sm:inline-flex">
              View all
            </Button>
          </div>
          {featured.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
              <p className="font-display text-lg text-ink">Catalog loading soon.</p>
              <p className="mt-1 text-sm text-ink/60">
                Connect Supabase and run <code className="text-gold-600">supabase/schema.sql</code> to see products here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Trust signals */}
      <section className="mt-16 border-y border-line bg-cream">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-line">
            <TrustBar icon="✨" title="Authentic Products Guaranteed" body="Sourced direct from brands and licensed distributors." />
            <TrustBar icon="🚚" title="Nationwide Delivery" body="Doorstep delivery in all 16 regions of Ghana." />
            <TrustBar icon="🔒" title="Secure Payments" body="Mobile Money, cards and bank transfer via Paystack." />
            <TrustBar icon="🤝" title="100% Customer Satisfaction" body="Easy returns and real human support." />
          </div>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <Container>
          <div className="rounded-xl2 bg-brand-600 text-white p-10 lg:p-14 grid gap-8 lg:grid-cols-2 items-center shadow-pop">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl">Join our community</h2>
              <p className="mt-3 text-white/80 max-w-xl">
                Get 10% off your first order, plus early access to new arrivals and limited editions.
              </p>
            </div>
            <div className="lg:justify-self-end w-full lg:max-w-md">
              <NewsletterSignup />
            </div>
          </div>
        </Container>
      </section>

      {/* Wholesale CTA */}
      <section className="pb-20">
        <Container>
          <div className="rounded-xl2 border border-gold-200 bg-gold-50 p-10 lg:p-12 grid gap-6 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl text-ink">Selling beauty? Buy wholesale.</h2>
              <p className="mt-2 text-ink/70 max-w-xl">
                Retailers, salons and boutiques across Ghana trust Fair Deal for reliable stock,
                tiered pricing and quick logistics.
              </p>
            </div>
            <div className="lg:justify-self-end flex flex-wrap gap-3">
              <Button href="/wholesale" size="lg">Apply for wholesale</Button>
              <Button href="/account/register" variant="outline" size="lg">Create account</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

const CATEGORY_IMAGES: Record<string, string> = {
  perfumes: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&auto=format&fit=crop",
  "body-sprays": "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&auto=format&fit=crop",
  cosmetics: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&auto=format&fit=crop",
  "body-essentials": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&auto=format&fit=crop",
};

function TrustBar({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 p-6">
      <span className="text-2xl" aria-hidden>{icon}</span>
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <div className="text-sm text-ink/60">{body}</div>
      </div>
    </div>
  );
}
