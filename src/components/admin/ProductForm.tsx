"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/format";

interface Option { id: string; name: string }

interface Initial {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  wholesale_price: number | "";
  category_id: string;
  brand_id: string;
  is_active: boolean;
  is_featured: boolean;
  tags: string;
}

interface Props {
  categories: Option[];
  brands: Option[];
  initial?: Initial;
}

export function ProductForm({ categories, brands, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<Initial>(
    initial ?? {
      id: "",
      name: "",
      slug: "",
      description: "",
      base_price: 0,
      wholesale_price: "",
      category_id: "",
      brand_id: "",
      is_active: true,
      is_featured: false,
      tags: "",
    },
  );

  function set<K extends keyof Initial>(k: K, v: Initial[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const payload = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description || null,
      base_price: Number(values.base_price),
      wholesale_price: values.wholesale_price === "" ? null : Number(values.wholesale_price),
      category_id: values.category_id || null,
      brand_id: values.brand_id || null,
      is_active: values.is_active,
      is_featured: values.is_featured,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    try {
      if (values.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", values.id);
        if (error) throw error;
        toast.push("Product updated", "success");
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        // Create a default variant
        await supabase.from("product_variants").insert({
          product_id: data.id,
          sku: `${payload.slug.toUpperCase()}-DEF`,
          name: "Standard",
          price: payload.base_price,
          is_default: true,
        });
        toast.push("Product created", "success");
        router.push(`/admin/products/${data.id}`);
        return;
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.push(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardBody className="space-y-4">
          <Field label="Name" required>
            <Input value={values.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Slug" hint="URL-friendly identifier. Auto-generated if left blank.">
            <Input
              value={values.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder={values.name ? slugify(values.name) : "product-slug"}
            />
          </Field>
          <Field label="Description">
            <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={5} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select value={values.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Brand">
              <Select value={values.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Retail price (₵)" required>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={values.base_price}
                onChange={(e) => set("base_price", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Wholesale price (₵)" hint="Optional.">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={values.wholesale_price}
                onChange={(e) => set("wholesale_price", e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Tags (comma-separated)">
            <Input value={values.tags} onChange={(e) => set("tags", e.target.value)} placeholder="perfume, oud" />
          </Field>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.is_featured}
                onChange={(e) => set("is_featured", e.target.checked)}
              />
              Featured
            </label>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" href="/admin/products">Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : values.id ? "Save changes" : "Create product"}</Button>
      </div>
    </form>
  );
}
