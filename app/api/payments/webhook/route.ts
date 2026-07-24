import { NextResponse } from "next/server";
import { fulfillRazorpayPayment } from "@/lib/fulfillment";
import { verifyRazorpayWebhookSignature } from "@/lib/payments";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          email?: string;
          amount?: number;
          notes?: Record<string, string | undefined>;
        };
      };
    };
  };

  let fulfillment: { fulfilled: boolean; product: string | null } | null = null;

  if (
    event.event === "payment.captured" ||
    event.event === "payment.authorized"
  ) {
    const payment = event.payload?.payment?.entity;
    if (payment) {
      fulfillment = await fulfillRazorpayPayment(payment);
    }
  }

  return NextResponse.json({
    ok: true,
    received: event.event,
    paymentId: event.payload?.payment?.entity?.id ?? null,
    orderId: event.payload?.payment?.entity?.order_id ?? null,
    fulfillment,
  });
}
