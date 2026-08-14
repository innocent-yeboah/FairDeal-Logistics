import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";

export const metadata = policyMetadata("Privacy", "How we collect and protect your information.");

export default function PrivacyPolicy() {
  return (
    <PolicyPage title="Privacy" description="We treat your information with care.">
      <p>We collect the details you share at checkout — name, email, phone and delivery address — so we can fulfil your order.</p>
      <p>Payments are processed by Paystack. We do not store card numbers.</p>
      <p>We may send order updates by email and WhatsApp. You can unsubscribe from marketing at any time.</p>
    </PolicyPage>
  );
}
