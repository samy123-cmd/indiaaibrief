import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/content/newsletter-form";
import { IndiaPulseStrip } from "@/components/content/india-pulse-strip";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { WHY_INDIA_STATS } from "@/lib/india-figures";
import { SITE, SITE_TAGLINE, buildMetadata } from "@/lib/seo";
import { organizationSchema, personSchema } from "@/lib/schema";
import { TEAM } from "@/lib/team";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "About IndiaAIBrief — Editorial Team & Mission",
  description:
    "IndiaAIBrief is an AI intelligence platform for Indian decision-makers. Mission, Why India, editorial standards, and team.",
  path: "/about",
});

const PRODUCTS = [
  {
    label: "01",
    title: "Breaking news & explainers",
    body: "Answer-first briefs on MeitY policy, funding, and product moves — India context in the first screen.",
    href: "/news",
    cta: "Latest news →",
  },
  {
    label: "02",
    title: "Comparisons & playbooks",
    body: "Vendor decisions and implementation checklists with INR pricing, DPDP fit, and MSME realities.",
    href: "/playbooks",
    cta: "Browse playbooks →",
  },
  {
    label: "03",
    title: "Data & trackers",
    body: "Original figures, Startup Tracker, and Policy Tracker — products, not roundups.",
    href: "/data/ai-in-india-market-statistics-2026",
    cta: "Open stats hub →",
  },
] as const;

const PRINCIPLES = [
  {
    n: "01",
    title: "Independence first",
    body: "No pay-for-play coverage. Sponsored briefs are labeled. Editorial follows what matters for Indian decision-makers — not who pays.",
  },
  {
    n: "02",
    title: "Primary sources",
    body: "Hard numbers link to government PDFs, filings, or official pages. Secondary press is context only.",
  },
  {
    n: "03",
    title: "India first",
    body: "Every piece answers what is unique for India — compliance, language, pricing, talent, and policy.",
  },
  {
    n: "04",
    title: "Correction policy",
    body: "Material errors corrected in-place within 48 hours, with a visible note and updated modifiedAt.",
  },
  {
    n: "05",
    title: "No hype",
    body: "Breakthroughs are breakthroughs. Demos are demos. Readers are technical enough for the difference.",
  },
  {
    n: "06",
    title: "Actionable",
    body: "Not just what happened — what founders, CTOs, and MSMEs should do next week.",
  },
] as const;

const CONTACTS = [
  {
    label: "Editorial & tips",
    href: `mailto:${SITE.editorialEmail}`,
    value: SITE.editorialEmail,
    external: true,
  },
  {
    label: "Press",
    href: "mailto:press@indiaaibrief.com",
    value: "press@indiaaibrief.com",
    external: true,
  },
  {
    label: "Products",
    href: "/kit/ai-compliance",
    value: "Compliance Kit →",
    external: false,
  },
  {
    label: "General",
    href: "/contact",
    value: "Contact form →",
    external: false,
  },
] as const;

