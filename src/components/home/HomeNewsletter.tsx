import { Container } from "@/components/ui/Container";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";

/**
 * Newsletter — Make it Satisfying: immediate 10% welcome reward.
 */
export function HomeNewsletter() {
  return (
    <section className="pb-10 sm:pb-16">
      <Container>
        <div className="rounded-xl2 fd-brand-wash text-white p-5 sm:p-8 lg:p-14 grid gap-5 sm:gap-8 lg:grid-cols-2 items-center overflow-hidden">
          <div>
            <h2 className="font-display text-xl sm:text-3xl lg:text-4xl leading-snug sm:leading-tight">
              Join our community and get 10% off your first order.
            </h2>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base text-white/80 max-w-xl">
              Be the first to know about new arrivals, exclusive deals, and special offers.
            </p>
          </div>
          <div className="lg:justify-self-end w-full min-w-0 lg:max-w-md">
            <NewsletterSignup />
          </div>
        </div>
      </Container>
    </section>
  );
}
