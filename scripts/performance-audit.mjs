#!/usr/bin/env node
/**
 * Final pre-launch performance + SEO smoke audit.
 * Usage:
 *   node scripts/performance-audit.mjs
 *   node scripts/performance-audit.mjs https://indiaaibrief.com
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

async function fetchPath(path) {
  const url = `${base}${path}`;
  const started = performance.now();
  const res = await fetch(url, {
    redirect: "manual",
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
  if (text.includes("Sitemap: https://indiaaibrief.com/sitemap.xml")) {
    pass("main sitemap absolute HTTPS");
  } else {
    fail("main sitemap URL missing or not absolute HTTPS");
  }
  if (text.includes("Disallow: /dashboard/")) pass("disallows /dashboard/");
  else fail("should disallow /dashboard/");
}

async function auditSitemap(path, mustInclude) {
  console.log(`\n${path}`);
  const { res, text } = await fetchPath(path);
  if (!res.ok) {
    fail(`${path} HTTP ${res.status}`);
    return;
  }
  if (!text.includes("<urlset") && !text.includes("<sitemapindex")) {
    fail(`${path} does not look like sitemap XML`);
    return;
  }
  pass("valid-looking XML sitemap");
  for (const needle of mustInclude) {
    if (text.includes(needle)) pass(`contains ${needle}`);
    else warn(`missing expected token: ${needle}`);
  }
}

async function main() {
  console.log(`IndiaAIBrief performance/SEO audit → ${base}`);

  await auditRobots();
  await auditSitemap("/sitemap.xml", ["https://indiaaibrief.com/", "changefreq", "priority"]);
  await auditSitemap("/news-sitemap.xml", ["news:name", "IndiaAIBrief"]);
  await auditSitemap("/image-sitemap.xml", ["image:loc", "image:title"]);

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
