"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
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
    toast.push("Signed in", "success");
    router.push(params.get("redirect") ?? "/account");
    router.refresh();
  }

  return (
    <Container className="py-16 max-w-md">
      <Card>
        <CardBody>
          <h1 className="font-display text-2xl">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/60">Sign in to manage your orders and profile.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Field label="Email" required>
              <Input name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Password" required>
              <Input name="password" type="password" required autoComplete="current-password" />
            </Field>
            <div className="text-right">
              <Link href="/account/forgot-password" className="text-xs text-brand-600">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-ink/60">
            New here?{" "}
            <Link href="/account/register" className="text-brand-700 font-medium">
              Create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
