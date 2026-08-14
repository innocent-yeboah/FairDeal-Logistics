import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const [{ data: product }, { data: categories }, { data: brands }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl">Edit product</h1>
      <p className="text-sm text-ink/60">Update details, pricing and visibility.</p>
      <div className="mt-6">
        <ProductForm
          categories={categories ?? []}
          brands={brands ?? []}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            base_price: Number(product.base_price),
            wholesale_price: product.wholesale_price ? Number(product.wholesale_price) : "",
            category_id: product.category_id ?? "",
            brand_id: product.brand_id ?? "",
            is_active: product.is_active,
            is_featured: product.is_featured,
            tags: (product.tags ?? []).join(", "),
          }}
        />
      </div>
    </div>
  );
}
