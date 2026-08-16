"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";

const NEXT: Record<string, string> = {
  created: "picked_up",
  picked_up: "in_transit",
  in_transit: "out_for_delivery",
  out_for_delivery: "delivered",
};

export function ShipmentStatusButton({ shipmentId, currentStatus }: { shipmentId: string; currentStatus: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const maybeNext = NEXT[currentStatus];
  if (!maybeNext) return <span className="text-xs text-ink/40">Complete</span>;
  const nextStatus: string = maybeNext;

  async function apply() {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const now = new Date().toISOString();
    const update: Record<string, string | null> = {
      status: nextStatus,
      updated_at: now,
    };
    if (nextStatus === "delivered") update.delivered_at = now;
    const { error } = await supabase.from("shipments").update(update).eq("id", shipmentId);
    if (!error) {
      await supabase.from("shipment_events").insert({
        shipment_id: shipmentId,
        status: nextStatus,
        note: `Advanced from ${currentStatus} → ${nextStatus}`,
      });
    }
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push(`Marked as ${SHIPMENT_STATUS_LABELS[nextStatus] ?? nextStatus}`, "success");
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={apply} disabled={busy}>
      {busy ? "…" : `Mark ${SHIPMENT_STATUS_LABELS[nextStatus] ?? nextStatus}`}
    </Button>
  );
}
