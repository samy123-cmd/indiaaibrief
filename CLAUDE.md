# indiaaibrief.com — Claude Build Specification
## v1.0 | 2026-07-24 | Performance-First AI Intelligence Platform for India

> **Read this entire document before writing a single line of code.**
> This is not a news site. This is an AI intelligence platform. Build it like one.

---

## 0. NON-NEGOTIABLES (Break Any = Project Failure)

1. **LCP < 2.5s on a ₹8,000 Android phone (3G throttled).** No exceptions. No "it works on my MacBook."
2. **Every article must contain 3+ elements no competitor can replicate.** Aggregation = death.
3. **Ship a monetizable product by Day 14.** Not Day 90. Day 14.
4. **88.29% of traffic is mobile.** Design mobile-first. Desktop is an afterthought.
5. **No third-party scripts that block render.** No chat widgets. No social embeds. No bloated analytics.
6. **Dark mode is standard, not optional.**
7. **All images WebP/AVIF with explicit width/height.** Zero layout shifts.
8. **Answer-first content structure.** Lead every article with 40-60 word direct answer.
9. **Structured data on every page.** NewsArticle, Organization, Person, BreadcrumbList, FAQPage.
10. **Build for AI citation (GEO), not just Google blue links.** Long, precise prompts. Task-based pages.

---

## 1. PROJECT IDENTITY

**Name:** indiaaibrief.com  
**Tagline:** *Indian AI intelligence for decision-makers.*  
**Positioning:** Not a news aggregator. An intelligence platform that helps Indian professionals, founders, and policymakers make better AI decisions faster.

**Target Audience (Primary):**
- Indian tech founders building AI products (Tier-1 and Tier-2 cities)
- CTOs/CIOs at Indian enterprises evaluating AI tools
- AI researchers and engineers in India
- Government officials tracking AI policy
- MSME owners exploring AI adoption

**Target Audience (Secondary):**
- Investors tracking Indian AI startups
- Students and career-switchers entering AI

**Content Promise:** Every piece answers: *"What is unique, exclusive, or genuinely helpful about this for India that no one else is telling me?"*

---

## 2. TECH STACK

### Core Architecture
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Framework | **Next.js 15+ (App Router)** | Server Components = zero JS on static pages. Edge runtime for India. |
| Language | **TypeScript** | Non-negotiable. |
| Styling | **Tailwind CSS v4** | Utility-first, purgeable, no unused CSS. |
| UI Components | **shadcn/ui** | Accessible, unstyled primitives. Custom theme only. |
| CMS | **MDX (local) + Sanity (headless)** | MDX for static content, Sanity for dynamic data (startup DB, tenders, jobs). |
| Database | **PostgreSQL (Neon/Supabase)** | For user data, subscriptions, startup tracker. |
| Search | **Algolia or Meilisearch** | Instant search for startup DB, policy tracker. |
| Auth | **Clerk or NextAuth** | Minimal, fast, secure. |
| Payments | **Razorpay** | India-native. UPI, cards, netbanking. |
| Hosting | **Vercel (Edge)** | Mumbai edge nodes. ISR for instant updates. |
| CDN | **Cloudflare** | Indian PoPs, Brotli, image optimization. |
| Analytics | **Plausible (self-hosted) or Fathom** | <1KB script. No Google Analytics bloat. |
| Newsletter | **Buttondown or Beehiiv API** | Simple, fast, API-driven. |
| Community | **Telegram Bot API** | Indian professionals live on Telegram, not Discord. |

### Performance Stack
- **Next.js Image Component** — automatic WebP/AVIF, responsive `srcset`, lazy loading
- **Vercel Edge Network** — cache everything static at Mumbai edge
- **Partytown** — offload third-party scripts to web worker (if any)
- **Brotli compression** at CDN level
- **Font optimization** — `next/font`, `font-display: optional`, subsetting

---

## 3. DESIGN SYSTEM

### Philosophy
**Performance-first minimalism.** Every pixel earns its place. No decoration. No bloat. Text communicates faster than images on news sites.

### Color Palette
```
Light Mode:
  Background: #FAFAFA (off-white, reduces eye strain)
  Surface: #FFFFFF
  Text Primary: #0A0A0A (near-black)
  Text Secondary: #525252 (neutral-600)
  Text Tertiary: #A3A3A3 (neutral-400)
  Accent: #DC2626 (Indian red — distinct, bold, memorable)
  Accent Hover: #B91C1C
  Border: #E5E5E5
  Success: #16A34A
  Warning: #EAB308

Dark Mode:
  Background: #0A0A0A
  Surface: #171717
  Text Primary: #FAFAFA
  Text Secondary: #A3A3A3
  Text Tertiary: #525252
  Accent: #F87171 (lighter red for dark)
  Accent Hover: #FCA5A5
  Border: #262626
```

