import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-600">404</p>
      <h1 className="mt-3 font-display text-4xl">We couldn&rsquo;t find that page.</h1>
      <p className="mt-3 max-w-md mx-auto text-ink/70">
        The link may be broken or the page may have moved. Try heading back to the shop.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/">Home</Button>
        <Button href="/shop" variant="outline">Browse the shop</Button>
      </div>
      <p className="mt-6 text-xs text-ink/50">
        Need help? <Link href="/contact" className="text-brand-700">Contact us</Link>
      </p>
    </Container>
  );
}
