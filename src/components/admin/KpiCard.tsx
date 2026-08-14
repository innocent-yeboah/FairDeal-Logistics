import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: string;
  delta?: string;
  tone?: "brand" | "gold" | "rose" | "neutral";
  hint?: string;
}

const tones: Record<NonNullable<Props["tone"]>, string> = {
  brand: "from-brand-600 to-brand-700 text-white",
  gold: "from-gold-400 to-gold-500 text-ink",
  rose: "from-rose-200 to-rose-300 text-ink",
  neutral: "from-white to-cream text-ink border border-line",
};

export function KpiCard({ label, value, delta, tone = "neutral", hint }: Props) {
  return (
    <div className={cn("rounded-xl2 p-5 shadow-soft bg-gradient-to-br", tones[tone])}>
      <div className={cn("text-xs uppercase tracking-wider opacity-80")}>{label}</div>
      <div className="mt-1 font-display text-3xl">{value}</div>
      <div className="mt-1 text-xs opacity-75">{delta ?? hint ?? "\u00A0"}</div>
    </div>
  );
}
