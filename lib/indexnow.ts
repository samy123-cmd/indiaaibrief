import { absoluteUrl } from "@/lib/utils";

const INDEXNOW_ENDPOINTS = [
  "https://www.bing.com/indexnow",
  "https://api.indexnow.org/indexnow",
];

/** Public IndexNow key — must match the hosted `/{key}.txt` file. */
export function getIndexNowKey(): string | undefined {
  return (
    process.env.INDEXNOW_KEY?.trim() ||
    process.env.NEXT_PUBLIC_INDEXNOW_KEY?.trim() ||
    undefined
  );
}

export function getIndexNowKeyLocation(key: string): string {
  return absoluteUrl(`/${key}.txt`);
}

/**
 * Notify IndexNow (Bing + partners) that URLs changed.
 * Key file must be live at `https://www.indiaaibrief.com/{key}.txt`.
 */
export async function submitIndexNow(
  urls: string[],
): Promise<{ ok: boolean; status: number; body: string }> {
  const key = getIndexNowKey();
  if (!key) {
    return { ok: false, status: 0, body: "INDEXNOW_KEY is not set" };
  }

  const host = new URL(absoluteUrl("/")).host;
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { ok: false, status: 0, body: "No URLs to submit" };
  }

  const payload = {
    host,
    key,
    keyLocation: getIndexNowKeyLocation(key),
    urlList: unique,
  };

  let lastStatus = 0;
  let lastBody = "";

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      lastBody = await response.text();
      lastStatus = response.status;
      if (response.status === 200 || response.status === 202) {
        return {
          ok: true,
          status: response.status,
          body: lastBody || response.statusText,
        };
      }
    } catch (error) {
      lastBody =
        error instanceof Error ? error.message : "IndexNow request failed";
      lastStatus = 0;
    }
  }

  return {
    ok: false,
    status: lastStatus,
    body: lastBody || "IndexNow request failed",
  };
}
