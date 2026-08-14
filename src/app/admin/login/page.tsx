"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function AdminLogin() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen grid place-items-center bg-ink px-4">
      <Card className="w-full max-w-md">
        <CardBody>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.25em] text-gold-600">Fair Deal</div>
            <h1 className="mt-1 font-display text-2xl">Admin sign in</h1>
            <p className="mt-1 text-sm text-ink/60">
              Restricted area. Contact your administrator for access.
            </p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Email" required>
              <Input name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Password" required>
              <Input name="password" type="password" required autoComplete="current-password" />
            </Field>
            <div className="text-right">
              <a href="/account/forgot-password" className="text-xs text-brand-600">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
