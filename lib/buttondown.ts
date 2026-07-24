import type { NewsletterSubscriber } from "@/types";

/** Current Buttondown host; .email still redirects but .com is canonical. */
const DEFAULT_API_URL = "https://api.buttondown.com/v1";

function normalizeApiUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  return trimmed.replace(
    "https://api.buttondown.email/v1",
    "https://api.buttondown.com/v1",
  );
}

export async function subscribeToNewsletter(
  subscriber: NewsletterSubscriber & { ipAddress?: string },
): Promise<{ id: string; email: string }> {
  const apiKey = process.env.BUTTONDOWN_API_KEY?.trim();

  if (!apiKey) {
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

  const apiUrl = normalizeApiUrl(
    process.env.BUTTONDOWN_API_URL ?? DEFAULT_API_URL,
  );

  const headers: Record<string, string> = {
    Authorization: `Token ${apiKey}`,
    "Content-Type": "application/json",
    "X-Buttondown-Collision-Behavior": "overwrite",
  };

  // Bypass is aggressively rate-limited (5/hour). Prefer client IP so Buttondown
  // does not treat our server IP as a spam source. Use bypass only when IP is missing.
  if (!subscriber.ipAddress) {
    headers["X-Buttondown-Bypass-Firewall"] = "true";
  }

  const body: Record<string, unknown> = {
    email_address: subscriber.email,
    tags: subscriber.tags ?? ["website"],
    type: "regular",
  };
  if (subscriber.ipAddress) {
    body.ip_address = subscriber.ipAddress;
  }

  const response = await fetch(`${apiUrl}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    if (
      (response.status === 400 || response.status === 409) &&
      /already|exist|duplicate/i.test(detail)
    ) {
      return { id: "existing", email: subscriber.email };
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Newsletter API key is invalid. Check BUTTONDOWN_API_KEY in .env.local.",
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Newsletter is rate-limited right now. Try again in a few minutes.",
      );
    }
    if (/subscriber_blocked|firewall/i.test(detail)) {
      throw new Error(
        "That email was blocked by the newsletter spam filter. Use a real inbox (not disposable), or loosen Firewall rules in Buttondown.",
      );
    }
    throw new Error(
      `Newsletter subscribe failed (${response.status}).`,
    );
  }

  const data = (await response.json()) as {
    id: string;
    email_address: string;
  };

  return { id: data.id, email: data.email_address };
}