### Typography
```
Headlines: Inter (variable) or Geist (Vercel's font)
  - H1: 32px/40px mobile, 48px/56px desktop, font-weight 800, letter-spacing -0.02em
  - H2: 24px/32px mobile, 36px/44px desktop, font-weight 700
  - H3: 20px/28px mobile, 24px/32px desktop, font-weight 600

Body: Inter (variable)
  - Body: 16px/28px, font-weight 400
  - Body Small: 14px/24px, font-weight 400
  - Caption: 12px/20px, font-weight 500, uppercase, letter-spacing 0.05em

Monospace: JetBrains Mono (for code snippets, data tables)
  - 14px/22px
```

**Font loading:**
- Use `next/font` with `font-display: optional`
- Preload only weights used above the fold
- System font stack as fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Spacing Scale
```
Base unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
```

### Component Specifications

**Article Card:**
- Thumbnail: 640x320px WebP, lazy loaded, explicit width/height
- Category badge: 12px uppercase, accent color
- Headline: H3, 2-line clamp
- Excerpt: 2-line clamp, text-secondary
- Meta: Author avatar (32px), name, date, read time
- Hover: subtle scale(1.01) + shadow lift (transform-only, no layout shift)

**Navigation:**
- Sticky top, 56px height mobile, 64px desktop
- Background: surface color with `backdrop-blur-md`
- Logo left, nav links center (hidden mobile), search + theme toggle + subscribe right
- Mobile: hamburger → full-screen overlay menu
- Tap targets: min 44x44px, 8px spacing

**Article Page:**
- Max content width: 680px (optimal reading line length)
- Hero image: 1200x630px WebP, above fold, explicit dimensions
- Breadcrumb: text-secondary, small caps
- Author block: avatar 48px, name, title, social link
- Share buttons: native Web Share API (no third-party widgets)
- Related articles: 3 cards, same category
- Newsletter CTA: inline after 50% scroll, sticky bottom on mobile

**Tables & Data:**
- Striped rows, monospace for numbers
- Horizontal scroll on mobile (not squished columns)
- Sortable headers where applicable

---

## 4. CONTENT ARCHITECTURE

### Content Types

| Type | Slug Pattern | Purpose | Frequency |
|------|-------------|---------|-----------|
| Breaking News | `/news/YYYY/MM/DD/slug` | Speed + SEO | Daily |
| Explainers | `/explains/slug` | AI citation bait | 3x/week |
| Comparisons | `/compares/slug` | Affiliate + GEO | 2x/week |
| Playbooks | `/playbooks/slug` | Product conversion | 1x/week |
| Original Data | `/data/slug` | Authority | Monthly |
| Startup Tracker | `/startups` | Database product | Continuous |
| Policy Tracker | `/policy` | Database product | Continuous |
| Newsletter Archive | `/newsletter/YYYY/MM/DD` | SEO + retention | Weekly |

### URL Structure Rules
- **Lowercase only.** Hyphens for spaces. No underscores.
- **Date in breaking news URLs** for chronological authority.
- **No date in evergreen content** (explainers, playbooks) — update in-place.
- **301 redirects** if URL must change. Never break links.

### Content Schema (Frontmatter)
```yaml
---
title: "string — max 60 chars, front-loaded keywords"
description: "string — max 160 chars, compelling CTA"
publishedAt: "ISO 8601"
modifiedAt: "ISO 8601"
author: "string — must match author slug"
category: "news | explains | compares | playbooks | data"
tags: ["array", "of", "strings"]
image: "/images/slug.webp"
imageAlt: "string — descriptive, keyword-rich"
featured: boolean
trending: boolean
readingTime: number
excerpt: "string — 150 chars max"
canonical: "string — if syndicated"
structuredData:
  type: "NewsArticle | Article | FAQPage"
  faq: [] # if FAQPage
---
```

### The "Answer-First" Content Structure (Mandatory)

Every article MUST follow this exact structure:

```
1. DIRECT ANSWER BLOCK (40-60 words)
   - Bold, distinct background (surface color)
   - Answers the query in first sentence
   - This is what AI Overviews will cite

2. CONTEXT PARAGRAPH (1-2 sentences)
   - Why this matters to India specifically
   - Connect to reader's immediate reality

3. H2: "What Changed" or "Why It Matters"
   - Scannable bullet points
   - No walls of text

4. H2: "The Details"
   - Main body, chunked into 3-4 sentence paragraphs
   - Internal links to related content

5. H2: "What This Means for [Audience]"
   - Specific implications for Indian founders/CTOs/MSMEs
   - Actionable takeaways

6. H2: "Frequently Asked Questions"
   - 3-5 questions with concise answers
   - FAQPage schema applied

7. AUTHOR BLOCK
   - Photo, name, credentials, social proof
   - "Follow [Name] for [specific topic]"
```

