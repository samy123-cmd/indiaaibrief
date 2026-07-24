-- IndiaAIBrief tables (iab_* prefix — shared Supabase with Global AI News)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE iab_source_type AS ENUM ('rss', 'api', 'scrape', 'webhook', 'manual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_fetch_frequency AS ENUM ('5min', '15min', '1hour', '6hours', 'daily'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_fetch_status AS ENUM ('success', 'error', 'pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_signal_source_type AS ENUM ('rss', 'api', 'scrape', 'webhook', 'manual', 'social'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_signal_category AS ENUM ('policy', 'funding', 'product_launch', 'research', 'acquisition', 'partnership', 'regulation', 'controversy', 'opportunity'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_impact_level AS ENUM ('critical', 'high', 'medium', 'low'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_india_relevance AS ENUM ('direct', 'indirect', 'global_context'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_signal_status AS ENUM ('new', 'reviewing', 'approved', 'rejected', 'drafting', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_article_status AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE iab_content_category AS ENUM ('news', 'explains', 'compares', 'playbooks', 'data'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS iab_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  url text NOT NULL,
  type iab_source_type NOT NULL,
  category varchar(100) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  fetch_frequency iab_fetch_frequency NOT NULL DEFAULT '1hour',
  last_fetched_at timestamptz,
  last_fetch_status iab_fetch_status DEFAULT 'pending',
  last_fetch_error text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS iab_sources_active_type_idx ON iab_sources (is_active, type);
CREATE INDEX IF NOT EXISTS iab_sources_frequency_idx ON iab_sources (fetch_frequency);

CREATE TABLE IF NOT EXISTS iab_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(500) NOT NULL,
  source varchar(200) NOT NULL,
  source_url text NOT NULL,
  source_type iab_signal_source_type NOT NULL,
  category iab_signal_category NOT NULL,
  impact_level iab_impact_level NOT NULL DEFAULT 'medium',
  india_relevance iab_india_relevance NOT NULL DEFAULT 'global_context',
  summary text NOT NULL DEFAULT '',
  raw_content text NOT NULL DEFAULT '',
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  status iab_signal_status NOT NULL DEFAULT 'new',
  assigned_to text,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  related_startups text[] NOT NULL DEFAULT ARRAY[]::text[],
  related_policies text[] NOT NULL DEFAULT ARRAY[]::text[],
  ai_draft text,
  ai_draft_generated_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS iab_signals_source_url_uidx ON iab_signals (source_url);
CREATE INDEX IF NOT EXISTS iab_signals_status_idx ON iab_signals (status);
CREATE INDEX IF NOT EXISTS iab_signals_category_idx ON iab_signals (category);
CREATE INDEX IF NOT EXISTS iab_signals_impact_idx ON iab_signals (impact_level);
CREATE INDEX IF NOT EXISTS iab_signals_relevance_idx ON iab_signals (india_relevance);
CREATE INDEX IF NOT EXISTS iab_signals_fetched_at_idx ON iab_signals (fetched_at);
CREATE INDEX IF NOT EXISTS iab_signals_source_idx ON iab_signals (source);

CREATE TABLE IF NOT EXISTS iab_editorial_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES iab_signals(id) ON DELETE CASCADE,
  priority integer NOT NULL DEFAULT 5,
  deadline timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS iab_editorial_queue_signal_uidx ON iab_editorial_queue (signal_id);
CREATE INDEX IF NOT EXISTS iab_editorial_queue_priority_idx ON iab_editorial_queue (priority);

CREATE TABLE IF NOT EXISTS iab_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES iab_signals(id) ON DELETE SET NULL,
  actor_id text NOT NULL,
  action varchar(100) NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS iab_audit_logs_signal_idx ON iab_audit_logs (signal_id);
CREATE INDEX IF NOT EXISTS iab_audit_logs_actor_idx ON iab_audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS iab_audit_logs_created_at_idx ON iab_audit_logs (created_at);

CREATE TABLE IF NOT EXISTS iab_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES iab_signals(id) ON DELETE SET NULL,
  slug varchar(200) NOT NULL,
  category iab_content_category NOT NULL,
  title varchar(200) NOT NULL,
  description varchar(300) NOT NULL,
  author varchar(100) NOT NULL,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  image text NOT NULL,
  image_alt text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  trending boolean NOT NULL DEFAULT false,
  reading_time integer NOT NULL DEFAULT 1,
  excerpt text NOT NULL DEFAULT '',
  canonical text,
  body_mdx text NOT NULL,
  correction_note text,
  source_url text,
  status iab_article_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  modified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS iab_articles_category_slug_uidx ON iab_articles (category, slug);
CREATE INDEX IF NOT EXISTS iab_articles_status_idx ON iab_articles (status);
CREATE INDEX IF NOT EXISTS iab_articles_published_at_idx ON iab_articles (published_at);

CREATE TABLE IF NOT EXISTS iab_figures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(120) NOT NULL,
  label varchar(300) NOT NULL,
  value text NOT NULL,
  unit varchar(80),
  group_key varchar(120) NOT NULL,
  category varchar(100) NOT NULL DEFAULT 'general',
  source_name varchar(200) NOT NULL,
  source_url text,
  as_of_date timestamptz,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS iab_figures_key_uidx ON iab_figures (key);
CREATE INDEX IF NOT EXISTS iab_figures_group_idx ON iab_figures (group_key);
CREATE INDEX IF NOT EXISTS iab_figures_active_idx ON iab_figures (is_active);

ALTER TABLE iab_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE iab_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE iab_editorial_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE iab_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE iab_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE iab_figures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS iab_articles_public_read ON iab_articles;
CREATE POLICY iab_articles_public_read ON iab_articles
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS iab_figures_public_read ON iab_figures;
CREATE POLICY iab_figures_public_read ON iab_figures
  FOR SELECT TO anon, authenticated
  USING (is_active = true);
