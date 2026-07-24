import Razorpay from "razorpay";
import crypto from "crypto";
import type { RazorpayOrderResponse } from "@/types";
import { PRODUCTS } from "@/lib/products";

export { PRODUCTS };

function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({ key_id, key_secret });
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
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === params.signature;
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

function downloadSecret(): string {
  return (
    process.env.DOWNLOAD_TOKEN_SECRET ??
    process.env.RAZORPAY_KEY_SECRET ??
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