### Internal Linking Rules
- **Minimum 3 internal links per article.**
- Anchor text must be descriptive ("Indian AI policy 2026" not "click here").
- Link to pillar content from every article.
- Topic clusters: every article in a cluster links to every other article in that cluster.

---

## 5. SEO & GEO SPECIFICATIONS

### On-Page SEO (Non-Negotiable)

**Meta Tags:**
```html
<title>Primary Keyword — Secondary Keyword | IndiaAIBrief</title>
<meta name="description" content="Compelling 150-160 char description with CTA">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="absolute-url">
```

**Open Graph:**
```html
<meta property="og:title" content="title">
<meta property="og:description" content="description">
<meta property="og:image" content="1200x630 image URL">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="article">
<meta property="article:published_time" content="ISO date">
<meta property="article:modified_time" content="ISO date">
<meta property="article:author" content="author url">
<meta property="article:section" content="category">
```

**Twitter Card:**
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="title">
<meta name="twitter:description" content="description">
<meta name="twitter:image" content="1200x630 image URL">
```

### Structured Data (JSON-LD, Every Page)

**NewsArticle Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Title max 110 chars",
  "description": "Meta description",
  "image": ["1200x630 url", "800x600 url"],
  "datePublished": "ISO",
  "dateModified": "ISO",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "author page",
    "jobTitle": "Title",
    "worksFor": {
      "@type": "Organization",
      "name": "IndiaAIBrief"
    }
  },
  "publisher": {
    "@type": "Organization",
    "name": "IndiaAIBrief",
    "logo": {
      "@type": "ImageObject",
      "url": "logo url"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "article url"
  }
}
```

**Organization Schema (Homepage):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "IndiaAIBrief",
  "url": "https://indiaaibrief.com",
  "logo": "logo url",
  "sameAs": ["twitter", "linkedin", "telegram"],
  "description": "Indian AI intelligence for decision-makers"
}
```

**BreadcrumbList Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://indiaaibrief.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category",
      "item": "category url"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Article Title",
      "item": "article url"
    }
  ]
}
```

**FAQPage Schema (When Applicable):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text."
      }
    }
  ]
}
```

### GEO (Generative Engine Optimization)

**Target Prompt Patterns:**
- "Which Indian AI tool for [use case] is [compliance] ready under ₹[price]?"
- "How to implement [AI tech] for Indian [industry] MSMEs"
- "Latest Indian AI policy changes [month] [year]"
- "[Startup A] vs [Startup B] for [use case] in India"
- "AI compliance checklist for Indian [sector]"

**GEO Tactics:**
- Lead with direct answer (40-60 words) — this gets cited
- Use question-based H2s that mirror real search prompts
- Create comparison tables with clear winners
- Include "copy-ready" assets (checklists, templates, code snippets)
- Ensure all content is crawlable by GPTBot, PerplexityBot, Google-Extended
- **Do NOT block AI crawlers in robots.txt** — this is suicide in 2026

### robots.txt
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://indiaaibrief.com/sitemap.xml
```

### Sitemap Strategy
- **Primary sitemap:** `/sitemap.xml` — all pages, max 50K URLs
- **News sitemap:** `/news-sitemap.xml` — articles from last 48 hours (for Google News)
- **Image sitemap:** `/image-sitemap.xml` — all images with captions
- **Auto-generated:** On build + ISR revalidation

---

## 6. PERFORMANCE SPECIFICATIONS

### Core Web Vitals Targets
| Metric | Target | Fail Line | Measurement |
|--------|--------|-----------|-------------|
| LCP | < 2.0s | > 2.5s | Mobile, 3G throttled |
| INP | < 150ms | > 200ms | Mobile, real interactions |
| CLS | < 0.05 | > 0.1 | All devices |
| TTFB | < 400ms | > 600ms | Mumbai edge |
| FCP | < 1.5s | > 2.0s | Mobile |
| TBT | < 200ms | > 300ms | Mobile |

### Image Optimization Rules
1. **Format:** WebP primary, AVIF for browsers that support it
2. **Sizing:** 
   - Hero: 1200x630 (desktop), 800x420 (mobile)
   - Card thumbs: 640x320
   - Author avatars: 96x96
3. **Loading:** `loading="lazy"` for below-fold, `eager` for hero only
4. **Dimensions:** ALWAYS specify `width` and `height` in HTML
5. **Quality:** 75-80% for photos, 90% for screenshots with text
6. **CDN:** Cloudflare Polish or Vercel Edge optimization

