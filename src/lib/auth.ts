import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser(redirectTo = "/account/login") {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectTo)}`);
  return { supabase, user };
}

export async function requireWholesaleUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?redirect=/wholesale/dashboard");
  const { data: profile } = await supabase
    .from("profiles")
    .select("wholesale, full_name, business_name, tax_id, phone")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.wholesale) redirect("/wholesale?pending=1");
  return { supabase, user, profile };
}

export async function requireStaff() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "staff") redirect("/admin/login");
  return { supabase, user, profile };
}
