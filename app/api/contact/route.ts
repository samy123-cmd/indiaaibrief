import { NextResponse } from "next/server";
import {
  contactPayloadSchema,
  deliverContactMessage,
} from "@/lib/contact";

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = contactPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact form payload" },
        { status: 400 },
      );
    }

    const result = await deliverContactMessage(parsed.data);
    return NextResponse.json({ ok: true, channel: result.channel });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to send message. Email hello@indiaaibrief.com.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
