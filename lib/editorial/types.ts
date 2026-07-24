export const SIGNAL_CATEGORIES = [
  "policy",
  "funding",
  "product_launch",
  "research",
  "acquisition",
  "partnership",
  "regulation",
  "controversy",
  "opportunity",
] as const;

export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];

export const IMPACT_LEVELS = ["critical", "high", "medium", "low"] as const;
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];

export const INDIA_RELEVANCE_LEVELS = [
  "direct",
  "indirect",
  "global_context",
] as const;
export type IndiaRelevance = (typeof INDIA_RELEVANCE_LEVELS)[number];

export const SIGNAL_STATUSES = [
  "new",
  "reviewing",
  "approved",
  "rejected",
  "drafting",
  "published",
  "archived",
] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

export const SOURCE_TYPES = [
  "rss",
  "api",
  "scrape",
  "webhook",
  "manual",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SIGNAL_SOURCE_TYPES = [
  ...SOURCE_TYPES,
  "social",
] as const;
export type SignalSourceType = (typeof SIGNAL_SOURCE_TYPES)[number];

export const FETCH_FREQUENCIES = [
  "5min",
  "15min",
  "1hour",
  "6hours",
  "daily",
] as const;
export type FetchFrequency = (typeof FETCH_FREQUENCIES)[number];

export const SIGNAL_ACTIONS = [
  "review",
  "approve",
  "reject",
  "start_draft",
  "publish",
  "archive",
] as const;
export type SignalAction = (typeof SIGNAL_ACTIONS)[number];

export type EditorialRole = "admin" | "editor";

export interface ClassificationResult {
  indiaRelevance: IndiaRelevance;
  impactLevel: ImpactLevel;
  category: SignalCategory;
  relatedStartups: string[];
  relatedPolicies: string[];
  tags: string[];
}

export interface ClassifyInput {
  title: string;
  summary?: string;
  rawContent?: string;
  source?: string;
}

export interface ManualSignalInput {
  title: string;
  sourceUrl: string;
  category?: SignalCategory;
  summary?: string;
  rawContent?: string;
  tags?: string[];
  source?: string;
}

export interface PublishChecklist {
  titleOk: boolean;
  descriptionOk: boolean;
  imageOk: boolean;
  categoryOk: boolean;
  tagsOk: boolean;
  authorOk: boolean;
  indiaAngleOk: boolean;
  sourceAttributionOk: boolean;
  errors: string[];
}

export interface EditorialAnalytics {
  signalsToday: number;
  signalsThisWeek: number;
  signalsThisMonth: number;
  publishedCount: number;
  avgHoursSignalToPublish: number | null;
  topSources: Array<{ source: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  impactBreakdown: Array<{ impactLevel: string; count: number }>;
  inboxCount: number;
}

export const ACTION_TO_STATUS: Record<SignalAction, SignalStatus> = {
  review: "reviewing",
  approve: "approved",
  reject: "rejected",
  start_draft: "drafting",
  publish: "published",
  archive: "archived",
};
