import { z } from "zod";

export const contactPayloadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  subject: z.enum(["General", "Press", "Partnership", "Product Support"]),
  message: z.string().trim().min(10).max(4000),
});

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

const INBOX = process.env.CONTACT_INBOX ?? "hello@indiaaibrief.com";

/**
 * Deliver a contact form submission via Resend and/or webhook.
 * Fails closed in production when no delivery channel is configured.
 */
export async function deliverContactMessage(
  payload: ContactPayload,
): Promise<{ channel: string }> {
  const channels: string[] = [];
  const errors: string[] = [];

  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(payload);
      channels.push("resend");
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Resend failed");
    }
  }

  if (process.env.CONTACT_WEBHOOK_URL) {
    try {
      await sendViaWebhook(payload);
      channels.push("webhook");
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Webhook failed");
    }
  }

  if (channels.length > 0) {
    console.info("[contact]", {
      email: payload.email,
      subject: payload.subject,
      channels,
    });
    return { channel: channels.join("+") };
  }

  // Dev / preview: persist to logs so local QA still works.
  if (process.env.NODE_ENV !== "production") {
    console.info("[contact:dev]", payload);
    return { channel: "dev-log" };
  }

  throw new Error(
    errors[0] ??
      `Contact delivery is not configured. Email ${INBOX} directly.`,
  );
}

async function sendViaResend(payload: ContactPayload): Promise<void> {
  const from =
    process.env.RESEND_FROM_EMAIL ?? "IndiaAIBrief <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [INBOX],
      reply_to: payload.email,
      subject: `[Contact · ${payload.subject}] ${payload.name}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Subject: ${payload.subject}`,
        "",
        payload.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }
}

async function sendViaWebhook(payload: ContactPayload): Promise<void> {
  const response = await fetch(process.env.CONTACT_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "contact",
      receivedAt: new Date().toISOString(),
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook ${response.status}`);
  }
}
