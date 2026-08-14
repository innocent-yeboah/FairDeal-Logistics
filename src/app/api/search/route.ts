import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, base_price, media:product_media(url, position)")
    .eq("is_active", true)
    .ilike("name", `%${q}%`)
    .limit(8);

  if (error) return NextResponse.json({ results: [] });

  const results = (data ?? []).map((p) => ({
    slug: p.slug,
    name: p.name,
    price: Number(p.base_price),
    image: (Array.isArray(p.media) ? p.media[0]?.url : undefined) ?? null,
  }));
  return NextResponse.json({ results });
}
