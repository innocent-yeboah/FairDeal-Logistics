"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function WarehouseForm() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("warehouses").insert({
      code: String(fd.get("code")),
      name: String(fd.get("name")),
      city: String(fd.get("city") ?? ""),
      region: String(fd.get("region") ?? ""),
      is_active: true,
    });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    (e.currentTarget as HTMLFormElement).reset();
    toast.push("Warehouse added", "success");
    router.refresh();
  }

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-lg">Add warehouse</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <Field label="Code" required>
            <Input name="code" required placeholder="ACC-02" />
          </Field>
          <Field label="Name" required>
            <Input name="name" required placeholder="Accra East Depot" />
          </Field>
          <Field label="City">
            <Input name="city" placeholder="Accra" />
          </Field>
          <Field label="Region">
            <Input name="region" placeholder="Greater Accra" />
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Add warehouse"}</Button>
        </form>
      </CardBody>
    </Card>
  );
}
