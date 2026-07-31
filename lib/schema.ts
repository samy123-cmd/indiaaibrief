import type {
  Article,
  Author,
  BreadcrumbItem,
  FaqItem,
  OrganizationInfo,
} from "@/types";
import { getPostAbsoluteUrl } from "@/lib/content";
import { SITE } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

function logoImageObject() {
  return {
    "@type": "ImageObject",
    url: SITE.logo,
    width: 512,
    height: 512,
  };
}

export function organizationSchema(
  overrides?: Partial<OrganizationInfo>,
): Record<string, unknown> {
  const org: OrganizationInfo = {
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: SITE.logo,
    description: SITE.description,
    sameAs: [SITE.twitter, SITE.linkedin, SITE.telegram],
    email: SITE.editorialEmail,
    ...overrides,
  };

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    legalName: org.legalName,
    url: org.url,
    logo: logoImageObject(),
    description: org.description,
    sameAs: org.sameAs,
    foundingDate: SITE.foundingDate,
    email: org.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Editorial",
      email: SITE.editorialEmail,
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function contactPageSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE.name}`,
    url: absoluteUrl("/contact"),
    mainEntity: organizationSchema(),
  };
}

export function personSchema(author: Author): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: absoluteUrl(author.url),
    jobTitle: author.title,
    description: author.bio,
    image: absoluteUrl(author.avatar),
    sameAs: [author.twitter, author.linkedin].filter(Boolean),
    worksFor: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function breadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function faqPageSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function estimateWordCount(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

export function newsArticleSchema(
  article: Article,
  author: Author,
): Record<string, unknown> {
  const hero = absoluteUrl(article.image);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title.slice(0, 110),
    description: article.description,
    image: [hero, hero],
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    author: personSchema(author),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: logoImageObject(),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getPostAbsoluteUrl(article),
    },
    articleSection: article.category,
    keywords: article.tags.join(", "),
    wordCount: estimateWordCount(article.body),
    inLanguage: "en-IN",
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: logoImageObject(),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url.replace(/\/$/, "")}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product: {
  name: string;
  description: string;
  slug: string;
  priceInr: number;
  image: string;
  currency?: "INR";
  path?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(product.path ?? `/kit/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [absoluteUrl(product.image)],
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: SITE.name,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency ?? "INR",
      price: String(product.priceInr),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE.name,
      },
    },
  };
}
