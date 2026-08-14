import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";

export const metadata = policyMetadata(
  "Shipping & delivery",
  "Nationwide delivery across Ghana — standard, express, and same-day Accra.",
);

export default function ShippingPolicy() {
  return (
    <PolicyPage title="Shipping & delivery" description="How we get your order to you.">
      <p>Orders placed before 2pm on weekdays dispatch the same day from Accra.</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Standard: 3–5 business days, ₵30 (free over ₵500).</li>
        <li>Express: 1–2 business days, ₵60.</li>
        <li>Same-day Accra: ₵80, ordered before 12pm.</li>
      </ul>
      <p>We deliver to all 16 regions of Ghana. Tracking is sent by email and WhatsApp once your shipment is created.</p>
    </PolicyPage>
  );
}
