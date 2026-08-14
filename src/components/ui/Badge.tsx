import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";

const tones: Record<Tone, string> = {
  neutral: "bg-cream text-ink/80 border-line",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-gold-50 text-gold-700 border-gold-100",
  danger: "bg-rose-50 text-rose-500 border-rose-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  gold: "bg-gold-100 text-gold-800 border-gold-200",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (["paid", "delivered", "success"].includes(s)) return "success";
  if (["pending", "created", "processing", "packed"].includes(s)) return "warning";
  if (["cancelled", "failed", "refunded"].includes(s)) return "danger";
  if (["shipped", "in_transit", "out_for_delivery", "picked_up"].includes(s)) return "info";
  return "neutral";
}
