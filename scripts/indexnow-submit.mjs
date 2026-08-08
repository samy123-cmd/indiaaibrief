#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing + partners).
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs
 *   node scripts/indexnow-submit.mjs /explains/foo https://www.indiaaibrief.com/news
 *
 * Requires INDEXNOW_KEY in env (defaults to the hosted public key if unset).
 * Key file must be live at https://www.indiaaibrief.com/{key}.txt
 */

const KEY =
  process.env.INDEXNOW_KEY?.trim() ||
  process.env.NEXT_PUBLIC_INDEXNOW_KEY?.trim() ||
  "e8fb5aa82fc64eef87da5bdcc606a150";

const HOST = "www.indiaaibrief.com";
const BASE = `https://${HOST}`;
const KEY_LOCATION = `${BASE}/${KEY}.txt`;

const DEFAULT_URLS = [
  "/",
  "/news",
  "/explains",
  "/compares",
  "/playbooks",
  "/data",
  "/about",
  "/authors",
  "/contact",
  "/careers",
  "/policy",
  "/privacy",
  "/terms",
  "/cookies",
  "/subscribe",
  "/kit/ai-compliance",
  "/explains/india-ai-strategy-sovereign-safety",
  "/explains/dpdp-act-ai-training-data",
  "/explains/ai-regulation-india-business-guide",
  "/compares/sarvam-ai-vs-krutrim",
  "/compares/claude-vs-gpt-indian-enterprises",
  "/playbooks/how-to-build-ai-startup-india",
  "/data/ai-in-india-market-statistics-2026",
  "/news/delhi-madras-high-court-deepfake-rulings",
];

function toAbsolute(url) {
  if (url.startsWith("http")) return url;
  return `${BASE}${url.startsWith("/") ? url : `/${url}`}`;
}

/** Pull www URLs from live sitemap so IndexNow covers discovered inventory. */
async function urlsFromSitemap(limit = 80) {
  try {
    const res = await fetch(`${BASE}/sitemap.xml`);
    if (!res.ok) return [];
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>(https:\/\/www\.indiaaibrief\.com[^<]*)<\/loc>/g)].map(
      (m) => m[1],
    );
    return locs.slice(0, limit);
  } catch {
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const fromArgs = args.map(toAbsolute);
  const fromDefaults = DEFAULT_URLS.map(toAbsolute);
  const fromSitemap = args.length ? [] : await urlsFromSitemap();
  const urls = [...new Set([...fromArgs, ...fromDefaults, ...fromSitemap])];

  // Verify key file is reachable before submitting
  const keyRes = await fetch(KEY_LOCATION);
  const keyBody = (await keyRes.text()).trim();
  if (!keyRes.ok || keyBody !== KEY) {
    console.error(
      `Key file check failed: GET ${KEY_LOCATION} → ${keyRes.status} body="${keyBody.slice(0, 40)}"`,
    );
    console.error("Deploy public/{key}.txt first, then re-run.");
    process.exit(1);
  }
  console.log(`✓ Key file live at ${KEY_LOCATION}`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    "https://www.bing.com/indexnow",
    "https://api.indexnow.org/indexnow",
  ];

  let lastError;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log(`IndexNow (${endpoint}) → ${res.status} ${text || res.statusText}`);
      console.log(`Submitted ${urls.length} URLs`);
      if (res.status === 200 || res.status === 202) return;
      lastError = new Error(`${endpoint} → ${res.status}`);
    } catch (err) {
      console.warn(`IndexNow (${endpoint}) failed:`, err.cause?.code || err.message);
      lastError = err;
    }
  }
  throw lastError ?? new Error("IndexNow submit failed");
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