### JavaScript Rules
1. **Zero client-side JS on static pages.** Use React Server Components.
2. **Hydrate only interactive elements:** search, theme toggle, newsletter form.
3. **Defer all non-critical scripts:** analytics, third-party anything.
4. **Bundle size budget:** < 100KB gzipped for initial JS on any page.
5. **No jQuery. No Lodash. No Moment.** Native or lightweight alternatives only.

### CSS Rules
1. **Critical CSS inlined** for above-the-fold content.
2. **Remaining CSS loaded asynchronously** or via `media="print"` swap.
3. **Purge unused Tailwind classes** — target < 15KB gzipped CSS.
4. **No @import in CSS.** Use `next/font` and link tags.
5. **Containment:** Use `content-visibility: auto` for below-fold sections.

### Font Rules
1. **Variable fonts only** (Inter Variable, Geist).
2. **Preload only weights used above fold** (usually 400, 600, 700).
3. **`font-display: optional`** — if font doesn't load in 100ms, use fallback. No FOUT.
4. **Subsetting:** Latin + Devanagari only. No Cyrillic, no CJK.

### Caching Strategy
```
Static assets (JS, CSS, fonts): 1 year, immutable
Images: 1 year, immutable (versioned filenames)
HTML pages: ISR, revalidate 60s (news), 1 day (evergreen)
API routes: 5 minutes (startup data), 1 hour (policy data)
```

### Performance Monitoring
- **Google Search Console:** Core Web Vitals report, weekly review
- **PageSpeed Insights:** Test every page before deploy
- **WebPageTest:** Mumbai, 3G Fast, Moto G4
- **Real User Monitoring (RUM):** Vercel Analytics or Cloudflare Web Analytics
- **Budget CI:** Fail build if Lighthouse score < 95 on mobile

---

## 7. MONETIZATION ARCHITECTURE

### Revenue Stack (Launch to Scale)

**Phase 1: Days 1-14 (Immediate)**
- **Digital Product #1:** "AI Compliance Starter Kit for Indian MSMEs" — ₹999
  - PDF + Notion template + checklist
  - Sold via Razorpay, delivered via email
  - Promoted in article CTAs and dedicated landing page

**Phase 2: Days 15-30**
- **Productized Service:** "AI Readiness Audit — 47-Point Scorecard" — ₹4,999
  - Notion form → manual audit → PDF report
  - 3-day turnaround
  - Promoted in playbook articles

**Phase 3: Days 31-60**
- **Affiliate Revenue:** AI tool comparisons with affiliate links
  - Only tools with India presence and support
  - Disclose clearly: "We may earn a commission..."
  - Track via UTM + internal attribution

**Phase 4: Days 61-90**
- **Paid Newsletter:** "The Brief" — ₹299/month or ₹2,999/year
  - Weekly insider analysis, exclusive data, early access
  - Metered freemium: 3 free articles/month, then paywall
  - Managed via Buttondown API + Razorpay

**Phase 5: Month 4+**
- **Sponsorships:** Native sponsored briefs (clearly labeled)
  - Only AI companies with Indian operations
  - No banner ads. Sponsored content only.
- **Display Ads (AdSense):** Only after 100K monthly pageviews
  - Static ad slots reserved in layout (no CLS)
  - Expected: ₹5K-15K/month at 100K views (coffee money)

### Subscription Tiers
| Tier | Price | Benefits |
|------|-------|----------|
| **Free** | ₹0 | 3 articles/month, newsletter, community access |
| **Brief** | ₹299/mo | Unlimited articles, weekly insider brief, comment access |
| **Intelligence** | ₹999/mo | Everything + monthly 1:1 call + exclusive data downloads |

### Payment Flow
1. User clicks "Subscribe" → Razorpay checkout
2. Success → Webhook updates user role in DB
3. Immediate access unlock
4. Invoice emailed automatically
5. Renewal reminder 3 days before expiry

---

## 8. FEATURES & PAGES

### MVP Pages (Launch Day)

**1. Homepage (`/`)**
- Hero: "Indian AI intelligence for decision-makers" + newsletter CTA
- Trending section: 3-5 breaking news cards
- Latest section: 6 article cards, paginated
- Featured playbook CTA
- Startup tracker preview (top 5 recent)
- Newsletter signup (sticky bottom on mobile)
- Footer: categories, about, contact, legal

**2. Article Page (`/[category]/[slug]`)**
- Breadcrumb navigation
- Hero image + title + meta (author, date, read time)
- Share buttons (Web Share API)
- Article body (Answer-first structure)
- Author block
- Related articles (3 cards)
- Newsletter CTA (inline after 50% scroll)
- Comments (optional, Phase 2)

