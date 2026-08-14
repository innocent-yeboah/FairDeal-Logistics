import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";

export const metadata = policyMetadata("Terms", "The terms that govern shopping with Fair Deal Logistics Gh.");

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of sale" description="Clear terms for retail and wholesale orders.">
      <p>By placing an order you agree that prices are in Ghana cedis, stock is subject to availability, and title passes on delivery.</p>
      <p>Wholesale partners must meet the published minimum order quantity. Payment terms (including 30-day net) apply only to approved accounts.</p>
      <p>We may refuse or cancel orders that appear fraudulent or that we cannot fulfil.</p>
    </PolicyPage>
  );
}
