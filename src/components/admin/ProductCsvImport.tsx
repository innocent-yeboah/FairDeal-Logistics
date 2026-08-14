"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ProductCsvImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const json = (await res.json()) as { imported?: number; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      toast.push(`Imported ${json.imported ?? 0} products`, "success");
      router.refresh();
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Import failed", "error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={onChange} />
      <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? "Importing…" : "Import CSV"}
      </Button>
    </>
  );
}
