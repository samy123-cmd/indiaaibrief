# Google Search Console — IndiaAIBrief

Canonical host is **`https://www.indiaaibrief.com`**. Apex (`indiaaibrief.com`) permanently redirects to www.

**Status (2026-07-30):** Code is ready for HTML-meta verification. Property verify + sitemap submit are **manual ops** — they require your GSC token and cannot be finished from the repo alone.

## 1. Add property (HTML meta — preferred for this launch)

1. Open [Google Search Console](https://search.google.com/search-console)
2. Add property type: **URL prefix** → `https://www.indiaaibrief.com`
3. Choose **HTML tag** verification
4. Copy only the **content** token (the string inside `content="…"`), not the full meta tag

### Set the env var

In Vercel → Project → Settings → Environment Variables (Production):

```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_token_here
```

Or locally in `.env.local` for a preview check. Redeploy after saving.

`buildMetadata` in `lib/seo.ts` injects:

```html
<meta name="google-site-verification" content="your_token_here" />
```

### Verify

1. View source on `https://www.indiaaibrief.com/` and confirm the meta tag
2. Click **Verify** in Search Console

### Alternate: Domain property (DNS TXT)

If you prefer a domain-wide property covering all subdomains:

1. Add property: **Domain** `indiaaibrief.com`
2. Add TXT at the apex (GoDaddy DNS today):

```
Type: TXT
Name: @
Value: google-site-verification=XXXXXXXX
```

HTML meta is still the launch path for this audit.

## 2. Submit sitemaps

After verification, submit these **www** URLs:

- `https://www.indiaaibrief.com/sitemap.xml`
- `https://www.indiaaibrief.com/news-sitemap.xml`
- `https://www.indiaaibrief.com/image-sitemap.xml`

## 3. Day-1 URL inspection

Request indexing for:

1. Homepage `/`
2. Top 5 articles
3. `/news`, `/explains`, `/playbooks`
4. `/kit/ai-compliance`
5. `/about`, `/contact`

## 4. Monitoring

- Coverage / Page indexing weekly
- Core Web Vitals (field data ~28 days)
- Manual actions / Security issues: should be empty
- Enable email notifications for critical issues

## 4b. How to read GSC “errors” (important)

### Page with redirect (apex / http hosts)

URLs like these are **expected** and should **not** be indexed:

- `http://indiaaibrief.com/`
- `https://indiaaibrief.com/`
- `http://www.indiaaibrief.com/`

They permanently redirect to `https://www.indiaaibrief.com/`. Google correctly labels them “Page with redirect.” **Do not** expect VALIDATE FIX to make those three URLs indexed — you want www only.

Validate instead with URL Inspection on the **canonical**:

`https://www.indiaaibrief.com/` → should be “URL is on Google” (or Request indexing).

To collapse `http://apex` from **2 hops → 1 hop** (optional polish):

```bash
# Vercel → Project → Settings → Domains → indiaaibrief.com → Redirect to www
# or:
$env:VERCEL_TOKEN='…'
node scripts/configure-www-redirect.mjs
```

### Discovered – currently not indexed

Means Google **knows** the URL (sitemap/links) but has **not crawled it yet**. On a young property this is normal for days–weeks. It is **not** a robots/block bug when:

- URL returns **200**
- `robots` meta is `index,follow`
- canonical is `https://www.indiaaibrief.com/...`
- URL appears in `/sitemap.xml`

What helps:

1. Keep publishing / earning links so crawl budget rises
2. Request indexing (URL Inspection) for 10–15 priority www URLs
3. Resubmit sitemaps after deploy
4. Run `npm run check:redirects` and `npm run indexnow` after ship

Do **not** click VALIDATE FIX on “Discovered” expecting an instant crawl — Google schedules crawls; validation only re-checks later.

## 5. After this remediation deploy

1. Deploy the Mode 1A remediation (sitemap `/authors`, footer Cookies, canonical frontmatter, home LCP tweaks)
2. Paste `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` if not already set
3. Complete steps 1–3 above
4. Re-run `npm run audit:perf -- https://www.indiaaibrief.com`
5. Optional: [Rich Results Test](https://search.google.com/test/rich-results) on one article URL

## 6. Bing IndexNow

Key file (Option 1 — site root):

```
https://www.indiaaibrief.com/e8fb5aa82fc64eef87da5bdcc606a150.txt
```

After deploy, submit priority URLs:

```bash
npm run indexnow
# or specific paths:
npm run indexnow -- /explains/india-ai-strategy-sovereign-safety
```

Set `INDEXNOW_KEY` on Vercel to match the filename (same value as the `.txt` body). Optional authenticated endpoint: `POST /api/indexnow` with `Authorization: Bearer $CRON_SECRET`.
