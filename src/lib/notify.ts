import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

export type NotifyTemplate =
  | "order_confirmation"
  | "payment_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "abandoned_cart";

interface NotifyOrder {
  id: string;
  order_number: string;
  total: number;
  guest_email?: string | null;
  guest_phone?: string | null;
  tracking_number?: string | null;
}

interface NotifyParams {
  template: NotifyTemplate;
  email?: string | null;
  phone?: string | null;
  order?: NotifyOrder;
}

function emailCopy(template: NotifyTemplate, order?: NotifyOrder): { subject: string; html: string } {
  const number = order?.order_number ?? "";
  const total = order ? formatMoney(order.total) : "";
  const track = order?.tracking_number ?? "";
  switch (template) {
    case "order_confirmation":
      return {
        subject: `Order ${number} received — ${SITE.name}`,
        html: `<p>Thank you. We have received order <strong>${number}</strong> for ${total}. We'll confirm payment shortly.</p>`,
      };
    case "payment_confirmation":
      return {
        subject: `Payment received for ${number}`,
        html: `<p>Your payment of ${total} for order <strong>${number}</strong> is confirmed. We're preparing it now.</p>`,
      };
    case "order_shipped":
      return {
        subject: `${number} is on the way`,
        html: `<p>Your order <strong>${number}</strong> has shipped. Tracking: ${track || "will follow shortly"}.</p>`,
      };
    case "order_delivered":
      return {
        subject: `${number} delivered`,
        html: `<p>Your order <strong>${number}</strong> has been delivered. We hope you love it — a review would mean a lot.</p>`,
      };
    case "order_cancelled":
      return {
        subject: `${number} cancelled`,
        html: `<p>Order <strong>${number}</strong> has been cancelled. If you paid, a refund will follow.</p>`,
      };
    case "abandoned_cart":
      return {
        subject: "You left something behind",
        html: `<p>Your Fair Deal cart is waiting. Complete checkout to lock in your items: <a href="${SITE.url}/checkout">${SITE.url}/checkout</a></p>`,
      };
  }
}

async function logNotification(input: {
  channel: "email" | "whatsapp";
  template: NotifyTemplate;
  recipient: string;
  orderId?: string;
  status: "sent" | "queued" | "failed" | "skipped";
  payload?: Record<string, unknown>;
  error?: string;
}) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("notification_log").insert({
      channel: input.channel,
      template: input.template,
      recipient: input.recipient,
      order_id: input.orderId ?? null,
      status: input.status,
      payload: input.payload ?? null,
      error: input.error ?? null,
    });
  } catch {
    // Logging must never break checkout.
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? `Fair Deal <${SITE.supportEmail}>`;
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) return { ok: false, error: `Resend ${res.status}` };
  return { ok: true };
}

async function sendWhatsApp(phone: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, error: "WhatsApp not configured" };

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone.replace(/\D/g, ""),
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) return { ok: false, error: `WhatsApp ${res.status}` };
  return { ok: true };
}

/**
 * Send transactional email + WhatsApp for an order event.
 * Failures are logged; they never throw to the caller.
 */
export async function notifyCustomer(params: NotifyParams): Promise<void> {
  const copy = emailCopy(params.template, params.order);
  const waBody = copy.subject + (params.order ? ` · ${formatMoney(params.order.total)}` : "");

  if (params.email) {
    const result = await sendEmail(params.email, copy.subject, copy.html).catch((err: unknown) => ({
      ok: false,
      error: err instanceof Error ? err.message : "email failed",
    }));
    await logNotification({
      channel: "email",
      template: params.template,
      recipient: params.email,
      orderId: params.order?.id,
      status: result.ok ? "sent" : result.error?.includes("not configured") ? "skipped" : "failed",
      payload: { subject: copy.subject },
      error: result.ok ? undefined : result.error,
    });
  }

  if (params.phone) {
    const result = await sendWhatsApp(params.phone, waBody).catch((err: unknown) => ({
      ok: false,
      error: err instanceof Error ? err.message : "whatsapp failed",
    }));
    await logNotification({
      channel: "whatsapp",
      template: params.template,
      recipient: params.phone,
      orderId: params.order?.id,
      status: result.ok ? "sent" : result.error?.includes("not configured") ? "skipped" : "failed",
      error: result.ok ? undefined : result.error,
    });
  }
}
