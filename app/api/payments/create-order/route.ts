import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createRazorpayOrder,
  getRazorpayCredentials,
  PRODUCTS,
} from "@/lib/payments";

const productSchema = z.enum(["ai-compliance", "ai-readiness"]);

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let productRaw = "";
    let email = "";
    let company = "";
    let website = "";

    if (contentType.includes("application/json")) {
      const json = (await request.json()) as Record<string, string>;
      productRaw = json.product ?? "";
      email = json.email ?? "";
      company = json.company ?? "";
      website = json.website ?? "";
    } else {
      const form = await request.formData();
      productRaw = String(form.get("product") ?? "");
      email = String(form.get("email") ?? "");
      company = String(form.get("company") ?? "");
      website = String(form.get("website") ?? "");
    }

    const product = productSchema.parse(productRaw);
    const catalog =
      product === "ai-compliance"
        ? PRODUCTS.complianceKit
        : PRODUCTS.readinessAudit;

    const order = await createRazorpayOrder({
      amountPaise: catalog.amountPaise,
      receipt: `${catalog.slug}-${Date.now()}`,
      notes: {
        product: catalog.slug,
        email,
        company,
        website,
      },
    });

    const { keyId } = getRazorpayCredentials();

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      product: catalog.slug,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
