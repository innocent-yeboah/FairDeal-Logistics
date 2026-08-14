import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

interface SearchParams {
  reference?: string;
  trxref?: string;
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const reference = searchParams.reference ?? searchParams.trxref ?? "";
  let ok = false;
  let orderNumber: string | null = null;
  let amount = 0;

  if (reference) {
    try {
      const data = await verifyPaystackTransaction(reference);
      if (data.status === "success") {
        ok = true;
        amount = data.amount / 100;
        // Update the order & find its number
        const admin = createSupabaseAdminClient();
        const { data: updated } = await admin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "paid",
            placed_at: new Date().toISOString(),
          })
          .eq("payment_reference", reference)
          .select("order_number")
          .maybeSingle();
        orderNumber = updated?.order_number ?? null;
      }
    } catch {
      ok = false;
    }
  }

  return (
    <Container className="py-16 text-center max-w-lg">
      {ok ? (
        <>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700 text-3xl">✓</div>
          <h1 className="mt-4 font-display text-3xl">Thank you!</h1>
          <p className="mt-2 text-ink/70">
            Your order {orderNumber ? <strong>#{orderNumber}</strong> : ""} has been received. We&rsquo;re
            preparing it now.
          </p>
          {amount > 0 ? (
            <p className="mt-1 text-sm text-ink/60">Amount paid: {formatMoney(amount)}</p>
          ) : null}
          <div className="mt-8 flex justify-center gap-3">
            <Button href="/account/orders">View my orders</Button>
            <Button href="/shop" variant="outline">Continue shopping</Button>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-500 text-3xl">!</div>
          <h1 className="mt-4 font-display text-3xl">Payment not confirmed</h1>
          <p className="mt-2 text-ink/70">
            We couldn&rsquo;t verify your payment. If your money was taken, our team will be in touch shortly.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button href="/cart">Back to cart</Button>
            <Link href="/" className="text-sm text-ink/60 self-center">Home</Link>
          </div>
        </>
      )}
    </Container>
  );
}
