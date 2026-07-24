# Google Search Console — IndiaAIBrief

## 1. Add property

1. Open [Google Search Console](https://search.google.com/search-console)
2. Add property: **Domain** `indiaaibrief.com` (preferred) or URL prefix `https://indiaaibrief.com`
3. Prefer **DNS TXT** verification via Cloudflare

### DNS verification (domain property)

Add a TXT record at the apex:

```
Type: TXT
Name: @
Value: google-site-verification=XXXXXXXX (from GSC)
```

### HTML meta verification (URL-prefix fallback)

1. Copy the verification token from GSC
2. Set in Vercel / `.env.local`:

```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_token_here
```

3. Redeploy — `buildMetadata` injects `<meta name="google-site-verification" …>` site-wide

## 2. Submit sitemaps

After verification, submit:

- `https://indiaaibrief.com/sitemap.xml`
- `https://indiaaibrief.com/news-sitemap.xml`
- `https://indiaaibrief.com/image-sitemap.xml`

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
