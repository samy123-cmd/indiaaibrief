import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/buttondown";

const bodySchema = z.object({
  email: z.string().email(),
  tags: z.array(z.string()).optional(),
});

function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || undefined;
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const subscriber = await subscribeToNewsletter({
      email: parsed.data.email,
      tags: parsed.data.tags,
      ipAddress: clientIp(request),
    });

    return NextResponse.json({ ok: true, id: subscriber.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Newsletter subscription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
