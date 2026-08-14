"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

interface Props {
  inventoryId: string;
  variantId: string;
  warehouseId: string;
  quantity: number;
}

export function InventoryRow({ inventoryId, variantId, warehouseId, quantity }: Props) {
  const [delta, setDelta] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function apply() {
    if (delta === "" || delta === 0) return;
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const newQty = Math.max(0, quantity + Number(delta));
    const { error: e1 } = await supabase
      .from("inventory")
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq("id", inventoryId);
    if (!e1) {
      await supabase.from("stock_movements").insert({
        variant_id: variantId,
        warehouse_id: warehouseId,
        delta: Number(delta),
        reason: "adjustment",
        note: "Admin manual adjustment",
      });
    }
    setBusy(false);
    if (e1) {
      toast.push(e1.message, "error");
      return;
    }
    toast.push("Stock updated", "success");
    setDelta("");
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="number"
        value={delta}
        onChange={(e) => setDelta(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder="±"
        className="h-9 w-20 rounded-md border border-line bg-white px-2 text-sm text-right"
      />
      <Button size="sm" variant="outline" onClick={apply} disabled={busy || delta === "" || Number(delta) === 0}>
        {busy ? "…" : "Apply"}
      </Button>
    </div>
  );
}
