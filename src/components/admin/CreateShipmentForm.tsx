"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export function CreateShipmentForm({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const tracking = String(fd.get("tracking") || "");
    const { error } = await supabase.from("shipments").insert({
      order_id: orderId,
      carrier: String(fd.get("carrier") || "Fair Deal Logistics"),
      tracking_number: tracking || null,
      driver_name: String(fd.get("driver") || "") || null,
      status: "created",
    });
    if (!error) {
      await supabase
        .from("orders")
        .update({ status: "shipped", updated_at: new Date().toISOString() })
        .eq("id", orderId);
    }
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push("Shipment created", "success");
    router.refresh();
  }

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-lg">Create shipment</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Carrier">
            <Input name="carrier" defaultValue="Fair Deal Logistics" />
          </Field>
          <Field label="Tracking number">
            <Input name="tracking" placeholder="Optional" />
          </Field>
          <Field label="Driver" className="sm:col-span-2">
            <Input name="driver" />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Create shipment"}</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
