import Link from "next/link";
import { CheckoutButton } from "@/components/products/checkout-button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { PRODUCTS } from "@/lib/products";
import { breadcrumbSchema, faqPageSchema, productSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, formatInr } from "@/lib/utils";

export const revalidate = 86400;

const AUDIT = PRODUCTS.readinessAudit;

const FAQS = [
  {
    question: "What happens after I pay?",
    answer:
      "You land on a confirmation page with your payment ID. We start the 47-point scorecard within one business day and email the PDF report within 3 business days, plus schedule a short follow-up call.",
  },
  {
    question: "Who is this for?",
    answer:
      "Indian MSMEs and product teams evaluating AI adoption under DPDP, enterprise RFPs, or regulated pilots (BFSI, health, government).",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. It is an operational readiness scorecard — hygiene, gaps, and prioritised next steps. Escalate material risk to counsel.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "If we have not started the audit, email hello@indiaaibrief.com within 48 hours with your Razorpay payment ID. Once work has started, the fee is non-refundable.",
  },
];

const SCORECARD_PREVIEW = [
  "Data map & DPDP purpose alignment",
  "Model / vendor inventory",
  "Human oversight for high-risk flows",
  "Logging & incident paths",
  "India hosting & subprocessors",
  "RFP-ready risk memo outline",
];

export const metadata = buildMetadata({
  title: `${AUDIT.name} — ₹${AUDIT.priceInr}`,
  description: AUDIT.description,
  path: "/audit",
});

export default function AuditPage() {
  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Audit", item: absoluteUrl("/audit") },
  ];

  return (
    <div>
      <JsonLd
        data={[
          productSchema({
            name: AUDIT.name,
            description: AUDIT.description,
            slug: AUDIT.slug,
            priceInr: AUDIT.priceInr,
            image: "/images/products/ai-compliance-kit.webp",
            currency: AUDIT.currency,
            path: "/audit",
          }),
          faqPageSchema(FAQS),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-text-tertiary">Audit</li>
            </ol>
          </nav>

          <Badge className="mt-6">
            Productized service · {formatInr(AUDIT.priceInr)}
          </Badge>
          <h1 className="mt-3 text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-foreground md:text-5xl md:leading-[56px]">
            {AUDIT.name}
          </h1>
          <p className="mt-4 text-lg font-semibold text-foreground md:text-xl">
            Know your AI readiness before the enterprise RFP asks.
          </p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
            {AUDIT.description} Intake → manual review → PDF report in 3 business
            days, with one follow-up call.
          </p>

          <div className="mt-8 max-w-md rounded-lg border border-border bg-background p-5">
            <p className="text-sm font-semibold text-foreground">
              Book & pay — {formatInr(AUDIT.priceInr)}
            </p>
            <CheckoutButton
              className="mt-4"
              product={AUDIT.slug}
              productName={AUDIT.name}
              priceInr={AUDIT.priceInr}
              collectCompany
              ctaLabel={`Pay & book — ${formatInr(AUDIT.priceInr)}`}
              finePrint="UPI, cards, netbanking via Razorpay. Confirmation page after payment. Report in 3 business days."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          What the scorecard covers
        </h2>
        <p className="mt-3 text-text-secondary">
          Forty-seven controls across data, governance, vendors, and buyer-facing
          evidence — tuned for Indian MSMEs, not EU AI Act theatre.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SCORECARD_PREVIEW.map((item) => (
            <li
              key={item}
              className="border border-border bg-surface px-4 py-3 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 space-y-6">
            {[
              {
                step: "01",
                title: "Pay & intake",
                body: "Razorpay checkout, then company + product context from your confirmation details.",
              },
              {
                step: "02",
                title: "47-point review",
                body: "We score your stack against DPDP-aware practices, MeitY-style risk tiers, and RFP asks.",
              },
              {
                step: "03",
                title: "PDF + call",
                body: "Written report with prioritised gaps, then a short follow-up to walk the top five actions.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="font-mono text-sm font-medium text-accent">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Frequently asked questions
        </h2>
        <dl className="mt-8 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="text-base font-semibold text-foreground">
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-text-secondary">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-text-tertiary">
          Prefer self-serve?{" "}
          <Link
            href="/kit/ai-compliance"
            className="font-medium text-accent hover:text-accent-hover"
          >
            AI Compliance Starter Kit — {formatInr(PRODUCTS.complianceKit.priceInr)}
          </Link>
        </p>
      </section>
    </div>
  );
}
