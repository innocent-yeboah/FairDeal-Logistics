import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";

export const metadata = policyMetadata("Returns", "Unopened items can be returned within 7 days.");

export default function ReturnsPolicy() {
  return (
    <PolicyPage title="Returns policy" description="Simple, fair returns.">
      <p>Unopened, unused products may be returned within 7 days of delivery for a refund or exchange.</p>
      <p>Fragrance testers and opened cosmetics cannot be returned for hygiene reasons.</p>
      <p>Write to hello@fairdealgh.com with your order number and we will arrange collection or a drop-off in Accra or Kumasi.</p>
    </PolicyPage>
  );
}
