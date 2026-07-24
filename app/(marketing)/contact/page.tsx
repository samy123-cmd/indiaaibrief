import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE, buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Contact IndiaAIBrief — Editorial & Press Inquiries",
  description:
    "Contact IndiaAIBrief for editorial tips, press, partnerships, and product support.",
  path: "/contact",
});

export default function ContactPage() {
  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Contact", item: absoluteUrl("/contact") },
  ];

  return (
    <div className="mx-auto w-full max-w-[680px] px-4 py-12">
      <JsonLd data={[contactPageSchema(), breadcrumbSchema(breadcrumbs)]} />

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
          <li className="text-text-tertiary">Contact</li>
        </ol>
      </nav>

      <h1 className="mt-6 text-[32px] font-extrabold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[56px]">
        Contact
      </h1>
      <p className="mt-3 text-text-secondary">
        Tips, corrections, sponsorships, and product support. We typically reply
        within two business days.
      </p>

      <div className="mt-8 border border-border bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold text-foreground">Send a message</h2>
        <ContactForm className="mt-4" />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Other ways to reach us</h2>
        <ul className="mt-4 space-y-3 text-sm text-text-secondary">
          <li>
            Email:{" "}
            <a
              className="font-medium text-accent hover:text-accent-hover"
              href={`mailto:${SITE.email}`}
            >
              {SITE.email}
            </a>
          </li>
          <li>
            Telegram:{" "}
            <a
              className="font-medium text-accent hover:text-accent-hover"
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the community
            </a>
          </li>
          <li>
            LinkedIn:{" "}
            <a
              className="font-medium text-accent hover:text-accent-hover"
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              IndiaAIBrief
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
