import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const sourceTypeEnum = pgEnum("iab_source_type", [
  "rss",
  "api",
  "scrape",
  "webhook",
  "manual",
]);

export const fetchFrequencyEnum = pgEnum("iab_fetch_frequency", [
  "5min",
  "15min",
  "1hour",
  "6hours",
  "daily",
]);

export const fetchStatusEnum = pgEnum("iab_fetch_status", [
  "success",
  "error",
  "pending",
]);

export const signalSourceTypeEnum = pgEnum("iab_signal_source_type", [
  "rss",
  "api",
  "scrape",
  "webhook",
  "manual",
  "social",
]);

export const signalCategoryEnum = pgEnum("iab_signal_category", [
  "policy",
  "funding",
  "product_launch",
  "research",
  "acquisition",
  "partnership",
  "regulation",
  "controversy",
  "opportunity",
]);

export const impactLevelEnum = pgEnum("iab_impact_level", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const indiaRelevanceEnum = pgEnum("iab_india_relevance", [
  "direct",
  "indirect",
  "global_context",
]);

export const signalStatusEnum = pgEnum("iab_signal_status", [
  "new",
  "reviewing",
  "approved",
  "rejected",
  "drafting",
  "published",
  "archived",
]);

export const articleStatusEnum = pgEnum("iab_article_status", [
  "draft",
  "published",
  "archived",
]);

export const contentCategoryEnum = pgEnum("iab_content_category", [
  "news",
  "explains",
  "compares",
  "playbooks",
  "data",
]);

export const sources = pgTable(
  "iab_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    url: text("url").notNull(),
    type: sourceTypeEnum("type").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    fetchFrequency: fetchFrequencyEnum("fetch_frequency")
      .notNull()
      .default("1hour"),
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
    lastFetchStatus: fetchStatusEnum("last_fetch_status").default("pending"),
    lastFetchError: text("last_fetch_error"),
    config: jsonb("config")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sources_active_type_idx").on(table.isActive, table.type),
    index("sources_frequency_idx").on(table.fetchFrequency),
  ],
);

export const signals = pgTable(
  "iab_signals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    source: varchar("source", { length: 200 }).notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceType: signalSourceTypeEnum("source_type").notNull(),
    category: signalCategoryEnum("category").notNull(),
    impactLevel: impactLevelEnum("impact_level").notNull().default("medium"),
    indiaRelevance: indiaRelevanceEnum("india_relevance")
      .notNull()
      .default("global_context"),
    summary: text("summary").notNull().default(""),
    rawContent: text("raw_content").notNull().default(""),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: signalStatusEnum("status").notNull().default("new"),
    assignedTo: text("assigned_to"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    relatedStartups: text("related_startups")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    relatedPolicies: text("related_policies")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    aiDraft: text("ai_draft"),
    aiDraftGeneratedAt: timestamp("ai_draft_generated_at", {
      withTimezone: true,
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("signals_source_url_uidx").on(table.sourceUrl),
    index("signals_status_idx").on(table.status),
    index("signals_category_idx").on(table.category),
    index("signals_impact_idx").on(table.impactLevel),
    index("signals_relevance_idx").on(table.indiaRelevance),
    index("signals_fetched_at_idx").on(table.fetchedAt),
    index("signals_source_idx").on(table.source),
  ],
);

export const editorialQueue = pgTable(
  "iab_editorial_queue",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    signalId: uuid("signal_id")
      .notNull()
      .references(() => signals.id, { onDelete: "cascade" }),
    priority: integer("priority").notNull().default(5),
    deadline: timestamp("deadline", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("editorial_queue_signal_uidx").on(table.signalId),
    index("editorial_queue_priority_idx").on(table.priority),
  ],
);

export const auditLogs = pgTable(
  "iab_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    signalId: uuid("signal_id").references(() => signals.id, {
      onDelete: "set null",
    }),
    actorId: text("actor_id").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    meta: jsonb("meta")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_signal_idx").on(table.signalId),
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const articles = pgTable(
  "iab_articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    signalId: uuid("signal_id").references(() => signals.id, {
      onDelete: "set null",
    }),
    slug: varchar("slug", { length: 200 }).notNull(),
    category: contentCategoryEnum("category").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: varchar("description", { length: 300 }).notNull(),
    author: varchar("author", { length: 100 }).notNull(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    image: text("image").notNull(),
    imageAlt: text("image_alt").notNull(),
    featured: boolean("featured").notNull().default(false),
    trending: boolean("trending").notNull().default(false),
    readingTime: integer("reading_time").notNull().default(1),
    excerpt: text("excerpt").notNull().default(""),
    canonical: text("canonical"),
    bodyMdx: text("body_mdx").notNull(),
    correctionNote: text("correction_note"),
    sourceUrl: text("source_url"),
    status: articleStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    modifiedAt: timestamp("modified_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("articles_category_slug_uidx").on(table.category, table.slug),
    index("articles_status_idx").on(table.status),
    index("articles_published_at_idx").on(table.publishedAt),
  ],
);

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Signal = typeof signals.$inferSelect;
export type NewSignal = typeof signals.$inferInsert;
export type EditorialQueueItem = typeof editorialQueue.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type DbArticle = typeof articles.$inferSelect;
export type NewDbArticle = typeof articles.$inferInsert;

export const figures = pgTable(
  "iab_figures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 120 }).notNull(),
    label: varchar("label", { length: 300 }).notNull(),
    value: text("value").notNull(),
    unit: varchar("unit", { length: 80 }),
    groupKey: varchar("group_key", { length: 120 }).notNull(),
    category: varchar("category", { length: 100 }).notNull().default("general"),
    sourceName: varchar("source_name", { length: 200 }).notNull(),
    sourceUrl: text("source_url"),
    asOfDate: timestamp("as_of_date", { withTimezone: true }),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("figures_key_uidx").on(table.key),
    index("figures_group_idx").on(table.groupKey),
    index("figures_active_idx").on(table.isActive),
  ],
);

export type Figure = typeof figures.$inferSelect;
export type NewFigure = typeof figures.$inferInsert;
