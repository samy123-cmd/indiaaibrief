import { createDownloadToken } from "@/lib/payments";
import { absoluteUrl } from "@/lib/utils";

const INBOX = process.env.CONTACT_INBOX ?? "hello@indiaaibrief.com";

/** Deduplicate fulfill emails within a single serverless isolate. */
const fulfilledPaymentIds = new Set<string>();

interface PaymentEntity {
  id?: string;
  order_id?: string;
  email?: string;
  notes?: Record<string, string | undefined>;
  amount?: number;
}

/**
 * Fulfill a verified Razorpay payment.
 * Emails customer + ops when Resend is configured; always structured-logs.
 */
export async function fulfillRazorpayPayment(
  payment: PaymentEntity,
): Promise<{ fulfilled: boolean; product: string | null; skipped?: boolean }> {
  const notes = payment.notes ?? {};
  const product = notes.product ?? null;
  const email = payment.email ?? notes.email ?? null;
  const orderId = payment.order_id ?? "";
  const paymentId = payment.id ?? "";

  if (paymentId && fulfilledPaymentIds.has(paymentId)) {
    return { fulfilled: true, product, skipped: true };
  }
  if (paymentId) fulfilledPaymentIds.add(paymentId);

  let downloadUrl: string | null = null;
  let confirmedUrl: string | null = null;

  if (product === "ai-compliance" && orderId && paymentId) {
    const token = createDownloadToken({
      product,
      orderId,
      paymentId,
    });
    downloadUrl = absoluteUrl(
      `/kit/ai-compliance/download?order_id=${encodeURIComponent(orderId)}&payment_id=${encodeURIComponent(paymentId)}&token=${encodeURIComponent(token)}`,
    );
  }

  if (product === "ai-readiness" && orderId && paymentId) {
    const token = createDownloadToken({
      product,
      orderId,
      paymentId,
    });
    const params = new URLSearchParams({
      order_id: orderId,
      payment_id: paymentId,
      token,
    });
    confirmedUrl = absoluteUrl(`/audit/confirmed?${params.toString()}`);
  }

  console.info("[fulfillment]", {
    product,
    email,
    orderId,
    paymentId,
    downloadUrl,
    confirmedUrl,
  });

  if (process.env.RESEND_API_KEY && email) {
    await sendFulfillmentEmail({
      to: email,
      product,
      downloadUrl,
      confirmedUrl,
      paymentId,
      company: notes.company,
    });
    await sendOpsPing({
      product,
      email,
      paymentId,
      orderId,
      company: notes.company,
      website: notes.website,
    });
  }

  return { fulfilled: true, product };
}

async function sendFulfillmentEmail(input: {
  to: string;
  product: string | null;
  downloadUrl: string | null;
  confirmedUrl: string | null;
  paymentId: string;
  company?: string;
}): Promise<void> {
  const from =
    process.env.RESEND_FROM_EMAIL ?? "IndiaAIBrief <onboarding@resend.dev>";

  const isKit = input.product === "ai-compliance";
  const subject = isKit
    ? "Your AI Compliance Starter Kit is ready"
    : "AI Readiness Audit — booking confirmed";

  const body = isKit
    ? [
        "Thanks for purchasing the AI Compliance Starter Kit.",
        "",
        input.downloadUrl
          ? `Download your files: ${input.downloadUrl}`
          : "Open your download page from the checkout success screen.",
        "",
        "This link expires in 7 days. Reply if you need a fresh link.",
        "",
        `Payment ID: ${input.paymentId}`,
        "",
        "Questions? Reply to this email or write hello@indiaaibrief.com.",
      ].join("\n")
    : [
        "Thanks for booking the AI Readiness Audit.",
        "",
        input.confirmedUrl
          ? `Confirmation: ${input.confirmedUrl}`
          : "We will email kickoff details within one business day.",
        "",
        `Payment ID: ${input.paymentId}`,
        input.company ? `Company: ${input.company}` : "",
        "",
        "Reply with product context and any RFP deadline.",
      ]
        .filter(Boolean)
        .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[fulfillment:email]", response.status, detail);
  }
}

async function sendOpsPing(input: {
  product: string | null;
  email: string;
  paymentId: string;
  orderId: string;
  company?: string;
  website?: string;
}): Promise<void> {
  const from =
    process.env.RESEND_FROM_EMAIL ?? "IndiaAIBrief <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [INBOX],
      subject: `[Payment] ${input.product ?? "unknown"} · ${input.paymentId}`,
      text: JSON.stringify(input, null, 2),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[fulfillment:ops]", response.status, detail);
  }
}
