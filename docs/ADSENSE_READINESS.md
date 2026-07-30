# AdSense Readiness — IndiaAIBrief

**Do not place ads, publish `ads.txt`, or apply to AdSense until you deliberately decide to.**

Launch stance (2026-07-30): **AdSense-ready only** — policy/content/layout compliant; no live ad scripts; `/ads.txt` returns a clean **404** until approval.

CLAUDE.md target: consider display ads only after meaningful traffic (~100K monthly pageviews). Kit/audit products and newsletter are the primary monetization until then.

## Policy checklist (Phase 5.1)

- [x] 20–30+ original, substantial articles live (**41** MDX articles)
- [x] No thin / placeholder / lorem pages in public content
- [x] Clear navigation on all pages
- [x] About page with team + editorial standards
- [x] Contact page / email
- [x] Privacy (GDPR + DPDP), Terms, Cookies, Refund, Editorial, DMCA
- [x] Site live on HTTPS without password gate (`https://www.indiaaibrief.com`)
- [x] `/ads.txt` returns **404 text/plain** (not HTML soft-200) until approval
- [ ] No broken internal links — re-run `npm run audit:perf -- https://www.indiaaibrief.com` after each deploy
- [ ] Copyrighted images licensed / original (editorial responsibility)

## Reserved ad slots (code ready, inactive)

`components/content/ad-slot.tsx` reserves CLS-safe space:

| Slot | Placement | Size intent |
|------|-----------|-------------|
| `below-title` | Under article title (desktop) | 728×90 / 320×100 |
| `mid-article` | Optional mid-body | 300×250 |
| `below-article` | After article body | Responsive |
| `sidebar` | Desktop only (when layout adds sidebar) | 300×250 / 300×600 |

Label visible: **Advertisement**. Scripts stay out until approval. Production CSP does **not** allow `googlesyndication` yet — add domains only when wiring ads.

## After approval (not now)

1. Copy `public/ads.txt.example` → `public/ads.txt` (replace the 404 route)
2. Replace `pub-XXXXXXXXXXXXXXXX` with your publisher ID
3. Wire AdSense script via Partytown or deferred loader only
4. Extend CSP for AdSense domains
5. Map slots to AdSense ad unit IDs in `AdSlot`

## Application steps (future)

1. Complete checklist above + traffic threshold decision
2. AdSense → add `https://www.indiaaibrief.com`
3. Keep publishing during review; **no ads live** until approved
4. On approval: ads.txt + units + CSP update
