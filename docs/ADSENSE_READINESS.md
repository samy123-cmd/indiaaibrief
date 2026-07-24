# AdSense Readiness — IndiaAIBrief

**Do not place ads or publish `ads.txt` until Google AdSense approves the site.**

## Policy checklist (Phase 5.1)

- [ ] 20–30+ original, substantial articles live
- [ ] No thin / placeholder / lorem pages
- [ ] No copyrighted images without license
- [ ] Clear navigation on all pages
- [x] About page with team + editorial standards
- [x] Contact page / email
- [x] Privacy (GDPR + DPDP), Terms, Cookies, Refund, Editorial, DMCA
- [ ] No broken internal links (`npm run audit:perf` + manual crawl)
- [ ] Site live on HTTPS without password gate

## Reserved ad slots (code ready, inactive)

`components/content/ad-slot.tsx` reserves CLS-safe space:

| Slot | Placement | Size intent |
|------|-----------|-------------|
| `below-title` | Under article title (desktop) | 728×90 / 320×100 |
| `mid-article` | Optional mid-body | 300×250 |
| `below-article` | After article body | Responsive |
| `sidebar` | Desktop only (when layout adds sidebar) | 300×250 / 300×600 |

Label visible: **Advertisement**. Scripts stay out until approval.

## After approval

1. Copy `public/ads.txt.example` → `public/ads.txt`
2. Replace `pub-XXXXXXXXXXXXXXXX` with your publisher ID
3. Wire AdSense script via Partytown or deferred loader only
4. Map slots to AdSense ad unit IDs in `AdSlot`

## Application steps

1. Complete checklist above
2. AdSense → add `https://indiaaibrief.com`
3. Temporary verification meta via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` or AdSense snippet
4. Keep publishing during review; **no ads live**
5. On approval: ads.txt + units
