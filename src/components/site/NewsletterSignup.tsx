"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Subscription failed");
      setDone(true);
      toast.push("Welcome aboard — check your inbox!", "success");
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="text-white/90 text-sm">
        You&rsquo;re in! Your 10% welcome code: <strong className="text-gold-300">WELCOME10</strong>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address for newsletter"
        className="h-12 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-gold-400 focus:outline-none"
      />
      <Button type="submit" variant="secondary" size="lg" disabled={busy}>
        {busy ? "…" : "Subscribe"}
      </Button>
    </form>
  );
}
