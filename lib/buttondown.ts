import type { NewsletterSubscriber } from "@/types";

const DEFAULT_API_URL = "https://api.buttondown.email/v1";

export async function subscribeToNewsletter(
  subscriber: NewsletterSubscriber,
): Promise<{ id: string; email: string }> {
  const apiKey = process.env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    // Dev/preview only — never pretend success in production.
    if (process.env.NODE_ENV !== "production") {
      console.info("[newsletter:dev]", {
        email: subscriber.email,
        tags: subscriber.tags ?? ["website"],
      });
      return { id: `local-${Date.now()}`, email: subscriber.email };
    }
    throw new Error(
      "Newsletter is temporarily unavailable. Email hello@indiaaibrief.com to join.",
    );
  }

  const apiUrl = process.env.BUTTONDOWN_API_URL ?? DEFAULT_API_URL;

  const response = await fetch(`${apiUrl}/subscribers`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: subscriber.email,
      tags: subscriber.tags ?? ["website"],
      type: "regular",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    // Already subscribed is success for UX.
    if (response.status === 400 && /already/i.test(detail)) {
      return { id: "existing", email: subscriber.email };
    }
    throw new Error(`Buttondown subscribe failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    id: string;
    email_address: string;
  };

  return { id: data.id, email: data.email_address };
}
