import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";

export const metadata = policyMetadata(
  "FAQ",
  "Answers about authenticity, delivery, payments and wholesale at Fair Deal Logistics Gh.",
);

export default function FaqPage() {
  return (
    <PolicyPage title="FAQ" description="Short answers so you can shop with confidence.">
      <p>
        <strong>Are your products authentic?</strong><br />
        Yes. We source from brands and licensed distributors. If something is not right, we make it right.
      </p>
      <p>
        <strong>Where do you deliver?</strong><br />
        Across Ghana. Accra and Kumasi are fastest. Other regions typically arrive in 3–5 business days.
      </p>
      <p>
        <strong>How do I pay?</strong><br />
        Mobile Money, card, or bank transfer — all secured by Paystack. You see the total before you pay.
      </p>
      <p>
        <strong>Can I buy wholesale?</strong><br />
        Yes. Apply on the wholesale page. Approved partners unlock wholesale prices from 10 units.
      </p>
      <p>
        <strong>How do I get 10% off my first order?</strong><br />
        Join the newsletter and use code <strong>WELCOME10</strong> at checkout.
      </p>
    </PolicyPage>
  );
}
