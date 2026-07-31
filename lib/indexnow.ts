import { absoluteUrl } from "@/lib/utils";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

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

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  // IndexNow returns 200/202 on success; 422 if key invalid.
  return {
    ok: response.status === 200 || response.status === 202,
    status: response.status,
    body: body || response.statusText,
  };
}
