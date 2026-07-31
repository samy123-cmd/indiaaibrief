import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PlausibleAnalytics } from "@/components/analytics/plausible";
import { NewsletterCTA } from "@/components/content/newsletter-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import {
  SITE,
  SITE_DESCRIPTION,
  SITE_NAME,
  buildMetadata,
} from "@/lib/seo";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Variable Inter — one file instead of four static weights (helps home LCP).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "optional",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "optional",
  preload: false,
  weight: ["400", "500"],
});

// Keep root metadata generic — page-level metadata owns titles/canonicals.
// Homepage-specific title lives on app/(marketing)/page.tsx so 404s do not
// inherit the homepage <title> / canonical (soft-404 SEO hazard).
export const metadata: Metadata = {
  ...buildMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  alternates: undefined,
  openGraph: undefined,
  twitter: undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

/**
 * Root layout stays fully static / ISR-friendly.
 * Theme is applied via inline script + cookie (no cookies() read here) so
 * pages are not forced to Cache-Control: no-store (bfcache-compatible).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      data-theme="system"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <SkipToContent />
        <SiteHeader />
        <main id="main-content" className="flex-1 pb-28 md:pb-0" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <NewsletterCTA variant="sticky" source="sticky-mobile" />
        <PlausibleAnalytics />
      </body>
    </html>
  );
}
