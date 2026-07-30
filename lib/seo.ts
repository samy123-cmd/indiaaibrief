import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const SITE_NAME = "IndiaAIBrief";
export const SITE_TAGLINE = "Indian AI intelligence for decision-makers.";
export const SITE_DESCRIPTION =
  "Breaking news, original analysis, and actionable intelligence on India's AI ecosystem. For founders, CTOs, and policymakers.";

export const SITE = {
  name: SITE_NAME,
  legalName: "IndiaAIBrief",
  tagline: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/images/logo.png"),
  logoPng: absoluteUrl("/images/logo.png"),
  email: "hello@indiaaibrief.com",
  editorialEmail: "editor@indiaaibrief.com",
  locale: "en_IN",
  language: "English",
  twitterHandle: "@indiaaibrief",
  twitter: "https://x.com/indiaaibrief",
  linkedin: "https://www.linkedin.com/company/indiaaibrief",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/indiaaibrief",
  foundingDate: "2026",
  themeColor: "#DC2626",
} as const;

interface BuildMetadataInput {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedAt?: string;
  modifiedAt?: string;
  authors?: string[];
  authorUrl?: string;
  authorTwitter?: string;
  section?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = "/images/og-default.webp",
  imageAlt,
  type = "website",
  publishedAt,
  modifiedAt,
  authors,
  authorUrl,
  authorTwitter,
  section,
  tags,
  readingTimeMinutes,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
  const ogAlt = imageAlt ?? title;
  const verificationToken =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

  return {
    title: { absolute: fullTitle },
    description,
    applicationName: SITE_NAME,
    authors: authors?.map((name) => ({ name, url: authorUrl })),
    creator: authors?.[0] ?? SITE_NAME,
    publisher: SITE_NAME,
    category: section,
    keywords: tags,
    metadataBase: new URL(SITE.url),
    // English-only site: canonical only — no hreflang (avoids Semrush
    // self-ref / redirect conflicts on a single locale).
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
    verification: verificationToken
      ? { google: verificationToken }
      : undefined,
    openGraph: {
      type,
      locale: SITE.locale,
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: ogAlt,
          type: imageUrl.endsWith(".svg")
            ? "image/svg+xml"
            : imageUrl.endsWith(".png")
              ? "image/png"
              : "image/webp",
        },
      ],
      ...(type === "article"
        ? {
            publishedTime: publishedAt,
            modifiedTime: modifiedAt ?? publishedAt,
            authors: authors,
            section,
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitterHandle,
      creator: authorTwitter ?? SITE.twitterHandle,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          alt: ogAlt,
        },
      ],
    },
    other: {
      "theme-color": SITE.themeColor,
      "msapplication-TileColor": SITE.themeColor,
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": SITE_NAME,
      "format-detection": "telephone=no",
      ...(type === "article" && authors?.[0]
        ? {
            "twitter:label1": "Written by",
            "twitter:data1": authors[0],
          }
        : {}),
      ...(type === "article" && readingTimeMinutes
        ? {
            "twitter:label2": "Reading time",
            "twitter:data2": `${readingTimeMinutes} minutes`,
          }
        : {}),
      ...(type === "article" && authorUrl
        ? { "article:author": absoluteUrl(authorUrl) }
        : {}),
    },
  };
}

export function articleTitle(primary: string, secondary?: string): string {
  const base = secondary ? `${primary} — ${secondary}` : primary;
  return `${base} | ${SITE_NAME}`;
}

export function categoryPageTitle(
  categoryTitle: string,
  page = 1,
  tag?: string | null,
): string {
  const tagSuffix = tag ? ` — ${tag}` : "";
  const pageSuffix = page > 1 ? ` — Page ${page}` : " — Latest Updates";
  return `${categoryTitle}${tagSuffix}${pageSuffix} | ${SITE_NAME}`;
}
