"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function WholesaleApplyForm() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("wholesale_applications").insert({
      user_id: userRes.user?.id ?? null,
      business_name: String(fd.get("business")),
      contact_name: String(fd.get("contact")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone")),
      notes: String(fd.get("notes") ?? ""),
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push("Application received. We'll be in touch shortly.", "success");
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-xl">Apply for a wholesale account</h2>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <Field label="Business name" required>
            <Input name="business" required />
          </Field>
          <Field label="Contact name" required>
            <Input name="contact" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" required>
              <Input name="email" type="email" required />
            </Field>
            <Field label="Phone" required>
              <Input name="phone" required />
            </Field>
          </div>
          <Field label="Tell us about your business">
            <Textarea name="notes" placeholder="Location, product interests, monthly volume…" />
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send enquiry"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
