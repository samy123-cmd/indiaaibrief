export type ContentCategory =
  | "news"
  | "explains"
  | "compares"
  | "playbooks"
  | "data";

export type SubscriptionTier =
  | "guest"
  | "free"
  | "brief"
  | "intelligence"
  | "admin";

export type EditorialRole = "admin" | "editor";

export type {
  SignalCategory,
  ImpactLevel,
  IndiaRelevance,
  SignalStatus,
  SourceType,
  SignalSourceType,
  FetchFrequency,
  SignalAction,
  ClassificationResult,
  EditorialAnalytics,
  PublishChecklist,
} from "@/lib/editorial/types";

export type ThemePreference = "light" | "dark" | "system";

export interface Author {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  twitter?: string;
  linkedin?: string;
  url: string;
}

export interface ArticleFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt: string;
  author: string;
  category: ContentCategory;
  tags: string[];
  image: string;
  imageAlt: string;
  featured: boolean;
  trending: boolean;
  readingTime: number;
  excerpt: string;
  canonical?: string;
  structuredData?: {
    type: "NewsArticle" | "Article" | "FAQPage";
    faq?: FaqItem[];
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  url: string;
  body: string;
}

/** Canonical content post type used by the MDX pipeline. */
export type Post = Article;

/** Alias matching the build brief. */
export type Category = ContentCategory;

export interface ProductKit {
  slug: string;
  name: string;
  description: string;
  priceInr: number;
  pricePaise: number;
  currency: "INR";
  features: string[];
}

/** Alias matching the build brief. */
export type Product = ProductKit;

export interface Startup {
  slug: string;
  name: string;
  logo: string;
  city: string;
  sector: string;
  stage: string;
  lastFunding: string;
  lastFundingDate: string;
  lastFundingAmountInr: number;
  employees: string;
  foundedYear: number;
  website: string;
  summary: string;
  tags: string[];
}

export type PolicyJurisdiction = "central" | "state";

/** How the instrument shows up for operators. */
export type PolicyInstrument =
  | "legislation"
  | "rules"
  | "guidelines"
  | "mission"
  | "sectoral"
  | "advisory"
  | "court"
  | "industry";

export type PolicyStatus = "in-force" | "draft" | "consultation" | "announced" | "superseded";

export interface PolicyUpdate {
  slug: string;
  title: string;
  jurisdiction: PolicyJurisdiction;
  jurisdictionLabel: string;
  sector: string;
  publishedAt: string;
  summary: string;
  sourceUrl: string;
  tags: string[];
  /** Optional richer fields for the Policy Tracker product. */
  instrument?: PolicyInstrument;
  status?: PolicyStatus;
  agency?: string;
}

export interface NewsletterSubscriber {
  email: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  category: ContentCategory;
  publishedAt: string;
}

export interface OrganizationInfo {
  name: string;
  legalName: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  email: string;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        email?: string;
        notes?: Record<string, string>;
      };
    };
  };
}
