import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const Schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("newsletter_subscribers")
    .upsert({ email: parsed.data.email.toLowerCase(), source: "homepage" }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: "Subscription failed — let's try that again?" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