**3. Category Pages (`/news`, `/explains`, `/compares`, `/playbooks`)**
- Category description + SEO text
- Filterable article grid
- Pagination or infinite scroll (performance-tested)

**4. Startup Tracker (`/startups`)**
- Searchable, filterable database
- Filters: city, sector, funding stage, last funding date
- Cards: logo, name, sector, city, last funding, quick stats
- Detail page: full profile, funding history, news mentions
- **This is a product, not a page.** Gate advanced filters for subscribers.

**5. Policy Tracker (`/policy`)**
- Timeline of Indian AI policy changes
- Filter by: central government, state, sector
- Searchable full text
- Downloadable PDF summaries (gated)

**6. Newsletter Archive (`/newsletter`)**
- All past newsletters, searchable
- Subscribe CTA prominent
- Social proof: subscriber count (when >1000)

**7. About (`/about`)**
- Mission statement
- Editorial policy (fact-checking, corrections, ethics)
- Team (with credentials)
- Contact
- Press kit

**8. Landing Pages (Product)**
- `/kit/ai-compliance` — Digital product
- `/audit/ai-readiness` — Productized service
- `/subscribe` — Subscription tiers

### Phase 2 Features (Month 2-3)
- **Search:** Algolia-powered instant search across all content
- **Comments:** Lightweight system (not Disqus — too heavy)
- **Bookmarks:** Save articles for later (requires auth)
- **Dark mode toggle:** System preference + manual override
- **RSS feeds:** Per category + master feed
- **API:** JSON API for startup/policy data (future integrations)

### Phase 3 Features (Month 4+)
- **AI-powered search:** Natural language queries over all content
- **Custom alerts:** "Notify me when [startup] raises funding"
- **Mobile app:** PWA first, native later if justified
- **Podcast:** "The Brief" audio version
- **Events:** Virtual roundtables for subscribers

---

## 9. CONTENT WORKFLOW

### The AI + Human Production System

**Monday — Strategy & Brief (Human, 90 mins)**
1. Review Search Console: queries with impressions but low CTR
2. Check Google Trends, Twitter/X India AI conversations, Telegram community
3. Write strategic brief per article:
   - Target query/prompt
   - Content gap (what competitors miss)
   - Unique angle (India-specific, original data, contrarian take)
   - Irreplaceable data sources
   - Monetization hook (product CTA, affiliate, subscription)

**Tuesday — AI Draft + Fact-Check (AI + Human, 2 hrs)**
1. Feed brief to AI (Claude/GPT-4) with specific persona: "You are a senior tech journalist covering Indian AI. Write in the voice of [editor name]. Be direct, no fluff, India-first."
2. AI produces structural outline + first draft
3. Human fact-checks EVERY claim against primary sources
4. Verify: dates, funding amounts, policy references, quotes

**Wednesday — Human Enrichment (Human, 2-3 hrs)**
1. Add firsthand experience narrative
2. Pull original data points (crunch numbers, create charts)
3. Write or source expert quotes (reach out if needed)
4. Insert the contrarian take: "But here's what others won't tell you..."
5. Rewrite intro and conclusion in brand voice
6. Ensure 3+ irreplaceable elements per article

**Thursday — GEO Structuring (AI + Human, 1 hr)**
1. Format answer-first block
2. Add question-based H2s/H3s
3. Insert FAQ section with schema
4. Add internal links (min 3)
5. Optimize meta title/description
6. Add Open Graph image (1200x630)

**Friday — Publish + Promote (Human, 1 hr)**
1. Final proofread
2. Publish + verify structured data in Google's Rich Results Test
3. Share on Twitter/X, LinkedIn, Telegram community
4. Email newsletter subscribers
5. Schedule social media reshares for next week

### Content Calendar (Weekly)
| Day | Content Type | Example |
|-----|-------------|---------|
| Mon | Breaking News | "MeitY releases new AI governance framework" |
| Tue | Explainer | "How India's DPDP Act affects AI training data" |
| Wed | Comparison | "Sarvam AI vs Krutrim: Which LLM for Hindi enterprise apps?" |
| Thu | Playbook | "Deploying AI chatbots for Indian e-commerce: 12-step checklist" |
| Fri | Data/Analysis | "Q2 2026 Indian AI funding: ₹2,400Cr across 34 deals" |
| Sat | Newsletter | "The Brief: This week in Indian AI" |
| Sun | Community | Telegram AMA or curated reading list |

---

## 10. AUTH & USER MANAGEMENT

### Auth Flow
- **Sign up:** Email + password OR Google OAuth (Clerk)
- **Free tier:** Immediate access, no card required
- **Paid tier:** Razorpay checkout, webhook unlocks role
- **Password reset:** Standard email flow

