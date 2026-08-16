"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductImage } from "@/components/ui/ProductImage";
import { useToast } from "@/components/ui/Toast";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const toast = useToast();

  const [codeInput, setCodeInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);

  const shipping = subtotal > 0 && subtotal < 500 ? 30 : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function applyCoupon() {
    if (!codeInput.trim()) return;
    setApplying(true);
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.trim().toUpperCase(), subtotal }),
      });
      const json = (await res.json()) as { code?: string; discount?: number; error?: string };
      if (!res.ok || !json.code) throw new Error(json.error ?? "Invalid code");
      setCoupon(json.code);
      setDiscount(json.discount ?? 0);
      toast.push(`Code ${json.code} applied`, "success");
    } catch (err) {
      setCoupon(null);
      setDiscount(0);
      toast.push(err instanceof Error ? err.message : "Invalid code", "error");
    } finally {
      setApplying(false);
    }
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-ink">Your cart</h1>

      {!hydrated ? (
        <div className="mt-8 h-64 rounded-xl2 border border-dashed border-line" />
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-xl2 border border-dashed border-line bg-white p-12 text-center">
          <p className="font-display text-xl">Your cart is empty.</p>
          <p className="mt-1 text-sm text-ink/60">Start with a bestseller — Golden Oud is loved by many.</p>
          <Button href="/shop" className="mt-5">Continue shopping</Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,360px] items-start">
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.variantId}>
                <CardBody className="flex gap-4 items-center">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-cream border border-line flex-shrink-0">
                    <ProductImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="font-medium text-ink hover:text-brand-700 line-clamp-1">
                      {item.name}
                    </Link>
                    <div className="text-xs text-ink/60">{item.variantName}</div>
                    <div className="mt-1 text-sm font-semibold text-brand-700">
                      {formatMoney(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-line bg-white h-9">
                      <button
                        aria-label="Decrease"
                        className="w-9 h-9 text-lg text-ink/70"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label="Increase"
                        className="w-9 h-9 text-lg text-ink/70"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right text-sm font-medium">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => remove(item.variantId)}
                      className="text-ink/50 hover:text-rose-500 text-xs"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-2 text-sm">
              <button onClick={clear} className="text-ink/60 hover:text-rose-500">
                Clear cart
              </button>
              <Link href="/shop" className="text-brand-700 font-medium">
                Continue shopping →
              </Link>
            </div>
          </div>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg mb-4">Order summary</h2>

              <div className="mb-4 flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Discount code"
                  aria-label="Discount code"
                  className="h-10 flex-1 rounded-lg border border-line bg-white px-3 text-sm uppercase placeholder:normal-case"
                />
                <Button variant="outline" size="sm" className="h-10" onClick={applyCoupon} disabled={applying}>
                  {applying ? "…" : "Apply"}
                </Button>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink/70">Subtotal</dt>
                  <dd className="font-medium">{formatMoney(subtotal)}</dd>
                </div>
                {discount > 0 && couponCode ? (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount ({couponCode})</dt>
                    <dd className="font-medium">-{formatMoney(discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-ink/70">Shipping</dt>
                  <dd className="font-medium">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold text-brand-700">{formatMoney(total)}</dd>
                </div>
              </dl>
              <Button href="/checkout" className="mt-5 w-full">Proceed to checkout</Button>
              <p className="mt-3 text-xs text-ink/60 text-center">
                Secure payment · Card · Mobile Money
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </Container>
  );
}
