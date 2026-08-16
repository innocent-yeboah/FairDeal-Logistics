import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/wholesale",
    "/cart",
    "/about",
    "/contact",
    "/faq",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from("products").select("slug, updated_at").eq("is_active", true).limit(500);
    const products = (data ?? []).map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...products];
  } catch {
    return staticRoutes;
  }
}
