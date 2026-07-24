# IndiaAIBrief

Performance-first AI intelligence platform for Indian decision-makers.

## Stack (Week 1 scaffold)

- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn-style UI primitives
- Clerk auth, Razorpay payments, Neon Postgres, Sanity, Meilisearch, Buttondown, Plausible

## Quick start

```bash
cp .env.example .env.local
# Fill Clerk, Neon, Razorpay, Buttondown, Sanity, Meilisearch, Plausible keys
npm install
npm run dev
```

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Spec

See `CLAUDE.md` for non-negotiables, design system, and 90-day roadmap.
