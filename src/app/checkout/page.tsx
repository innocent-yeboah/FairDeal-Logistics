"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import {
  GHANA_REGIONS,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  shippingCost,
} from "@/lib/constants";
import { cn } from "@/lib/cn";

const STEPS = ["Contact", "Address", "Delivery", "Payment", "Review"] as const;

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const couponCode = useCart((s) => s.couponCode);
  const clear = useCart((s) => s.clear);
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]!.id);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]!.id);
  const [discount, setDiscount] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    notes: "",
  });

  const shipping = useMemo(() => shippingCost(shippingMethod, subtotal), [shippingMethod, subtotal]);
  const total = Math.max(0, subtotal - discount) + shipping;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): boolean {
    if (step === 0 && (!form.fullName || !form.email || !form.phone)) {
      toast.push("Please fill in your contact details.", "error");
      return false;
    }
    if (step === 1 && (!form.line1 || !form.city || !form.region)) {
      toast.push("Please complete your shipping address.", "error");
      return false;
    }
    return true;
  }

  async function refreshDiscount() {
    if (!couponCode) {
      setDiscount(0);
      return;
    }
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const json = (await res.json()) as { discount?: number };
      setDiscount(res.ok ? json.discount ?? 0 : 0);
    } catch {
      setDiscount(0);
    }
  }

  async function onPlaceOrder() {
    if (items.length === 0) {
      toast.push("Your cart is empty", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            notes: form.notes || null,
            createAccount,
          },
          shipping_address: {
            recipient: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2 || null,
            city: form.city,
            region: form.region,
            country: "Ghana",
          },
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          coupon_code: couponCode,
          order_type: "retail",
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
      toast.push(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-display text-3xl">Checkout</h1>
        <p className="mt-2 text-ink/60">Your cart is empty.</p>
        <Button href="/shop" className="mt-6">Go to shop</Button>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-ink">Checkout</h1>
      <ol className="mt-6 flex flex-wrap gap-2 text-xs">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "rounded-full border px-3 py-1.5",
              i === step && "border-brand-600 bg-brand-600 text-white",
              i < step && "border-gold-400 bg-gold-50 text-ink",
              i > step && "border-line bg-white text-ink/50",
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,380px] items-start">
        <div className="space-y-6">
          {step === 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-display text-lg mb-4">Customer information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required className="sm:col-span-2">
                    <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required autoComplete="name" />
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required autoComplete="email" />
                  </Field>
                  <Field label="Phone" required>
                    <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required autoComplete="tel" placeholder="+233 24 000 0000" />
                  </Field>
                </div>
                <p className="mt-4 text-xs text-ink/60">
                  Guest checkout is available. You can create an account after placing this order.
                </p>
              </CardBody>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card>
              <CardBody>
                <h2 className="font-display text-lg mb-4">Shipping address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Address line 1" required className="sm:col-span-2">
                    <Input value={form.line1} onChange={(e) => set("line1", e.target.value)} required autoComplete="address-line1" />
                  </Field>
                  <Field label="Address line 2" className="sm:col-span-2">
                    <Input value={form.line2} onChange={(e) => set("line2", e.target.value)} autoComplete="address-line2" placeholder="Landmark (optional)" />
                  </Field>
                  <Field label="City / town" required>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} required autoComplete="address-level2" />
                  </Field>
                  <Field label="Region" required>
                    <select
                      required
                      value={form.region}
                      onChange={(e) => set("region", e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3.5 h-11 text-sm"
                    >
                      <option value="">Choose region</option>
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Country">
                    <Input defaultValue="Ghana" readOnly />
                  </Field>
                  <Field label="Delivery instructions" className="sm:col-span-2">
                    <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Gate colour, landmark, preferred time…" />
                  </Field>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardBody>
                <h2 className="font-display text-lg mb-4">Shipping method</h2>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((m) => {
                    const cost = shippingCost(m.id, subtotal);
                    return (
                      <label
                        key={m.id}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-4 cursor-pointer",
                          shippingMethod === m.id ? "border-brand-600 bg-brand-50" : "border-line bg-white",
                        )}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === m.id}
                          onChange={() => setShippingMethod(m.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{m.label}</div>
                          <div className="text-xs text-ink/60">{m.eta}{m.note ? ` · ${m.note}` : ""}</div>
                        </div>
                        <div className="font-semibold text-sm">{cost === 0 ? "Free" : formatMoney(cost)}</div>
                      </label>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {step === 3 ? (
            <Card>
              <CardBody>
                <h2 className="font-display text-lg mb-4">Payment</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 cursor-pointer",
                        paymentMethod === m.id ? "border-brand-600 bg-brand-50" : "border-line bg-white",
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-ink/60">{m.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="mt-4 text-xs text-ink/60">
                  You will complete payment securely on Paystack (card, Mobile Money, or bank).
                </p>
              </CardBody>
            </Card>
          ) : null}

          {step === 4 ? (
            <Card>
              <CardBody>
                <h2 className="font-display text-lg mb-4">Review your order</h2>
                <dl className="space-y-2 text-sm">
                  <div><dt className="text-ink/50">Contact</dt><dd>{form.fullName} · {form.email} · {form.phone}</dd></div>
                  <div><dt className="text-ink/50">Ship to</dt><dd>{form.line1}, {form.city}, {form.region}</dd></div>
                  <div><dt className="text-ink/50">Delivery</dt><dd>{SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.label}</dd></div>
                  <div><dt className="text-ink/50">Payment</dt><dd>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</dd></div>
                </dl>
                <label className="mt-5 flex items-start gap-2 text-sm text-ink/80">
                  <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="mt-1" />
                  Create an account after this order so I can track deliveries.
                </label>
              </CardBody>
            </Card>
          ) : null}

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
            ) : (
              <Link href="/cart" className="text-sm text-ink/60">← Cart</Link>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  if (!validateStep()) return;
                  if (step === 0) void refreshDiscount();
                  setStep((s) => s + 1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={onPlaceOrder} disabled={submitting}>
                {submitting ? "Redirecting…" : "Place order"}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardBody>
            <h2 className="font-display text-lg mb-3">Order summary</h2>
            <ul className="divide-y divide-line text-sm">
              {items.map((i) => (
                <li key={i.variantId} className="py-2 flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-ink">{i.name}</div>
                    <div className="text-xs text-ink/60">{i.variantName} · Qty {i.quantity}</div>
                  </div>
                  <div className="font-medium whitespace-nowrap">{formatMoney(i.price * i.quantity)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink/70">Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
              {discount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount {couponCode ? `(${couponCode})` : ""}</dt>
                  <dd>-{formatMoney(discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between"><dt className="text-ink/70">Shipping</dt><dd>{shipping === 0 ? "Free" : formatMoney(shipping)}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold text-brand-700">{formatMoney(total)}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
