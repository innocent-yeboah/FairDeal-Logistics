"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface SettingsData {
  company_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  currency: string;
  tax_rate_percent: number;
  free_shipping_threshold: number;
}

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("settings")
      .update({ data: values, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setBusy(false);
    if (error) toast.push(error.message, "error");
    else toast.push("Settings saved", "success");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <h2 className="font-display text-lg sm:col-span-2">General</h2>
          <Field label="Company name" className="sm:col-span-2">
            <Input value={values.company_name} onChange={(e) => setValues({ ...values, company_name: e.target.value })} />
          </Field>
          <Field label="Support email">
            <Input type="email" value={values.support_email} onChange={(e) => setValues({ ...values, support_email: e.target.value })} />
          </Field>
          <Field label="Support phone">
            <Input value={values.support_phone} onChange={(e) => setValues({ ...values, support_phone: e.target.value })} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={values.address} onChange={(e) => setValues({ ...values, address: e.target.value })} />
          </Field>
          <Field label="Currency">
            <Input value={values.currency} onChange={(e) => setValues({ ...values, currency: e.target.value })} />
          </Field>
          <Field label="Tax rate (%)">
            <Input type="number" value={values.tax_rate_percent} onChange={(e) => setValues({ ...values, tax_rate_percent: Number(e.target.value) })} />
          </Field>
          <Field label="Free shipping over (₵)">
            <Input type="number" value={values.free_shipping_threshold} onChange={(e) => setValues({ ...values, free_shipping_threshold: Number(e.target.value) })} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2 text-sm text-ink/70">
          <h2 className="font-display text-lg text-ink">Payments & messaging</h2>
          <p>Paystack keys live in environment variables — never in the database.</p>
          <ul className="list-disc list-inside">
            <li><code>PAYSTACK_SECRET_KEY</code> / <code>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code></li>
            <li><code>RESEND_API_KEY</code> / <code>RESEND_FROM_EMAIL</code> for order emails</li>
            <li><code>WHATSAPP_ACCESS_TOKEN</code> / <code>WHATSAPP_PHONE_NUMBER_ID</code></li>
            <li><code>CRON_SECRET</code> for abandoned-cart recovery</li>
          </ul>
        </CardBody>
      </Card>

      <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
    </form>
  );
}
