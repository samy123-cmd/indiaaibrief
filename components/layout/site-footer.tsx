import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { FooterAccordionColumn } from "@/components/layout/footer-accordion-column";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/seo";
import {
  FOOTER_CATEGORIES,
  FOOTER_COMPANY,
  FOOTER_LEGAL,
  FOOTER_PRODUCTS,
} from "@/lib/navigation";

/**
 * Site footer — Server Component shell.
 * 4 columns: Categories, Products, Company, Legal.
 * Mobile: accordion via FooterAccordionColumn (client).
 */
export function SiteFooter() {
  return (
    <footer className="cv-auto mt-auto border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12">
        <div className="mb-8 max-w-sm">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center"
            aria-label="IndiaAIBrief home"
          >
            <BrandMark size={24} />
          </Link>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {SITE.tagline}
          </p>
          <a
            href={SITE.telegram}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:text-accent-hover"
            rel="noopener noreferrer"
            target="_blank"
          >
            Join Telegram community
          </a>
        </div>

        <div className="grid gap-0 md:grid-cols-4 md:gap-8">
          <FooterAccordionColumn title="Categories" links={FOOTER_CATEGORIES} />
          <FooterAccordionColumn title="Products" links={FOOTER_PRODUCTS} />
          <FooterAccordionColumn title="Company" links={FOOTER_COMPANY} />
          <FooterAccordionColumn title="Legal" links={FOOTER_LEGAL} />
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 text-xs text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              Cookies
            </Link>
            <Link
              href="/editorial"
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              Editorial
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
