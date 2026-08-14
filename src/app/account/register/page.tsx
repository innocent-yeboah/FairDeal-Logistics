"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        data: { full_name: String(fd.get("fullName") ?? "") },
      },
    });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push("Account created — please verify your email.", "success");
    router.push("/account/login");
  }

  return (
    <Container className="py-16 max-w-md">
      <Card>
        <CardBody>
          <h1 className="font-display text-2xl">Create your account</h1>
          <p className="mt-1 text-sm text-ink/60">
            Faster checkout and order tracking, all in one place.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Field label="Full name" required>
              <Input name="fullName" required autoComplete="name" />
            </Field>
            <Field label="Email" required>
              <Input name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Password" required hint="At least 8 characters.">
              <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-ink/60">
            Already have an account?{" "}
            <Link href="/account/login" className="text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
