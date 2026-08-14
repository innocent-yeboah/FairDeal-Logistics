import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

interface SettingsData {
  company_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  currency: string;
  tax_rate_percent: number;
  free_shipping_threshold: number;
}

const FALLBACK: SettingsData = {
  company_name: "Fair Deal Logistics Gh",
  support_email: "hello@fairdealgh.com",
  support_phone: "+233 30 000 0000",
  address: "Accra, Ghana",
  currency: "GHS",
  tax_rate_percent: 0,
  free_shipping_threshold: 500,
};

export default async function AdminSettings() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("settings").select("data").eq("id", 1).maybeSingle();
  const raw = (data?.data ?? {}) as Partial<SettingsData>;
  const initial: SettingsData = { ...FALLBACK, ...raw };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Settings</h1>
        <p className="text-sm text-ink/60">Company, shipping thresholds, and integration notes.</p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
