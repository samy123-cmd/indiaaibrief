#!/usr/bin/env node
/**
 * Assert canonical host redirects for indiaaibrief.com.
 * Fail if apex/http variants do not land on https://www with ≤1 hop
 * (HTTP apex may still be 2 hops until domain-level redirect is configured).
 *
 * Usage:
 *   node scripts/check-host-redirects.mjs
 *   node scripts/check-host-redirects.mjs --strict   # fail on 2-hop HTTP apex
 */

const STRICT = process.argv.includes("--strict");
const WWW = "https://www.indiaaibrief.com";

const cases = [
  {
    url: "http://indiaaibrief.com/",
    maxHops: STRICT ? 1 : 2,
    note: "HTTP apex (domain redirect collapses to 1 hop)",
  },
  { url: "https://indiaaibrief.com/", maxHops: 1, note: "HTTPS apex → www" },
  { url: "http://www.indiaaibrief.com/", maxHops: 1, note: "HTTP www → HTTPS" },
  { url: "https://www.indiaaibrief.com/", maxHops: 0, note: "canonical host" },
  {
    url: "https://indiaaibrief.com/about",
    maxHops: 1,
    note: "HTTPS apex path → www",
  },
  {
    url: "https://www.indiaaibrief.com/about/",
    maxHops: 1,
    note: "trailing slash strip on www",
  },
];

async function follow(url, limit = 5) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= limit; i++) {
    const res = await fetch(current, {
      redirect: "manual",
      method: "HEAD",
      headers: { "user-agent": "IndiaAIBrief-HostRedirectCheck/1.0" },
    });
    const location = res.headers.get("location");
    chain.push({ url: current, status: res.status, location });
    if (res.status < 300 || res.status >= 400 || !location) {
      return { chain, final: current, status: res.status, hops: i };
    }
    current = new URL(location, current).href;
  }
  return { chain, final: current, status: 0, hops: limit, loop: true };
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  return false;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
  return true;
}

async function main() {
  let ok = true;
  console.log(`Host redirect check (strict=${STRICT})\n`);

  for (const test of cases) {
    const result = await follow(test.url);
    const finalOk =
      result.final.replace(/\/$/, "") === WWW.replace(/\/$/, "") ||
      result.final.startsWith(`${WWW}/`) ||
      (test.maxHops === 0 && result.final.replace(/\/$/, "") === WWW.replace(/\/$/, ""));

    const hopOk = result.hops <= test.maxHops && !result.loop;
    const statusOk =
      test.maxHops === 0 ? result.status === 200 : result.status === 200 || result.hops > 0;

    // For redirecting hosts, final after follow should be 200 on www.
    const followed = await fetch(
      test.maxHops === 0 ? test.url : result.final,
      {
        redirect: "follow",
        method: "HEAD",
        headers: { "user-agent": "IndiaAIBrief-HostRedirectCheck/1.0" },
      },
    );
    const landedWww = followed.url.startsWith(WWW);
    const landed200 = followed.status === 200;

    const label = `${test.url} (${test.note})`;
    if (result.loop) {
      ok = fail(`${label}: redirect loop`) && ok;
      continue;
    }
    if (!hopOk) {
      ok =
        fail(
          `${label}: ${result.hops} hops (max ${test.maxHops}). Chain: ${result.chain
            .map((c) => `${c.status}${c.location ? "→" + c.location : ""}`)
            .join(" | ")}`,
        ) && ok;
      continue;
    }
    if (!landedWww || !landed200) {
      ok =
        fail(
          `${label}: landed on ${followed.url} HTTP ${followed.status} (want ${WWW} 200)`,
        ) && ok;
      continue;
    }
    if (!statusOk && !finalOk && test.maxHops > 0) {
      // soft — HEAD on intermediate is fine
    }
    pass(`${label}: ${result.hops} hop(s) → ${followed.url} (${followed.status})`);
  }

  // Sitemap must not advertise apex host
  console.log("\nSitemap host check:");
  const sm = await fetch(`${WWW}/sitemap.xml`);
  const xml = await sm.text();
  if (!sm.ok) {
    ok = fail(`sitemap HTTP ${sm.status}`) && ok;
  } else if (/https?:\/\/indiaaibrief\.com\//.test(xml)) {
    ok = fail("sitemap contains apex (non-www) URLs") && ok;
  } else if (!xml.includes(`${WWW}/`)) {
    ok = fail("sitemap missing www absolute URLs") && ok;
  } else {
    pass("sitemap uses www-only absolute URLs");
  }

  // robots + indexability sample
  console.log("\nIndexability sample:");
  for (const path of ["/about", "/authors", "/startups/sarvam-ai"]) {
    const res = await fetch(`${WWW}${path}`);
    const html = await res.text();
    if (res.status !== 200) {
      ok = fail(`${path} HTTP ${res.status}`) && ok;
      continue;
    }
    if (/noindex/i.test(html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || "")) {
      ok = fail(`${path} has noindex`) && ok;
      continue;
    }
    if (!html.includes(`rel="canonical"`) && !html.includes(`rel='canonical'`)) {
      ok = fail(`${path} missing canonical`) && ok;
      continue;
    }
    if (!html.includes(`https://www.indiaaibrief.com${path}`)) {
      ok = fail(`${path} canonical does not point at www path`) && ok;
      continue;
    }
    pass(`${path}: 200, indexable, www canonical`);
  }

  console.log(ok ? "\nAll host redirect checks passed." : "\nHost redirect checks FAILED.");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
