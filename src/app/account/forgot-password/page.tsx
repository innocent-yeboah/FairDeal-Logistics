"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(String(fd.get("email")), {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    setSent(true);
  }

  return (
    <Container className="py-16 max-w-md">
      <Card>
        <CardBody>
          <h1 className="font-display text-2xl">Reset your password</h1>
          {sent ? (
            <p className="mt-3 text-sm text-ink/70">
              Check your inbox — we&rsquo;ve sent a link to reset your password.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink/60">
                Enter your email and we&rsquo;ll send you a reset link.
              </p>
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <Field label="Email" required>
                  <Input name="email" type="email" required autoComplete="email" />
                </Field>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}
          <p className="mt-4 text-center text-sm text-ink/60">
            <Link href="/account/login" className="text-brand-600 font-medium">
              Back to sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
