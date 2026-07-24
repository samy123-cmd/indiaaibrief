import Razorpay from "razorpay";
import crypto from "crypto";
import type { RazorpayOrderResponse } from "@/types";
import { PRODUCTS } from "@/lib/products";

export { PRODUCTS };

const DOWNLOAD_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

  if (
    process.env.VERCEL_ENV === "production" &&
    keyId.startsWith("rzp_test_") &&
    process.env.ALLOW_RAZORPAY_TEST_KEYS !== "1"
  ) {
    console.warn(
      "[razorpay] Production is using test keys (rzp_test_*). Set live keys or ALLOW_RAZORPAY_TEST_KEYS=1 to silence.",
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

export interface RazorpayOrderRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: Record<string, string>;
}

/** Fetch order from Razorpay — source of truth for product + amount after pay. */
export async function fetchRazorpayOrder(
  orderId: string,
): Promise<RazorpayOrderRecord> {
  const client = getRazorpayClient();
  const order = await client.orders.fetch(orderId);
  const notesRaw = (order.notes ?? {}) as Record<string, unknown>;
  const notes: Record<string, string> = {};
  for (const [key, value] of Object.entries(notesRaw)) {
    if (typeof value === "string") notes[key] = value;
  }

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: String(order.currency ?? "INR"),
    status: String(order.status ?? ""),
    notes,
  };
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  let secret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
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

function downloadSecret(mode: "create" | "verify"): string {
  const dedicated = process.env.DOWNLOAD_TOKEN_SECRET?.trim();
  if (dedicated) return dedicated;

  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (isProd) {
    if (mode === "create") {
      throw new Error(
        "DOWNLOAD_TOKEN_SECRET must be set in production (long random string).",
      );
    }
    throw new Error("DOWNLOAD_TOKEN_SECRET missing");
  }

  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const misplacedSecret =
    keyId && !keyId.startsWith("rzp_") ? keyId : undefined;
  return (
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    misplacedSecret ||
    "indiaaibrief-dev-download-secret"
  );
}

function signPayload(payload: string, mode: "create" | "verify"): string {
  return crypto
    .createHmac("sha256", downloadSecret(mode))
    .update(payload)
    .digest("hex");
}

/**
 * Signed delivery token — binds payment to product, expires in 7 days.
 * Format: base64url(product|orderId|paymentId|expMs|hmac)
 */
export function createDownloadToken(input: {
  product: string;
  orderId: string;
  paymentId: string;
  expiresAtMs?: number;
}): string {
  const exp = input.expiresAtMs ?? Date.now() + DOWNLOAD_TOKEN_TTL_MS;
  const payload = `${input.product}|${input.orderId}|${input.paymentId}|${exp}`;
  const sig = signPayload(payload, "create");
  return Buffer.from(`${payload}|${sig}`, "utf8").toString("base64url");
}

export function verifyDownloadToken(input: {
  product: string;
  orderId: string;
  paymentId: string;
  token: string;
}): boolean {
  if (!input.token || !input.orderId || !input.paymentId) return false;

  try {
    const decoded = Buffer.from(input.token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length === 5) {
      const [product, orderId, paymentId, expStr, sig] = parts;
      if (
        !product ||
        !orderId ||
        !paymentId ||
        !expStr ||
        !sig ||
        product !== input.product ||
        orderId !== input.orderId ||
        paymentId !== input.paymentId
      ) {
        return false;
      }
      const exp = Number(expStr);
      if (!Number.isFinite(exp) || Date.now() > exp) return false;
      const expected = signPayload(
        `${product}|${orderId}|${paymentId}|${exp}`,
        "verify",
      );
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    }
  } catch {
    /* fall through */
  }

  try {
    const payload = `${input.product}|${input.orderId}|${input.paymentId}`;
    const expected = signPayload(payload, "verify");
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(input.token),
    );
  } catch {
    return false;
  }
}

export function catalogForProduct(
  product: "ai-compliance" | "ai-readiness",
) {
  return product === "ai-compliance"
    ? PRODUCTS.complianceKit
    : PRODUCTS.readinessAudit;
}
