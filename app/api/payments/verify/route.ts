import { NextResponse } from "next/server";
import { z } from "zod";
import { fulfillRazorpayPayment } from "@/lib/fulfillment";
import {
  catalogForProduct,
  createDownloadToken,
  fetchRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, isTrustedOrigin } from "@/lib/request-guards";

const bodySchema = z.object({
  /** Hint only — product is taken from Razorpay order notes. */
  product: z.enum(["ai-compliance", "ai-readiness"]).optional(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = clientIp(request);
    const limited = rateLimit({
      key: `pay-verify:${ip}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many verification attempts." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const json = (await request.json()) as unknown;
    const body = bodySchema.parse(json);

    const valid = verifyRazorpayPaymentSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const order = await fetchRazorpayOrder(body.razorpay_order_id);
    const productNote = order.notes.product;
    if (productNote !== "ai-compliance" && productNote !== "ai-readiness") {
      return NextResponse.json(
        { error: "Order is missing a valid product." },
        { status: 400 },
      );
    }

    const catalog = catalogForProduct(productNote);
    if (Number(order.amount) !== catalog.amountPaise) {
      console.error("[payments:verify] amount mismatch", {
        orderAmount: order.amount,
        expected: catalog.amountPaise,
        orderId: order.id,
      });
      return NextResponse.json(
        { error: "Payment amount does not match product." },
        { status: 400 },
      );
    }

    if (body.product && body.product !== productNote) {
      return NextResponse.json(
        { error: "Product mismatch for this order." },
        { status: 400 },
      );
    }

    const token = createDownloadToken({
      product: productNote,
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
    });

    // Fulfill immediately (email) — webhook is a backup if checkout never hits verify
    await fulfillRazorpayPayment({
      id: body.razorpay_payment_id,
      order_id: body.razorpay_order_id,
      email: order.notes.email,
      amount: order.amount,
      notes: order.notes,
    });

    const downloadPath =
      productNote === "ai-compliance"
        ? `/kit/ai-compliance/download?order_id=${encodeURIComponent(body.razorpay_order_id)}&payment_id=${encodeURIComponent(body.razorpay_payment_id)}&token=${encodeURIComponent(token)}`
        : `/audit/confirmed?order_id=${encodeURIComponent(body.razorpay_order_id)}&payment_id=${encodeURIComponent(body.razorpay_payment_id)}&token=${encodeURIComponent(token)}`;

    return NextResponse.json({
      ok: true,
      downloadPath,
      token,
      product: productNote,
    });
  } catch (error) {
    console.error("[payments:verify]", error);
    const message =
      error instanceof Error && /DOWNLOAD_TOKEN|not configured/i.test(error.message)
        ? error.message
        : "Unable to verify payment. Email hello@indiaaibrief.com with your payment ID.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