### User Roles
| Role | Permissions |
|------|------------|
| **Guest** | 3 articles/month, no comments, no bookmarks |
| **Subscriber (Free)** | Newsletter, community access, comments |
| **Brief** | Unlimited articles, bookmarks, comments, weekly brief |
| **Intelligence** | Everything + downloads + 1:1 monthly call |
| **Admin** | Content management, user management, analytics |

### Paywall Logic
- **Metered:** Count article views in cookie/localStorage + DB
- **Show paywall after 3rd article view in 30 days**
- **Paywall design:** Blur content below fold + CTA to subscribe
- **SEO-friendly:** Full content in HTML for crawlers, paywall via JS for humans

---

## 11. ANALYTICS & MEASUREMENT

### Key Metrics (Weekly Review)

**Traffic:**
- Total pageviews
- Unique visitors
- Traffic source breakdown (organic, direct, social, referral)
- Top 10 articles by pageviews
- Bounce rate by device

**Engagement:**
- Average time on page (target: >3 min for playbooks, >1 min for news)
- Scroll depth (target: >70% for explainers)
- Newsletter open rate (target: >35%)
- Newsletter click rate (target: >5%)
- Community growth (Telegram members)

**SEO:**
- Organic impressions (Search Console)
- Organic clicks
- Average position for target keywords
- Core Web Vitals status
- Indexed pages count

**Revenue:**
- Digital product sales
- Service bookings
- Affiliate clicks + conversions
- Subscription signups
- MRR (Monthly Recurring Revenue)
- Churn rate (target: <5% monthly)

**Content:**
- Articles published per week
- Average time to publish
- AI citation tracking (manual: search ChatGPT/Perplexity for your content)

### Tools
- **Plausible Analytics:** Traffic, sources, content performance (<1KB script)
- **Google Search Console:** SEO metrics, Core Web Vitals
- **Buttondown:** Newsletter analytics
- **Razorpay Dashboard:** Revenue, churn, payment failures
- **Telegram Analytics:** Community growth, engagement
- **Custom Dashboard:** Build a simple admin dashboard combining key metrics

---

## 12. SECURITY & LEGAL

### Security Requirements
- **HTTPS only.** HSTS header. No mixed content.
- **Content Security Policy (CSP):** Strict, report-only first, then enforce.
- **Rate limiting:** API routes, login attempts, newsletter signups.
- **Input sanitization:** All user inputs, MDX content.
- **Database:** Row-level security (Supabase/Neon), encrypted at rest.
- **Secrets:** Environment variables only. Never commit API keys.

### Legal Pages (Required)
- **Privacy Policy:** GDPR-compliant, India DPDP Act compliant
- **Terms of Service:** Clear user rights, subscription terms
- **Cookie Policy:** Minimal cookies (Plausible is cookie-less)
- **Editorial Policy:** Fact-checking standards, correction process, ethics
- **DMCA/Content Removal:** Process for takedown requests
- **Refund Policy:** 7-day refund for digital products, no refund for subscriptions after access

---

## 13. DEPLOYMENT & DEVOPS