export default function AboutPage() {
  const lead = TEAM[0];

  return (
    <div>
      <JsonLd
        data={[
          organizationSchema(),
          ...TEAM.map((member) => personSchema(member)),
        ]}
      />

      <article className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        {/* Hero */}
        <header className="pb-10 sm:pb-12">
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="section-label mb-0">About</p>
            <span className="hidden text-border sm:inline" aria-hidden>
              /
            </span>
            <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-text-tertiary">
              India · Decision-makers
            </p>
          </div>
          <h1 className="text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.1]">
            Indian AI intelligence
            <span className="mt-1 block font-semibold text-text-secondary md:mt-1.5">
              for founders, CTOs, and policymakers.
            </span>
          </h1>
          <p className="mt-5 max-w-[65ch] text-base leading-7 text-text-secondary">
            {SITE.name} is an independent desk for original, India-first analysis —
            never wire-copy aggregation — plus products that turn insight into action.
            {SITE_TAGLINE ? ` ${SITE_TAGLINE}` : null}
          </p>
          <div className="edition-rule mt-8 sm:mt-10" aria-hidden />
        </header>

        {/* Mission */}
        <section aria-labelledby="mission-heading" className="mb-14 sm:mb-16">
          <p className="section-label mb-4" id="mission-heading">
            Our mission
          </p>
          <blockquote className="editorial-panel">
            <p className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.375rem] md:text-[1.5rem]">
              The next wave of AI adoption in India will be decided by MSMEs, GCCs,
              and policymakers — not by another US newsletter with a .in domain. Our
              job is to make those decisions faster and clearer.
            </p>
          </blockquote>
        </section>

        {/* Why India */}
        <section aria-labelledby="why-india-heading" className="mb-10 sm:mb-12">
          <p className="section-label mb-3">The moat</p>
          <h2
            id="why-india-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            Why India?
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-text-secondary">
            Most AI coverage treats India as a market to sell into — not a maker of
            the future. That is the gap we exist to close.
          </p>
        </section>
      </article>

      <IndiaPulseStrip
        stats={WHY_INDIA_STATS}
        eyebrow="Why India"
        title="Signals we watch every week"
        variant="panels"
        className="border-y"
      />

      <article className="mx-auto w-full max-w-3xl px-4 py-12 md:py-14">
        <div className="mb-14 max-w-[65ch] space-y-4 text-[0.9375rem] leading-[1.75] text-text-secondary sm:mb-16">
          <p>
            India produces more engineering graduates than any country on Earth. Its
            IT services giants and a growing GCC layer touch nearly every Fortune 500.
            Startups ship Indic models and enterprise agents from Bengaluru to
            Hyderabad to Delhi NCR — and Tier-2 cities are joining the map.
          </p>
          <p className="lead-accent font-medium text-foreground">
            We cover Indian AI for people who ship and buy here — compliance,
            language, pricing, talent, and policy included.
          </p>
          <p>
            <Link
              href="/startups"
              className="font-medium text-accent hover:text-accent-hover"
            >
              Explore Startup Tracker →
            </Link>
          </p>
        </div>

        <div className="edition-rule mb-14 sm:mb-16" aria-hidden />

        {/* What we publish */}
        <section aria-labelledby="publish-heading" className="mb-14 sm:mb-16">
          <p className="section-label mb-3">The product</p>
          <h2
            id="publish-heading"
            className="mb-8 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            What we publish
          </h2>
          <ul className="space-y-3">
            {PRODUCTS.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[auto_1fr] gap-4 border border-border bg-surface p-5 transition-colors hover:border-accent/50 sm:gap-5 sm:p-6"
                >
                  <span className="pt-0.5 font-mono text-[0.6875rem] tabular-nums text-text-tertiary">
                    {item.label}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-accent sm:text-[1.0625rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.body}
                    </p>
                    <p className="mt-3 font-mono text-[0.6875rem] text-accent opacity-80 group-hover:opacity-100">
                      {item.cta}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="edition-rule mb-14 sm:mb-16" aria-hidden />

        {/* Masthead */}
        <section aria-labelledby="who-heading" className="mb-14 sm:mb-16">
          <p className="section-label mb-3">Masthead</p>
          <h2
            id="who-heading"
            className="mb-8 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            Who we are
          </h2>

          {lead ? (
            <div className="overflow-hidden border border-border bg-surface">
              <div className="flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-7">
                <Image
                  src={lead.portrait ?? lead.avatar}
                  alt={lead.name}
                  width={180}
                  height={240}
                  className="h-40 w-[7.5rem] shrink-0 self-start border border-border object-cover object-[center_20%] sm:h-48 sm:w-36"
                  priority
                />
                <div className="flex min-w-0 flex-col">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {lead.name}
                  </h3>
                  <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-accent">
                    {lead.title}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
                    {lead.credentials}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <Link
                      href={lead.url}
                      className="font-medium text-accent hover:text-accent-hover"
                    >
                      Author page →
                    </Link>
                    {lead.linkedin ? (
                      <a
                        href={lead.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-text-tertiary hover:text-foreground"
                      >
                        LinkedIn ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {TEAM.slice(1).map((member) => (
              <li key={member.slug}>
                <Link
                  href={member.url}
                  className="flex gap-4 border border-border bg-background p-4 transition-colors hover:border-accent/50"
                >
                  <Image
                    src={member.avatar}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover object-top"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-accent">{member.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                      {member.bio}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="edition-rule mb-14 sm:mb-16" aria-hidden />

        {/* Standards */}
        <section aria-labelledby="standards-heading" className="mb-14 sm:mb-16">
          <p className="section-label mb-3">How we work</p>
          <h2
            id="standards-heading"
            className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            Editorial standards
          </h2>
          <p className="mb-8 max-w-[65ch] text-sm leading-relaxed text-text-secondary">
            Auditable principles — not slogans. Full detail lives on our editorial
            policy page.
          </p>

          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.n} className="group">
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="font-mono text-[0.625rem] tabular-nums text-text-tertiary">
                    {item.n}
                  </span>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                </div>
                <div className="ml-1 border-l border-border pl-4 transition-colors group-hover:border-accent/60">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <nav
            aria-label="Editorial policies"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6"
          >
            <Link
              href="/editorial"
              className="font-medium text-accent hover:text-accent-hover"
            >
              Editorial policy →
            </Link>
            <Link
              href="/dmca"
              className="font-mono text-xs text-text-tertiary hover:text-foreground"
            >
              DMCA →
            </Link>
            <Link
              href="/authors"
              className="font-mono text-xs text-text-tertiary hover:text-foreground"
            >
              Authors →
            </Link>
          </nav>
        </section>

        <div className="edition-rule mb-14 sm:mb-16" aria-hidden />

        {/* Contact */}
        <section aria-labelledby="contact-heading" className="mb-14 sm:mb-16">
          <p className="section-label mb-3">Contact</p>
          <h2
            id="contact-heading"
            className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            Get in touch
          </h2>
          <p className="mb-8 max-w-[65ch] text-sm leading-relaxed text-text-secondary">
            Tips, partnerships, press, or a hello — we read everything.
          </p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {CONTACTS.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.href}
                    className="block h-full border border-border bg-surface p-5 transition-colors hover:border-accent/50"
                  >
                    <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-wider text-accent">
                      {item.label}
                    </p>
                    <p className="break-all text-sm text-foreground">{item.value}</p>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="block h-full border border-border bg-surface p-5 transition-colors hover:border-accent/50"
                  >
                    <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-wider text-accent">
                      {item.label}
                    </p>
                    <p className="text-sm text-foreground">{item.value}</p>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/contact">Open contact form</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={SITE.telegram} target="_blank" rel="noopener noreferrer">
                Telegram community
              </a>
            </Button>
          </div>
        </section>

        {/* Press kit */}
        <section aria-labelledby="press-heading" className="mb-14 sm:mb-16">
          <p className="section-label mb-3">Press</p>
          <h2
            id="press-heading"
            className="mb-3 text-2xl font-bold tracking-tight text-foreground"
          >
            Press kit
          </h2>
          <p className="mb-6 text-sm text-text-secondary">
            Logo, color guidelines, and usage notes for journalists and partners.
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href="/press-kit/logo-mark.svg"
                download
              >
                Logo mark (SVG)
              </a>
            </li>
            <li>
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href="/press-kit/logo-lockup.svg"
                download
              >
                Full lockup — light (SVG)
              </a>
            </li>
            <li>
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href="/press-kit/logo-lockup-dark.svg"
                download
              >
                Full lockup — dark (SVG)
              </a>
            </li>
            <li>
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href="/press-kit/logo-mark-render.png"
                download
              >
                Logo mark (PNG)
              </a>
            </li>
            <li>
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href="/press-kit/color-guidelines.txt"
                download
              >
                Color guidelines
              </a>
            </li>
            <li>
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href="/press-kit/README.txt"
                download
              >
                Press kit README
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-text-tertiary">
            Organization URL: {absoluteUrl("/about")}
          </p>
        </section>

        {/* Newsletter close */}
        <section
          aria-label="Subscribe"
          className="border border-border bg-muted/40 px-5 py-7 sm:px-7 sm:py-8"
        >
          <p className="section-label mb-3">Stay with the brief</p>
          <h2 className="mb-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Get The Brief. Free forever.
          </h2>
          <p className="mb-5 max-w-[65ch] text-sm leading-relaxed text-text-secondary">
            Weekly Indian AI intelligence for decision-makers. No spam. Unsubscribe
            anytime.
          </p>
          <div className="max-w-sm">
            <NewsletterForm source="about-page" />
          </div>
          <p className="mt-6 font-mono text-[0.625rem] uppercase tracking-wider text-text-tertiary">
            Independent · India-first · Built for practitioners
          </p>
        </section>
      </article>
    </div>
  );
}
