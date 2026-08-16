import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";
import { SITE } from "@/lib/constants";

export const metadata = policyMetadata(
  "About us",
  "Who we are and how Fair Deal Logistics Gh serves families and retailers across Ghana.",
);

export default function AboutPage() {
  return (
    <PolicyPage
      title="About us"
      description="We bring authentic beauty products to homes and shops across Ghana."
    >
      <p>
        {SITE.name} is a retail and wholesale partner for perfumes, body sprays, cosmetics
        and body essentials. We stock genuine products and dispatch from Accra to every region.
      </p>
      <p>
        Families shop with us for everyday freshness. Retailers, salons and boutiques rely on
        us for dependable wholesale stock and clear pricing.
      </p>
      <p>
        Our promise is simple: authentic products, trusted quality, nationwide delivery.
      </p>
    </PolicyPage>
  );
}
