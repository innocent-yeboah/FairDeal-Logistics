import * as React from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-display text-2xl sm:text-3xl text-ink">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm text-ink/70">{subtitle}</p> : null}
    </div>
  );
}