### Development Workflow
1. **Local:** `next dev` with strict TypeScript
2. **Staging:** Vercel preview deployments on every PR
3. **Production:** Vercel production, auto-deploy from `main` branch
4. **Branch protection:** Require PR review + CI pass before merge

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
- Lint (ESLint + Prettier)
- Type check (tsc --noEmit)
- Build (next build)
- Lighthouse CI (mobile, performance > 95)
- Security audit (npm audit)
```

### Pre-Launch Checklist
- [ ] All pages pass Lighthouse 95+ on mobile
- [ ] All pages pass Core Web Vitals (Search Console)
- [ ] Structured data validates in Google's Rich Results Test
- [ ] robots.txt allows AI crawlers
- [ ] Sitemap submitted to Google Search Console
- [ ] Google News application submitted (if applicable)
- [ ] Razorpay integration tested (sandbox + live)
- [ ] Newsletter signup tested end-to-end
- [ ] Dark mode works on all pages
- [ ] All images have alt text and explicit dimensions
- [ ] 404 page designed and functional
- [ ] Legal pages published
- [ ] Analytics tracking verified
- [ ] Backup strategy in place (database, content)

---

## 14. 90-DAY BUILD ROADMAP

### Month 1: Foundation (Days 1-30)

**Week 1: Core Setup**
- [ ] Initialize Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Set up Vercel project with Edge runtime
- [ ] Configure Cloudflare CDN + DNS
- [ ] Set up PostgreSQL (Neon/Supabase)
- [ ] Set up Sanity CMS for dynamic data
- [ ] Configure CI/CD pipeline
- [ ] Set up Plausible analytics

**Week 2: Design System**
- [ ] Implement color palette (light + dark mode)
- [ ] Set up typography (Inter Variable, JetBrains Mono)
- [ ] Build component library (buttons, cards, inputs, badges)
- [ ] Build layout components (nav, footer, sidebar)
- [ ] Implement theme toggle with persistence
- [ ] Performance audit: target < 100KB initial JS

**Week 3: Content Architecture**
- [ ] Set up MDX processing with frontmatter
- [ ] Build article page template (answer-first structure)
- [ ] Build category pages
- [ ] Build homepage with all sections
- [ ] Implement internal linking system
- [ ] Set up sitemap generation

**Week 4: SEO & Structured Data**
- [ ] Implement all meta tags (Open Graph, Twitter)
- [ ] Implement JSON-LD schemas (NewsArticle, Organization, Breadcrumb, FAQ)
- [ ] Set up Google Search Console
- [ ] Submit sitemap
- [ ] Test structured data in Rich Results Test
- [ ] Write and publish 5 pillar articles with original angle

### Month 2: Products & Monetization (Days 31-60)

**Week 5: Auth & Paywall**
- [ ] Integrate Clerk/NextAuth
- [ ] Build user roles and permissions
- [ ] Implement metered paywall (3 articles/month)
- [ ] Build subscription page with Razorpay
- [ ] Test payment flow end-to-end
- [ ] Build user dashboard

**Week 6: Digital Product #1**
- [ ] Create "AI Compliance Starter Kit for Indian MSMEs"
- [ ] Build product landing page
- [ ] Integrate Razorpay for one-time purchase
- [ ] Set up digital delivery (email + download page)
- [ ] Add CTA to relevant articles

**Week 7: Productized Service**
- [ ] Create "AI Readiness Audit" offer
- [ ] Build intake form (Notion or custom)
- [ ] Build service landing page
- [ ] Set up booking/payment flow
- [ ] Create deliverable template (PDF report)

**Week 8: Newsletter & Community**
- [ ] Integrate Buttondown API
- [ ] Build newsletter signup (inline + sticky)
- [ ] Set up weekly newsletter template
- [ ] Create Telegram community
- [ ] Build newsletter archive page
- [ ] Launch to existing network

### Month 3: Scale & Optimize (Days 61-90)

**Week 9: Search & Discovery**
- [ ] Integrate Algolia/Meilisearch
- [ ] Build search UI (command palette + full page)
- [ ] Implement filters on category pages
- [ ] Build "Related Articles" algorithm
- [ ] Add bookmark functionality

**Week 10: Data Products**
- [ ] Build Startup Tracker (searchable database)
- [ ] Build Policy Tracker (timeline + search)
- [ ] Gate advanced features for subscribers
- [ ] Add data export for Intelligence tier

**Week 11: Content Engine**
- [ ] Publish 3x/week consistently
- [ ] Launch first original data piece
- [ ] Build content calendar system
- [ ] Train any assistants on the AI+Human workflow
- [ ] Start affiliate program (apply to programs)

**Week 12: Analytics & Iteration**
- [ ] Build custom admin dashboard
- [ ] Review all metrics from Month 1-2
- [ ] Double down on top-performing content types
- [ ] Kill underperforming features
- [ ] Plan Month 4 roadmap
- [ ] Celebrate first revenue

---

## 15. FILE STRUCTURE

```
indiaaibrief/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── subscribe/page.tsx
│   │   └── layout.tsx
│   ├── (content)/                # Content pages
│   │   ├── news/
│   │   │   ├── page.tsx          # News listing
│   │   │   └── [slug]/page.tsx   # Article page
│   │   ├── explains/
│   │   ├── compares/
│   │   ├── playbooks/
│   │   └── data/
│   ├── (products)/               # Product pages
│   │   ├── kit/
│   │   │   └── [slug]/page.tsx
│   │   └── audit/
│   │       └── page.tsx
│   ├── (dashboard)/              # User dashboard (auth required)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── bookmarks/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── payments/
│   │   ├── newsletter/
│   │   └── search/
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── sitemap.ts
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Nav, footer, sidebar
│   ├── content/                  # Article cards, grids
│   ├── products/                 # Product CTAs, pricing
│   └── analytics/                # Plausible wrapper
├── content/                      # MDX content (Git-managed)
│   ├── news/
│   ├── explains/
│   ├── compares/
│   └── playbooks/
├── lib/
│   ├── utils.ts
│   ├── seo.ts                    # Meta tag helpers
│   ├── schema.ts                 # JSON-LD generators
│   ├── auth.ts
│   └── payments.ts
├── types/
│   └── index.ts
├── public/
│   ├── images/
│   │   ├── authors/
│   │   ├── articles/
│   │   └── products/
│   └── fonts/
├── sanity/                       # Sanity schema & client
├── styles/
│   └── prose.css                 # Article typography overrides
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 16. DECISION LOG (Why We Chose This)

