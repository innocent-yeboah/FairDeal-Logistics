import { PolicyPage, policyMetadata } from "@/components/site/PolicyPage";
import { SITE } from "@/lib/constants";

export const metadata = policyMetadata(
  "Contact",
  "Reach Fair Deal Logistics Gh by email or phone. We are here to help with orders and wholesale.",
);

export default function ContactPage() {
  return (
    <PolicyPage title="Contact" description="We reply during business hours, Monday to Saturday.">
      <p>
        Email: <a className="text-brand-700 font-medium" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
      <p>
        Phone: <a className="text-brand-700 font-medium" href={`tel:${SITE.supportPhone}`}>{SITE.supportPhone}</a>
      </p>
      <p>Dispatch: Accra and Kumasi, with delivery to all 16 regions of Ghana.</p>
      <p>
        For wholesale partnerships, visit our{" "}
        <a className="text-brand-700 font-medium" href="/wholesale">wholesale page</a>{" "}
        and send an application.
      </p>
    </PolicyPage>
  );
}
