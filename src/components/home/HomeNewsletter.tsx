import { Container } from "@/components/ui/Container";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";

/**
 * Newsletter — Make it Satisfying: immediate 10% welcome reward.
 */
export function HomeNewsletter() {
  return (
    <section className="pb-20">
      <Container>
        <div className="rounded-xl2 fd-brand-wash text-white p-10 lg:p-14 grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl leading-tight">
              Join our community and get 10% off your first order.
            </h2>
            <p className="mt-4 text-white/80 max-w-xl">
              Be the first to know about new arrivals, exclusive deals, and special offers.
            </p>
          </div>
          <div className="lg:justify-self-end w-full lg:max-w-md">
            <NewsletterSignup />
          </div>
        </div>
      </Container>
    </section>
  );
}
