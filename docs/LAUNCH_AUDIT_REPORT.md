# Launch Audit Report — indiaaibrief.com

**Date:** 2026-07-30 (remediation pass)  
**Scope:** Public launch readiness for Google Search Console + AdSense Mode 1A (ready, no live ads).  
**Canonical host:** `https://www.indiaaibrief.com`

---

## Final verdict

**indiaaibrief.com is ready to deploy to Google Search Console and AdSense (AdSense-ready mode).**

Meaning:

- Site is live on HTTPS, crawlable, with legal pages, sitemaps, robots, structured data, and 41 original articles.
- AdSense stance: **approval-ready / do-not-apply-yet** (no `ads.txt` publisher file, no ad scripts).
- GSC: HTML meta verification path is wired in code; **you must paste** `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and click Verify (see [GOOGLE_SEARCH_CONSOLE.md](GOOGLE_SEARCH_CONSOLE.md)).

---

## Evidence summary

### Domain & hosting

| Check | Result |
|-------|--------|
| Apex DNS A | `216.150.1.1` (GoDaddy NS `domaincontrol.com`) |
| www CNAME | `56e104cf056400f0.vercel-dns-016.com` → Vercel |
| HTTPS | Valid; HSTS `max-age=63072000; includeSubDomains; preload` |
| Preferred host | **www** — `https://indiaaibrief.com` → `308` → `https://www.indiaaibrief.com` (single hop) |
| HTTP apex | Still **2 hops** (`http://apex` → `https://apex` → `https://www`) — optional: Vercel Domains → Redirect to www |
| Security headers | CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` present |

### robots.txt

Live at `/robots.txt`: allows `/`, AI crawlers (`GPTBot`, `PerplexityBot`, `Google-Extended`, Googlebot), disallows `/dashboard/`, `/api/`. Sitemap directives point at **www** absolute URLs.

### Sitemaps

| Sitemap | Status |
|---------|--------|
| `/sitemap.xml` | ~81 URLs after `/authors` index added; all www absolute |
| `/news-sitemap.xml` | ≥1 news URL (`publishedAt` 2026-07-30 deepfake HC) |
| `/image-sitemap.xml` | 41 image entries |

### `/ads.txt` (AdSense Mode 1A)

Clean **404** `text/plain` + `X-Robots-Tag: noindex` until approval.  
Route: [`app/ads.txt/route.ts`](../app/ads.txt/route.ts). Keep [`public/ads.txt.example`](../public/ads.txt.example).

### Legal & content (AdSense policy)

- Privacy, Terms, Cookies, Refund, Editorial, DMCA, About, Contact — **200**
- Footer bottom strip: Privacy, Terms, **Cookies**, Editorial
- **41** original MDX articles; reserved inactive `AdSlot` only; CSP has **no** googlesyndication

### SEO / structured data

- Canonicals via `buildMetadata` / `absoluteUrl` (forces www)
- Article frontmatter `canonical` honored in metadata + NewsArticle `mainEntityOfPage`
- Organization + WebSite JSON-LD on layout; NewsArticle / FAQ / Breadcrumb on articles

### Performance (lab Lighthouse, mobile, Edge headless)

| URL | Perf score | LCP | CLS |
|-----|------------|-----|-----|
| `/` (home, local post-remediation) | ~81 | ~4.5s (H1 text) | 0 |
| `/` (home, prior production lab) | ~77 | ~4.8s | 0 |
| Article (deepfake HC, prior) | **95** | ~2.8s | 0 |

Home LCP element is the hero `<h1>` (not an image). Bounded remediations: variable Inter (single font file), Trending above pulse strip, single priority image (no competing Latest priority). Field CWV appears in GSC after ~28 days.

### Automated smoke audit

```text
npm run audit:perf -- https://www.indiaaibrief.com
→ Passed: 65  Failed: 0  Warnings: 0
```

---

## Fixes shipped (this remediation pass)

1. **`app/sitemap.ts`** — include `/authors` index URL  
2. **`components/layout/site-footer.tsx`** — Cookies link in bottom legal strip  
3. **`lib/seo.ts` + article `generateMetadata`** — honor `post.canonical`  
4. **`lib/schema.ts`** — NewsArticle `@id` uses `getPostAbsoluteUrl`  
5. **Home LCP** — variable Inter; Trending before India pulse; drop dual image `priority` on Latest  
6. Docs refreshed for Mode 1A + GSC ops

Prior audit also shipped: ads.txt 404 route, www host redirect, soft-404 SEO, audit script hardening.

---

## Your remaining ops (required for GSC verify)

These cannot be completed from the repo alone — paste your token and click Verify in GSC.

### 1. HTML meta verification

1. Search Console → **URL prefix** property: `https://www.indiaaibrief.com`  
2. Choose **HTML tag** → copy the `content="…"` token only  
3. Vercel → Environment Variables (Production):

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=PASTE_TOKEN_HERE
```

4. Redeploy (includes this remediation pass)  
5. Confirm meta on homepage source → click **Verify**  
6. Submit sitemaps:

- `https://www.indiaaibrief.com/sitemap.xml`
- `https://www.indiaaibrief.com/news-sitemap.xml`
- `https://www.indiaaibrief.com/image-sitemap.xml`

7. Request indexing for `/`, top articles, `/news`, `/explains`, `/kit/ai-compliance`, `/about`, `/contact`

Full runbook: [GOOGLE_SEARCH_CONSOLE.md](GOOGLE_SEARCH_CONSOLE.md).

### 2. Optional polish

- Vercel Domains: **Redirect to www** (collapse `http://apex` double hop)  
- Keep publishing news weekly so the news sitemap stays non-empty (48h window)  
- Re-run `npm run audit:perf -- https://www.indiaaibrief.com` after deploy  
- Rich Results Test on one article URL (manual)  
- Do **not** apply to AdSense until you deliberately decide ([ADSENSE_READINESS.md](ADSENSE_READINESS.md))

---

## Residual risks (non-blocking)

| Risk | Notes |
|------|--------|
| GSC not verified yet | Blocked on your verification token |
| Home LCP lab ~4.5s | H1 text LCP; article OK; further pass = HTML payload / field CWV |
| HTTP double redirect | Cosmetic; fix in Vercel domain UI |
| Streamed notFound → 200 | Mitigated with noindex + global-not-found |
| Newsletter archive empty / seed trackers | Product gaps, not AdSense/GSC blockers |

---

## Statement

> **indiaaibrief.com is ready to deploy to Google Search Console and AdSense (AdSense-ready mode).**

AdSense = policy-ready, slots reserved, **no application and no live ads** until you choose otherwise. GSC = code-ready for HTML meta; complete verification with your token using the steps above.
