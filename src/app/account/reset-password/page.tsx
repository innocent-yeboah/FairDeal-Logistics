"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));
    if (password !== confirm) {
      setBusy(false);
      toast.push("Passwords don't match", "error");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push("Password updated — welcome back!", "success");
    router.push("/account");
    router.refresh();
  }

  return (
    <Container className="py-16 max-w-md">
      <Card>
        <CardBody>
          <h1 className="font-display text-2xl">Choose a new password</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Field label="New password" required hint="At least 8 characters.">
              <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
            </Field>
            <Field label="Confirm password" required>
              <Input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}
