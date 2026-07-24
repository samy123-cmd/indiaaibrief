import Razorpay from "razorpay";
import crypto from "crypto";
import type { RazorpayOrderResponse } from "@/types";
import { PRODUCTS } from "@/lib/products";

export { PRODUCTS };

/**
 * Resolve Razorpay credentials.
 * Tolerates a common mistake: pasting the Key Secret into RAZORPAY_KEY_ID
 * (secrets are not rzp_* prefixed; Key IDs always are).
 */
export function getRazorpayCredentials(): { keyId: string; keySecret: string } {
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || "";
  let keyId = (process.env.RAZORPAY_KEY_ID ?? publicKey).trim();
  let keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

  // Secret pasted into KEY_ID slot, secret env empty
  if (keyId && !keyId.startsWith("rzp_") && !keySecret) {
    keySecret = keyId;
    keyId = publicKey;
  }

  // Prefer public Key ID for Checkout when server KEY_ID is not a Key ID
  if (keyId && !keyId.startsWith("rzp_") && publicKey.startsWith("rzp_")) {
    keyId = publicKey;
  }

  if (!keyId.startsWith("rzp_") || !keySecret) {
    throw new Error(
      "Razorpay credentials are not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID (rzp_test_… / rzp_live_…) and RAZORPAY_KEY_SECRET from the Razorpay Dashboard → API Keys.",
    );
  }

  return { keyId, keySecret };
}

function getRazorpayClient(): Razorpay {
  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export interface CreateOrderInput {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
  currency?: "INR";
}

export async function createRazorpayOrder(
  input: CreateOrderInput,
): Promise<RazorpayOrderResponse> {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: input.amountPaise,
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt ?? input.receipt,
  };
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  let secret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
  // Same mispaste recovery as getRazorpayCredentials
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  if (!secret && keyId && !keyId.startsWith("rzp_")) {
    secret = keyId;
  }
  if (!secret) return false;

  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(params.signature),
    );
  } catch {
    return false;
  }
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

function downloadSecret(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const misplacedSecret =
    keyId && !keyId.startsWith("rzp_") ? keyId : undefined;
  return (
    process.env.DOWNLOAD_TOKEN_SECRET ??
    process.env.RAZORPAY_KEY_SECRET ??
    misplacedSecret ??
    "indiaaibrief-dev-download-secret"
  );
}

/** Signed delivery token — binds payment to product for the download page. */
export function createDownloadToken(input: {
  product: string;
  orderId: string;
  paymentId: string;
}): string {
  const payload = `${input.product}|${input.orderId}|${input.paymentId}`;
  return crypto
    .createHmac("sha256", downloadSecret())
    .update(payload)
    .digest("hex");
}

export function verifyDownloadToken(input: {
  product: string;
  orderId: string;
  paymentId: string;
  token: string;
}): boolean {
  if (!input.token || !input.orderId || !input.paymentId) return false;
  const expected = createDownloadToken({
    product: input.product,
    orderId: input.orderId,
    paymentId: input.paymentId,
  });
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(input.token),
    );
  } catch {
    return false;
  }
}
