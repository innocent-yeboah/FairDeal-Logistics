import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const supabase = createSupabaseServerClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl">New product</h1>
      <p className="text-sm text-ink/60">Create a new product. A default variant will be created automatically.</p>
      <div className="mt-6">
        <ProductForm categories={categories ?? []} brands={brands ?? []} />
      </div>
    </div>
  );
}
