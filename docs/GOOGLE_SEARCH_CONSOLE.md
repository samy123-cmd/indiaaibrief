# Google Search Console — IndiaAIBrief

Canonical host is **`https://www.indiaaibrief.com`**. Apex (`indiaaibrief.com`) permanently redirects to www.

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
