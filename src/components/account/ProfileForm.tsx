"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  email: string;
  fullName: string;
  phone: string;
}

export function ProfileForm({ email, fullName, phone }: Props) {
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState({ fullName, phone });
  const toast = useToast();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      toast.push("Please sign in again.", "error");
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: values.fullName, phone: values.phone, updated_at: new Date().toISOString() })
      .eq("id", userRes.user.id);
    setBusy(false);
    if (error) toast.push(error.message, "error");
    else toast.push("Profile updated", "success");
  }

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-lg">Edit profile</h2>
        <form onSubmit={onSubmit} className="mt-5 space-y-4 max-w-md">
          <Field label="Email">
            <Input value={email} readOnly />
          </Field>
          <Field label="Full name" required>
            <Input
              value={values.fullName}
              onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
              required
            />
          </Field>
          <Field label="Phone">
            <Input
              value={values.phone}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              placeholder="+233 …"
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
