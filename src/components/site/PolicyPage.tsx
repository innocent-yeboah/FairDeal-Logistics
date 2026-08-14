import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";

export function PolicyPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-16 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.2em] text-gold-600">{SITE.name}</p>
      <h1 className="mt-2 font-display text-4xl">{title}</h1>
      <p className="mt-3 text-ink/70">{description}</p>
      <div className="mt-8 space-y-4 text-sm text-ink/80 leading-relaxed">{children}</div>
    </Container>
  );
}

export function policyMetadata(title: string, description: string): Metadata {
  return { title, description };
}
