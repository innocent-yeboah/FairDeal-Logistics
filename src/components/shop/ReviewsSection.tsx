"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

interface Props {
  productId: string;
  reviews: Review[];
  ratingAvg: number;
  ratingCount: number;
}

export function ReviewsSection({ productId, reviews, ratingAvg, ratingCount }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setBusy(false);
      toast.push("Sign in to leave a review", "info");
      router.push("/account/login");
      return;
    }
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userRes.user.id,
      rating,
      title: String(fd.get("title") ?? "") || null,
      body: String(fd.get("body") ?? "") || null,
    });
    setBusy(false);
    if (error) {
      toast.push(error.message, "error");
      return;
    }
    toast.push("Thanks for your review!", "success");
    setShowForm(false);
    router.refresh();
  }

  return (
    <section className="mt-20" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 id="reviews-heading" className="font-display text-2xl">Customer reviews</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink/70">
            <Stars value={ratingAvg} />
            <span>
              {ratingAvg.toFixed(1)} · {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Write a review"}
        </Button>
      </div>

      {showForm ? (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink">Your rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className={`text-2xl ${n <= rating ? "text-gold-400" : "text-line"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Title">
                <Input name="title" placeholder="Sums it up in a few words" />
              </Field>
              <Field label="Review">
                <Textarea name="body" placeholder="What did you like or dislike?" />
              </Field>
              <Button type="submit" disabled={busy}>{busy ? "Posting…" : "Post review"}</Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-sm text-ink/60">No reviews yet — be the first to share your experience.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl2 border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="text-xs text-ink/50">{formatDate(r.created_at)}</span>
              </div>
              {r.title ? <div className="mt-2 font-medium text-ink">{r.title}</div> : null}
              {r.body ? <p className="mt-1 text-sm text-ink/75">{r.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`} className="text-gold-400 text-sm tracking-tight">
      {"★".repeat(Math.round(value))}
      <span className="text-line">{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}
