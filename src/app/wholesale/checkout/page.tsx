"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { GHANA_REGIONS, WHOLESALE_MOQ, shippingCost } from "@/lib/constants";

export default function WholesaleCheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const units = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const shipping = shippingCost("standard", subtotal);
  const total = subtotal + shipping;
  const moqMet = units >= WHOLESALE_MOQ;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!moqMet) {
      toast.push(`Minimum order is ${WHOLESALE_MOQ} units.`, "error");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: fd.get("contact"),
            email: fd.get("email"),
            phone: fd.get("phone"),
            notes: fd.get("notes") ?? null,
          },
          shipping_address: {
            recipient: fd.get("contact"),
            phone: fd.get("phone"),
            line1: fd.get("line1"),
            line2: fd.get("line2") ?? null,
            city: fd.get("city"),
            region: fd.get("region"),
            country: "Ghana",
          },
          shipping_method: "standard",
          payment_method: "bank_transfer",
          order_type: "wholesale",
          business_name: fd.get("business"),
          tax_id: fd.get("taxId"),
          payment_terms: fd.get("terms"),
          items: items.map((i) => ({
            variant_id: i.variantId,
            product_id: i.productId,
            name: i.name,
            variant_name: i.variantName,
            sku: i.sku,
            unit_price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Checkout failed");
      clear();
      window.location.href = json.url;
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Checkout failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl">Wholesale checkout</h1>
      <p className="mt-2 text-sm text-ink/60">B2B orders · MOQ {WHOLESALE_MOQ} units · optional 30-day net terms.</p>

      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-ink/70">Your cart is empty.</p>
          <Button href="/wholesale/catalog" className="mt-4">Browse catalog</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr,360px] items-start">
          <Card>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name" required className="sm:col-span-2">
                <Input name="business" required />
              </Field>
              <Field label="Tax ID / TIN">
                <Input name="taxId" />
              </Field>
              <Field label="Payment terms">
                <select name="terms" className="w-full rounded-lg border border-line bg-white px-3.5 h-11 text-sm" defaultValue="pay_now">
                  <option value="pay_now">Pay now</option>
                  <option value="net_30">30-day net (verified partners)</option>
                </select>
              </Field>
              <Field label="Contact name" required>
                <Input name="contact" required />
              </Field>
              <Field label="Email" required>
                <Input name="email" type="email" required />
              </Field>
              <Field label="Phone" required>
                <Input name="phone" required />
              </Field>
              <Field label="Address" required className="sm:col-span-2">
                <Input name="line1" required />
              </Field>
              <Field label="City" required>
                <Input name="city" required />
              </Field>
              <Field label="Region" required>
                <select name="region" required defaultValue="" className="w-full rounded-lg border border-line bg-white px-3.5 h-11 text-sm">
                  <option value="" disabled>Choose region</option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea name="notes" />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg mb-3">Summary</h2>
              <p className="text-sm text-ink/70">{units} units · {items.length} SKUs</p>
              {!moqMet ? (
                <p className="mt-2 text-sm text-rose-500">Add {WHOLESALE_MOQ - units} more units to meet MOQ.</p>
              ) : null}
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Shipping</dt><dd>{formatMoney(shipping)}</dd></div>
                <div className="flex justify-between border-t border-line pt-3 font-semibold">
                  <dt>Total</dt><dd>{formatMoney(total)}</dd>
                </div>
              </dl>
              <Button type="submit" className="mt-5 w-full" disabled={busy || !moqMet}>
                {busy ? "Redirecting…" : "Place wholesale order"}
              </Button>
            </CardBody>
          </Card>
        </form>
      )}
    </Container>
  );
}
