import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells: string[] = [];
      let current = "";
      let quoted = false;
      for (const ch of line) {
        if (ch === '"') {
          quoted = !quoted;
        } else if (ch === "," && !quoted) {
          cells.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      cells.push(current.trim());
      return cells;
    });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csv = await request.text();
  const rows = parseCsv(csv);
  if (rows.length < 2) return NextResponse.json({ error: "CSV needs a header and at least one row" }, { status: 400 });

  const header = (rows[0] ?? []).map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const nameI = idx("name");
  if (nameI < 0) return NextResponse.json({ error: "CSV must include a name column" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  let imported = 0;

  for (const row of rows.slice(1)) {
    const name = row[nameI] ?? "";
    if (!name) continue;
    const slug = (row[idx("slug")] || slugify(name)).toLowerCase();
    const description = row[idx("description")] || null;
    const basePrice = Number(row[idx("retail_price")] || row[idx("price")] || 0);
    const wholesale = row[idx("wholesale_price")] ? Number(row[idx("wholesale_price")]) : null;
    const tags = (row[idx("tags")] || "").split("|").map((t) => t.trim()).filter(Boolean);

    const { data: product, error } = await admin
      .from("products")
      .upsert(
        {
          name,
          slug,
          description,
          base_price: Number.isFinite(basePrice) ? basePrice : 0,
          wholesale_price: wholesale,
          tags,
          is_active: true,
        },
        { onConflict: "slug" },
      )
      .select("id, base_price")
      .single();
    if (error || !product) continue;

    await admin.from("product_variants").upsert(
      {
        product_id: product.id,
        sku: (row[idx("sku")] || `${slug.toUpperCase()}-DEF`).replace(/\s+/g, "_"),
        name: row[idx("variant")] || "Standard",
        price: Number(product.base_price),
        is_default: true,
      },
      { onConflict: "sku" },
    );
    imported += 1;
  }

  return NextResponse.json({ imported });
}
