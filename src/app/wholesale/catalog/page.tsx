import { requireWholesaleUser } from "@/lib/auth";
import { Container, SectionHeading } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import type { ProductWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WholesaleCatalog() {
  const { supabase } = await requireWholesaleUser();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(slug,name), brand:brands(slug,name), media:product_media(url,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price)")
    .eq("is_active", true)
    .not("wholesale_price", "is", null)
    .order("name")
    .limit(48);

  const products = (data as ProductWithRelations[] | null) ?? [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHeading
          eyebrow="Wholesale catalog"
          title="Partner pricing"
          subtitle="Prices shown on product pages include your wholesale rate. Minimum order is 10 units."
          className="mb-0"
        />
        <Button href="/wholesale/checkout">Go to checkout</Button>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-ink/60">No wholesale products yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} wholesale />
          ))}
        </div>
      )}
    </Container>
  );
}