| Decision | Alternative | Why This Wins |
|----------|------------|---------------|
| Next.js App Router | WordPress/Ghost | Server Components = zero JS on static pages. Performance is non-negotiable. |
| MDX + Sanity | Pure headless CMS | MDX for version-controlled content, Sanity for dynamic data. Best of both. |
| Tailwind + shadcn | Bootstrap/MUI | Purgeable, no unused CSS. shadcn = accessible primitives without bloat. |
| Plausible | Google Analytics | <1KB, no cookies, privacy-compliant. Performance > data depth at this stage. |
| Razorpay | Stripe | India-native. UPI support is non-negotiable for Indian audience. |
| Telegram | Discord/Slack | Indian professionals live on Telegram. Lower friction. |
| No comments (Phase 1) | Disqus/Commento | Third-party scripts kill performance. Build lightweight custom later. |
| Metered paywall | Hard paywall | SEO-friendly (crawlers see full content), user-friendly (sample before buy). |

---

## 17. ANTI-PATTERNS (DO NOT DO THESE)

- ❌ **Video backgrounds** — kills LCP, adds zero value
- ❌ **3D elements or heavy animations** — not a gaming site
- ❌ **Parallax scrolling** — confuses mobile users, hurts performance
- ❌ **Pop-ups, interstitials, modal newsletters** — Google penalizes, users hate
- ❌ **Auto-playing audio/video** — instant bounce
- ❌ **Social media embeds** — load external JS, kill performance
- ❌ **Chat widgets (Intercom, Drift)** — 200KB+ of blocking JS
- ❌ **Cookie consent banners** — Plausible is cookie-less, no banner needed
- ❌ **jQuery, Lodash, Moment** — native alternatives exist
- ❌ **Google Fonts CDN** — use `next/font` for zero external requests
- ❌ **Unoptimized hero images** — must be WebP/AVIF, sized correctly
- ❌ **Generic stock photos** — use data visualizations, screenshots, original photography only
- ❌ **"Read more" buttons that load content** — hurts SEO, bad UX. Paginate or infinite scroll properly.
- ❌ **Blocking AI crawlers** — this is suicide in 2026
- ❌ **Aggregating without adding value** — you will fail an 11th time

---

## 18. SUCCESS CRITERIA (90-Day Checkpoints)

**Day 30:**
- [ ] Site live with < 2.5s LCP on mobile
- [ ] 10 pillar articles published (original angle, not aggregated)
- [ ] Newsletter with 100+ subscribers
- [ ] Telegram community with 50+ members
- [ ] First digital product live and selling

**Day 60:**
- [ ] 30+ articles published
- [ ] 1,000+ email subscribers
- [ ] 500+ Telegram members
- [ ] First ₹10,000 in revenue
- [ ] Google Search Console showing organic impressions

**Day 90:**
- [ ] 50+ articles published
- [ ] 2,500+ email subscribers
- [ ] 1,000+ Telegram members
- [ ] ₹50,000+ total revenue
- [ ] 10+ articles cited in AI Overviews/Perplexity
- [ ] Clear content-type winner identified (double down)
- [ ] Decision: continue, pivot, or kill based on data

---

## 19. EMERGENCY CONTACTS & RESOURCES

**When stuck on performance:**
- web.dev/measure
- PageSpeed Insights
- WebPageTest (Mumbai, 3G)
- Vercel Analytics

**When stuck on SEO:**
- Google Search Console
- Rich Results Test
- Schema.org validator
- Ahrefs/SEMrush (free tier)

**When stuck on content:**
- Answer the Public (question research)
- Google Trends India
- Twitter/X advanced search (India AI conversations)
- Your Telegram community (ask them what they need)

**When stuck on monetization:**
- Razorpay docs
- Buttondown docs
- Indie Hackers (revenue stories)
- Your own analytics (what content drives product sales?)

---

## 20. FINAL REMINDER

> **You have failed 10 times. This is your 11th attempt. The market doesn't care about your effort. It cares about your output.**

Build fast. Ship faster. Measure everything. Kill what doesn't work. Double down on what does. Do not get emotionally attached to features. Do not chase vanity metrics. Do not build what you think is cool — build what your audience pays for.

**The difference between failure #10 and success #1 is execution discipline. This document is your discipline. Follow it.**

---

*Document version: 1.0*  
*Last updated: 2026-07-24*  
*Next review: 2026-08-24*
