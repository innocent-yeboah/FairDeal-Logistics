"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

const NEXT: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["packed", "cancelled"],
  packed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export function OrderStatusControls({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState<string>(NEXT[currentStatus]?.[0] ?? "");
  const toast = useToast();
  const router = useRouter();
  const options = NEXT[currentStatus] ?? [];

  async function update() {
    if (!next) return;
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push("Order updated", "success");
    router.refresh();
  }

  if (options.length === 0) {
    return (
      <Card>
        <CardBody>
          <h2 className="font-display text-lg">Order status</h2>
          <p className="mt-2 text-sm text-ink/60">
            No further transitions available for status <strong>{currentStatus}</strong>.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h2 className="font-display text-lg">Advance order status</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Next status">
            <Select value={next} onChange={(e) => setNext(e.target.value)} className="w-56">
              {options.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s] ?? s}</option>
              ))}
            </Select>
          </Field>
          <Button onClick={update} disabled={busy}>{busy ? "Saving…" : "Update"}</Button>
        </div>
      </CardBody>
    </Card>
  );
}
