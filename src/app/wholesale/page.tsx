import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WHOLESALE_TIERS } from "@/lib/constants";
import { WholesaleApplyForm } from "@/components/wholesale/WholesaleApplyForm";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Bulk pricing for retailers, salons and boutiques across Ghana and West Africa.",
};

export default function WholesalePage({ searchParams }: { searchParams: { pending?: string } }) {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Wholesale"
        title="Bulk pricing for serious retailers"
        subtitle="Distributor-grade pricing on perfumes, cosmetics and body essentials. Fast dispatch from Accra and Kumasi."
      />

      {searchParams.pending ? (
        <div className="mb-8 rounded-xl2 border border-gold-200 bg-gold-50 p-4 text-sm text-ink">
          Your wholesale access is still pending. Submit an application below, or wait for our team to approve your account.
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr,420px] items-start">
        <div className="space-y-8">
          <div className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <p>
              Fair Deal Logistics supplies retailers across Ghana with authentic beauty products.
              Whether you run a kiosk or a chain of stores, restocking stays simple.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Wholesale pricing from 15% below retail on qualifying items.</li>
              <li>Minimum order quantity of 10 units to unlock wholesale rates.</li>
              <li>Priority dispatch and consolidated delivery across all 16 regions.</li>
              <li>30-day net payment terms for verified partners.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-4">Volume tiers</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {WHOLESALE_TIERS.map((t) => (
                <div key={t.minUnits} className="rounded-xl2 border border-line bg-white p-4">
                  <div className="text-xs uppercase tracking-wider text-gold-600">{t.label}</div>
                  <div className="mt-2 text-sm text-ink/80">{t.benefit}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/wholesale/dashboard">Wholesale dashboard</Button>
            <Button href="/account/login?redirect=/wholesale/dashboard" variant="outline">
              Already approved? Sign in
            </Button>
          </div>
        </div>

        <WholesaleApplyForm />
      </div>
    </Container>
  );
}
