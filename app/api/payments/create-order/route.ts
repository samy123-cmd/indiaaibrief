import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createRazorpayOrder,
  getRazorpayCredentials,
  PRODUCTS,
} from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, isTrustedOrigin } from "@/lib/request-guards";

const bodySchema = z.object({
  product: z.enum(["ai-compliance", "ai-readiness"]),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200).optional().default(""),
  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default("")
    .refine(
      (v) => !v || /^https?:\/\//i.test(v) || !v.includes("://"),
      "Website must be a valid URL or empty",
    ),
});

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = clientIp(request);
    const limited = rateLimit({
      key: `pay-order:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let raw: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      raw = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      raw = {
        product: String(form.get("product") ?? ""),
        email: String(form.get("email") ?? ""),
        company: String(form.get("company") ?? ""),
        website: String(form.get("website") ?? ""),
      };
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid product and work email are required." },
        { status: 400 },
      );
    }

    const { product, email, company, website } = parsed.data;
    const catalog =
      product === "ai-compliance"
        ? PRODUCTS.complianceKit
        : PRODUCTS.readinessAudit;

    if (!Number.isFinite(catalog.amountPaise) || catalog.amountPaise < 100) {
      return NextResponse.json(
        { error: "Product pricing is misconfigured." },
        { status: 500 },
      );
    }

    const order = await createRazorpayOrder({
      amountPaise: catalog.amountPaise,
      receipt: `${catalog.slug}-${Date.now()}`.slice(0, 40),
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
    console.error("[payments:create-order]", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const message =
      error instanceof Error && /not configured|DOWNLOAD_TOKEN/i.test(error.message)
        ? error.message
        : "Unable to create payment order. Try again or email hello@indiaaibrief.com.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
