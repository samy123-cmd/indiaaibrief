# Pre-Launch Checklist — IndiaAIBrief

Internal runbook. Do not publish this page publicly until launch day ops are done.

## Technical SEO

- [x] `robots.ts` allows AI crawlers; blocks `/dashboard/`, `/api/`, `/_next/`
- [x] Main sitemap (`/sitemap.xml`)
- [x] News sitemap (`/news-sitemap.xml`) — last 48h
- [x] Image sitemap (`/image-sitemap.xml`)
- [x] Canonicals via `buildMetadata`
- [x] Pagination: unique titles + self-canonical `?page=N`
- [x] Trailing slash: `false` + 301 consistency (Next config)
- [x] Custom 404 with `noindex`

## Structured data

- [x] Organization + WebSite (SearchAction) on layout
- [x] NewsArticle + BreadcrumbList + Person + FAQ on articles
- [x] Product schema on kit pages
- [x] Person schema on author pages
- [ ] Validate sample URLs in [Rich Results Test](https://search.google.com/test/rich-results)

## Meta & social

- [x] Open Graph + Twitter cards
- [x] `theme-color`, PWA-ish apple meta, publisher
- [x] Share buttons: Web Share API + X / LinkedIn / WhatsApp / Telegram / copy
- [x] Unique 1200×630 OG images per article (run `npm run generate:og`)

## Performance & security

- [x] Security headers + CSP in `next.config.ts`
- [x] `font-display: optional`, Inter variable weights limited
- [x] Skip-to-content link
- [x] `prefers-reduced-motion` respected
- [x] Reserved AdSlot components (no ad scripts until AdSense approval)
- [ ] Run `npm run audit:perf` against production URL
- [ ] Lighthouse mobile ≥ 95 on home, article, category, product

## Legal & AdSense readiness

- [x] Privacy, Terms, Cookies, Refund, Editorial, DMCA
- [x] About + Contact
- [ ] ≥ 20 original articles before AdSense apply
- [ ] AdSense approval → then `public/ads.txt` + live ad code

## GSC & analytics

- [ ] Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (see `docs/GOOGLE_SEARCH_CONSOLE.md`)
- [ ] Submit sitemaps
- [ ] Plausible domain live
- [ ] Bing Webmaster Tools sitemap submit

## Build

```bash
npm run typecheck
npm run lint
npm run build
npm run audit:perf
```

## Day-1 post-launch

See Phase 16 in `polish-perfection-prompt.txt` (sitemap submit, indexing requests, social announce, monitor errors).
