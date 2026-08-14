import "server-only";

const PAYSTACK_BASE = "https://api.paystack.co";

interface InitTransactionParams {
  email: string;
  amountKobo: number;                 // amount in the smallest currency unit
  reference: string;
  currency?: string;                  // e.g. "GHS"
  callbackUrl?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
    customer?: { email?: string; phone?: string };
  };
}

export async function initializePaystackTransaction(params: InitTransactionParams): Promise<PaystackInitResponse["data"]> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      currency: params.currency ?? "GHS",
      callback_url: params.callbackUrl,
      channels: params.channels,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    throw new Error(`Paystack init failed (${res.status})`);
  }
  const json = (await res.json()) as PaystackInitResponse;
  if (!json.status) throw new Error(json.message || "Paystack init failed");
  return json.data;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse["data"]> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Paystack verify failed (${res.status})`);
  const json = (await res.json()) as PaystackVerifyResponse;
  if (!json.status) throw new Error(json.message || "Paystack verify failed");
  return json.data;
}

/**
 * Verify a Paystack webhook signature (HMAC-SHA512 of the raw request body
 * using the secret key), returned in the `x-paystack-signature` header.
 */
export async function verifyPaystackSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature) return false;
  const crypto = await import("node:crypto");
  const hash = crypto.createHmac("sha512", key).update(rawBody).digest("hex");
  return hash === signature;
}
