#!/usr/bin/env node
/**
 * Collapse HTTP apex → HTTPS www into a single hop via Vercel domain redirect.
 *
 * App-level redirects (next.config / vercel.json) still leave:
 *   http://indiaaibrief.com → https://indiaaibrief.com → https://www.indiaaibrief.com
 *
 * Domain-level redirect (this script) makes:
 *   http://indiaaibrief.com → https://www.indiaaibrief.com  (1 hop)
 *
 * Usage:
 *   VERCEL_TOKEN=… node scripts/configure-www-redirect.mjs
 *   VERCEL_TOKEN=… VERCEL_PROJECT_ID=prj_… VERCEL_TEAM_ID=team_… node scripts/configure-www-redirect.mjs
 */

const TOKEN = process.env.VERCEL_TOKEN?.trim();
const PROJECT =
  process.env.VERCEL_PROJECT_ID?.trim() ||
  process.env.VERCEL_PROJECT_NAME?.trim() ||
  "indiaaibrief";
const TEAM = process.env.VERCEL_TEAM_ID?.trim() || process.env.VERCEL_ORG_ID?.trim();
const APEX = "indiaaibrief.com";
const WWW = "www.indiaaibrief.com";

if (!TOKEN) {
  console.error("VERCEL_TOKEN is required.");
  console.error(
    "Create a token at https://vercel.com/account/tokens then re-run:",
  );
  console.error("  $env:VERCEL_TOKEN='…'; node scripts/configure-www-redirect.mjs");
  process.exit(1);
}

function apiUrl(path) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (TEAM) url.searchParams.set("teamId", TEAM);
  return url;
}

async function api(method, path, body) {
  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error?.message || text || res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return json;
}

async function verifyHops() {
  const targets = [
    `http://${APEX}/`,
    `https://${APEX}/`,
    `http://${WWW}/`,
    `https://${WWW}/`,
  ];
  console.log("\nLive hop check:");
  for (const url of targets) {
    const res = await fetch(url, { redirect: "manual", method: "HEAD" });
    const loc = res.headers.get("location") || "";
    console.log(
      `  ${url} → ${res.status}${loc ? ` Location: ${loc}` : " (no redirect)"}`,
    );
  }
}

async function main() {
  console.log(`Configuring ${APEX} → ${WWW} (308) on project ${PROJECT}`);

  const updated = await api("PATCH", `/v9/projects/${PROJECT}/domains/${APEX}`, {
    redirect: WWW,
    redirectStatusCode: 308,
  });

  console.log("✓ Domain redirect updated:");
  console.log(
    `  name=${updated.name} redirect=${updated.redirect} status=${updated.redirectStatusCode}`,
  );

  // Give edge a moment, then verify.
  await new Promise((r) => setTimeout(r, 2500));
  await verifyHops();

  console.log(`
Expected after domain redirect:
  http://${APEX}/  → 308 → https://${WWW}/
  https://${APEX}/ → 308 → https://${WWW}/
  http://${WWW}/   → 308 → https://${WWW}/
  https://${WWW}/  → 200
`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
