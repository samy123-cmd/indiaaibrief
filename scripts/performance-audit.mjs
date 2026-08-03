#!/usr/bin/env node
/**
 * Final pre-launch performance + SEO smoke audit.
 * Usage:
 *   node scripts/performance-audit.mjs
 *   node scripts/performance-audit.mjs https://www.indiaaibrief.com
 */

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");

const paths = [
  "/",
  "/news",
  "/explains",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/refund",
  "/editorial",
  "/dmca",
  "/kit/ai-compliance",
  "/subscribe",
  "/authors",
  "/robots.txt",
  "/sitemap.xml",
  "/news-sitemap.xml",
  "/image-sitemap.xml",
];

const checks = {
  ok: 0,
  fail: 0,
  warnings: [],
};

function pass(msg) {
  checks.ok += 1;
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  checks.fail += 1;
  console.error(`  ✗ ${msg}`);
}

function warn(msg) {
  checks.warnings.push(msg);
  console.warn(`  ! ${msg}`);
}

async function fetchPath(path, { redirect = "manual" } = {}) {
  const url = `${base}${path}`;
  const started = performance.now();
  const res = await fetch(url, {
    redirect,
    headers: { "user-agent": "IndiaAIBrief-PerfAudit/1.0" },
  });
  const ms = Math.round(performance.now() - started);
  const text = await res.text();
  return { url, res, ms, text };
}

async function auditHtml(path) {
  console.log(`\n${path}`);
  const { url, res, ms, text } = await fetchPath(path);

  if (res.status >= 300 && res.status < 400) {
    warn(`${url} redirected (${res.status}) in ${ms}ms`);
    return;
  }

  if (!res.ok) {
    fail(`${url} → HTTP ${res.status} (${ms}ms)`);
    return;
  }

  pass(`HTTP ${res.status} in ${ms}ms`);
  if (ms > 2500) warn(`TTFB/response slow for lab target: ${ms}ms`);

  if (!text.includes("<title")) fail("missing <title>");
  else pass("has <title>");

  if (!/rel=["']canonical["']/i.test(text) && !path.endsWith(".xml") && path !== "/robots.txt") {
    warn("canonical link not found in HTML (may be streaming/deferred)");
  }

  if (path === "/" || path.startsWith("/news") || path.includes("/kit/")) {
    if (!text.includes("application/ld+json")) warn("no JSON-LD detected");
    else pass("JSON-LD present");
  }

  if (!/width=["']\d+["']/i.test(text) && text.includes("<img")) {
    warn("some images may lack width attributes");
  }

  const hsts = res.headers.get("strict-transport-security");
  if (base.startsWith("https://")) {
    if (hsts) pass("HSTS header present");
    else warn("HSTS header missing");
  }
}

async function auditRobots() {
  console.log("\n/robots.txt");
  const { res, text } = await fetchPath("/robots.txt");
  if (!res.ok) {
    fail(`robots.txt HTTP ${res.status}`);
    return;
  }
  for (const bot of ["GPTBot", "PerplexityBot", "Google-Extended", "Googlebot"]) {
    if (text.includes(bot)) pass(`mentions ${bot}`);
    else fail(`missing ${bot}`);
  }
  if (/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i.test(text)) {
    pass("main sitemap absolute URL present");
  } else {
    fail("main sitemap URL missing or not absolute");
  }
  if (text.includes("Disallow: /dashboard/")) pass("disallows /dashboard/");
  else fail("should disallow /dashboard/");
}

async function auditSitemap(path, mustInclude, { requireUrl = true, allowEmpty404 = false } = {}) {
  console.log(`\n${path}`);
  const { res, text } = await fetchPath(path);
  if (allowEmpty404 && res.status === 404) {
    pass(`${path} HTTP 404 (empty news window — expected)`);
    return;
  }
  if (!res.ok) {
    fail(`${path} HTTP ${res.status}`);
    return;
  }
  if (!text.includes("<urlset") && !text.includes("<sitemapindex")) {
    fail(`${path} does not look like sitemap XML`);
    return;
  }
  pass("valid-looking XML sitemap");
  if (requireUrl && !text.includes("<url>") && !text.includes("<url ")) {
    warn(`${path} has empty urlset (no <url> entries)`);
  }
  for (const needle of mustInclude) {
    if (text.includes(needle)) pass(`contains ${needle}`);
    else warn(`missing expected token: ${needle}`);
  }
}

async function auditAdsTxt() {
  console.log("\n/ads.txt");
  const { res, text } = await fetchPath("/ads.txt");
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  // Until AdSense approval: clean 404 text/plain (not HTML soft-200).
  if (res.status === 404) {
    if (ct.includes("text/html")) {
      fail("/ads.txt 404 but Content-Type is HTML");
      return;
    }
    pass("HTTP 404 (correct until AdSense approval)");
    if (!text.includes("<!DOCTYPE") && !text.includes("<html")) {
      pass("body is not HTML");
    } else {
      fail("404 body still looks like HTML");
    }
    return;
  }

  if (res.status === 200 && ct.includes("text/plain") && text.includes("google.com")) {
    pass("live ads.txt present (post-approval)");
    return;
  }

  fail(
    `/ads.txt unexpected: HTTP ${res.status}, content-type=${ct || "none"} (want 404 text/plain until approval)`,
  );
}

async function auditSampleArticle() {
  console.log("\n(sample article from sitemap)");
  const { res, text } = await fetchPath("/sitemap.xml");
  if (!res.ok) {
    warn("could not load sitemap for article sample");
    return;
  }
  const match = text.match(
    /<loc>(https?:\/\/[^<]+\/(?:news|explains|compares|playbooks|data)\/[^<]+)<\/loc>/,
  );
  if (!match) {
    warn("no article URL found in sitemap");
    return;
  }
  let path;
  try {
    path = new URL(match[1]).pathname;
  } catch {
    warn(`could not parse article URL: ${match[1]}`);
    return;
  }
  console.log(`  sampling ${path}`);
  const article = await fetchPath(path);
  if (article.res.status === 200) pass(`article HTTP 200 (${path})`);
  else fail(`article HTTP ${article.res.status} (${path})`);
  if (article.text.includes("application/ld+json")) pass("article JSON-LD present");
  else warn("article missing JSON-LD");
}

async function main() {
  console.log(`IndiaAIBrief performance/SEO audit → ${base}`);

  await auditRobots();
  await auditSitemap("/sitemap.xml", ["changefreq", "priority", "/"]);
  await auditSitemap("/news-sitemap.xml", ["news:name", "IndiaAIBrief"], {
    allowEmpty404: true,
  });
  await auditSitemap("/image-sitemap.xml", ["image:loc", "image:title"]);
  await auditAdsTxt();
  await auditSampleArticle();

  for (const path of paths.filter((p) => !p.includes("sitemap") && p !== "/robots.txt")) {
    try {
      await auditHtml(path);
    } catch (error) {
      fail(`${path} fetch error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\n———");
  console.log(`Passed: ${checks.ok}  Failed: ${checks.fail}  Warnings: ${checks.warnings.length}`);
  if (checks.fail > 0) process.exit(1);
}

main();
