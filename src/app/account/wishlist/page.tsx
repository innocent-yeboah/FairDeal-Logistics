import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Table";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  product: ProductWithRelations | ProductWithRelations[] | null;
}

export default async function WishlistPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("wishlists")
    .select(
      "id, product:products(*, category:categories(slug,name), media:product_media(url,position), variants:product_variants(id,sku,name,price,is_default,product_id,compare_at_price))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = ((data as Row[] | null) ?? [])
    .map((r) => (Array.isArray(r.product) ? r.product[0] : r.product))
    .filter((p): p is ProductWithRelations => Boolean(p));

  if (products.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it for later."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
