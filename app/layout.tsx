import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
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
  buildMetadata,
} from "@/lib/seo";
import { THEME_COOKIE_NAME, isThemeValue, themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "optional",
  preload: false,
  weight: ["400", "500"],
});

export const metadata: Metadata = buildMetadata({
  title: "Indian AI Intelligence for Decision-Makers",
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const themePreference = isThemeValue(themeCookie) ? themeCookie : "system";

  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      data-theme={themePreference}
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
