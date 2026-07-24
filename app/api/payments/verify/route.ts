import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createDownloadToken,
  verifyRazorpayPaymentSignature,
} from "@/lib/payments";

const bodySchema = z.object({
  product: z.enum(["ai-compliance", "ai-readiness"]),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
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

    const token = createDownloadToken({
      product: body.product,
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
    });

    const downloadPath =
      body.product === "ai-compliance"
        ? `/kit/ai-compliance/download?order_id=${encodeURIComponent(body.razorpay_order_id)}&payment_id=${encodeURIComponent(body.razorpay_payment_id)}&token=${encodeURIComponent(token)}`
        : `/audit/confirmed?order_id=${encodeURIComponent(body.razorpay_order_id)}&payment_id=${encodeURIComponent(body.razorpay_payment_id)}`;

    return NextResponse.json({
      ok: true,
      downloadPath,
      token,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
