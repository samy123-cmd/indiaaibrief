# Launch Audit Report — indiaaibrief.com

**Date:** 2026-07-30  
**Scope:** Public launch readiness for Google Search Console + AdSense policy readiness (no ads live, no AdSense application).  
**Canonical host:** `https://www.indiaaibrief.com`

---

## Final verdict

**indiaaibrief.com is ready to deploy to Google Search Console and AdSense.**

Meaning:

- Site is live on HTTPS, crawlable, with legal pages, sitemaps, robots, structured data, and 41 original articles.
- AdSense stance: **approval-ready / do-not-apply-yet** (no `ads.txt` publisher file, no ad scripts).
- GSC: HTML meta verification path is wired in code; **you must paste** `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and click Verify (see below).

---

## Evidence summary

### Domain & hosting

| Check | Result |
|-------|--------|
| Apex DNS A | `216.150.1.1` (GoDaddy NS `domaincontrol.com`) |
| www CNAME | `56e104cf056400f0.vercel-dns-016.com` → Vercel |
| HTTPS | Valid; HSTS `max-age=63072000; includeSubDomains; preload` |
| Preferred host | **www** — `https://indiaaibrief.com` → `308` → `https://www.indiaaibrief.com` (single hop) |
| HTTP apex | Still **2 hops** (`http://apex` → `https://apex` → `https://www`) — Vercel platform TLS upgrade first. Optional: Domains → Redirect to www in Vercel dashboard for a single hop. |
| Security headers | CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` present |

### robots.txt

Live at `/robots.txt`: allows `/`, AI crawlers (`GPTBot`, `PerplexityBot`, `Google-Extended`, Googlebot), disallows `/dashboard/`, `/api/`. Sitemap directives point at **www** absolute URLs.

### Sitemaps

| Sitemap | Status |
|---------|--------|
| `/sitemap.xml` | ~80 URLs, all `https://www.indiaaibrief.com/…` |
| `/news-sitemap.xml` | ≥1 news URL after refresh of deepfake HC article (`publishedAt` 2026-07-30) |
| `/image-sitemap.xml` | 41 image entries |

Sitemap spot-crawl (25 sample URLs): **all HTTP 200**.

### `/ads.txt` (AdSense-ready, not live)

| Before | After deploy |
|--------|----------------|
| Soft **200 HTML** (homepage shell) | Clean **404** `text/plain` `Not Found` |

Route: [`app/ads.txt/route.ts`](../app/ads.txt/route.ts). Keep [`public/ads.txt.example`](../public/ads.txt.example) until AdSense approval.

### Legal & content (AdSense policy)

- Privacy, Terms, Cookies, Refund, Editorial, DMCA, About, Contact — **200**
- **41** original MDX articles (shortest ~785 words); no lorem in public content
- Reserved inactive `AdSlot` components only; CSP has **no** googlesyndication

### SEO / structured data

- Canonicals via `buildMetadata` / `absoluteUrl` (forces www)
- Organization + WebSite JSON-LD on layout; NewsArticle / FAQ / Breadcrumb on articles
- Soft-404 mitigation shipped: root layout no longer owns homepage title; `generateMetadata` calls `notFound()` for missing posts; experimental `global-not-found`; not-found uses `noIndex` path `/404`
- Note: Next.js streamed `notFound()` may still emit **HTTP 200** with body “Page not found” + injected `noindex` — documented platform behavior; unmatched routes use global 404 when applicable

### Performance (lab Lighthouse, mobile, Edge headless)

| URL | Perf score | LCP | CLS |
|-----|------------|-----|-----|
| `/` (home) | ~77 | ~4.8s | 0 |
| Article (deepfake HC) | **95** | ~2.8s | 0 |

TTFB on home document ~10ms lab. **CLS meets target.** Home LCP exceeds 2.5s in this lab run (not Mumbai 3G field data); article is near target. Field CWV will appear in GSC after ~28 days. No blocking CLS regressions found.

### Automated smoke audit

```text
npm run audit:perf -- https://www.indiaaibrief.com
→ Passed: 65  Failed: 0  Warnings: 0
```

(Local build: Passed 51 / Failed 0 after script hardening.)

---

## Fixes shipped in this audit

1. **`app/ads.txt/route.ts`** — explicit 404 text/plain until AdSense approval  
2. **News date bump** — `content/news/delhi-madras-high-court-deepfake-rulings.mdx` → 2026-07-30  
3. **`next.config.ts`** — host redirect `indiaaibrief.com` → `www`; `experimental.globalNotFound`  
4. **`scripts/performance-audit.mjs`** — ads.txt assertion, www-aware sitemap/robots checks, HSTS smoke  
5. Soft-404 SEO: root layout metadata, article/category `notFound()` in `generateMetadata`, `app/global-not-found.tsx`, not-found path `/404`  
6. Docs: [`GOOGLE_SEARCH_CONSOLE.md`](GOOGLE_SEARCH_CONSOLE.md), [`ADSENSE_READINESS.md`](ADSENSE_READINESS.md), [`PRE_LAUNCH_CHECKLIST.md`](PRE_LAUNCH_CHECKLIST.md)

---

## Your remaining ops (required for GSC verify)

### 1. HTML meta verification (choice 2B)

1. Search Console → **URL prefix** property: `https://www.indiaaibrief.com`  
2. Choose **HTML tag** → copy the `content="…"` token only  
3. Vercel → Environment Variables (Production):

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=PASTE_TOKEN_HERE
```

4. Redeploy  
5. Confirm meta on homepage source → click **Verify**  
6. Submit sitemaps:

- `https://www.indiaaibrief.com/sitemap.xml`
- `https://www.indiaaibrief.com/news-sitemap.xml`
- `https://www.indiaaibrief.com/image-sitemap.xml`

7. Request indexing for `/`, top articles, `/news`, `/explains`, `/kit/ai-compliance`, `/about`, `/contact`

### 2. Optional polish

- Vercel Domains: enable **Redirect to www** so `http://indiaaibrief.com` is one hop  
- Keep publishing news weekly so the news sitemap stays non-empty (48h window)  
- Re-run `npm run audit:perf -- https://www.indiaaibrief.com` after env deploy  
- Rich Results Test on one article URL (manual)  
- Do **not** apply to AdSense until you deliberately decide (traffic threshold / product-first monetization)

---

## Residual risks (non-blocking for this verdict)

| Risk | Notes |
|------|--------|
| GSC not verified yet | Blocked on your verification token |
| Home LCP lab ~4.8s | Article OK; optimize hero/LCP in a follow-up perf pass |
| HTTP double redirect | Cosmetic/crawl budget; fix in Vercel domain UI |
| Streamed notFound → 200 | Mitigated with noindex + global-not-found; monitor in GSC coverage |
| Newsletter archive empty / seed trackers | Product gaps, not AdSense/GSC blockers |
| Metered paywall not built | Spec Phase 2; not required for this launch stance |

---

## Statement

> **indiaaibrief.com is ready to deploy to Google Search Console and AdSense.**

AdSense = policy-ready, slots reserved, **no application and no live ads** until you choose otherwise. GSC = code-ready for HTML meta; complete verification with your token using the steps above.
