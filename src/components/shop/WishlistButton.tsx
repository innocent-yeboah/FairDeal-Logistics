"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

export function WishlistButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userRes.user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (active) setSaved(Boolean(data));
    })();
    return () => {
      active = false;
    };
  }, [productId]);

  async function toggle() {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setBusy(false);
      toast.push("Sign in to save items to your wishlist", "info");
      router.push(`/account/login?redirect=/product`);
      return;
    }
    if (saved) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userRes.user.id)
        .eq("product_id", productId);
      if (!error) {
        setSaved(false);
        toast.push("Removed from wishlist", "info");
      }
    } else {
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: userRes.user.id, product_id: productId });
      if (!error) {
        setSaved(true);
        toast.push("Saved to wishlist", "success");
      }
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full border transition",
        saved
          ? "border-terracotta-400 bg-terracotta-50 text-terracotta-500"
          : "border-line bg-white text-ink/50 hover:border-terracotta-400 hover:text-terracotta-500",
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 21s-7.5-4.7-9.5-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
