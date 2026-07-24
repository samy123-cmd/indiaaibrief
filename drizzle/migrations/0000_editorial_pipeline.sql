-- Editorial pipeline schema for IndiaAIBrief
-- Apply via: npm run db:migrate  OR  paste into Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE source_type AS ENUM ('rss', 'api', 'scrape', 'webhook', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE fetch_frequency AS ENUM ('5min', '15min', '1hour', '6hours', 'daily');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE fetch_status AS ENUM ('success', 'error', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE signal_source_type AS ENUM ('rss', 'api', 'scrape', 'webhook', 'manual', 'social');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE signal_category AS ENUM (
    'policy', 'funding', 'product_launch', 'research',
    'acquisition', 'partnership', 'regulation', 'controversy', 'opportunity'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE impact_level AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE india_relevance AS ENUM ('direct', 'indirect', 'global_context');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE signal_status AS ENUM (
    'new', 'reviewing', 'approved', 'rejected', 'drafting', 'published', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_category AS ENUM ('news', 'explains', 'compares', 'playbooks', 'data');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  url text NOT NULL,
  type source_type NOT NULL,
  category varchar(100) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  fetch_frequency fetch_frequency NOT NULL DEFAULT '1hour',
  last_fetched_at timestamptz,
  last_fetch_status fetch_status DEFAULT 'pending',
  last_fetch_error text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sources_active_type_idx ON sources (is_active, type);
CREATE INDEX IF NOT EXISTS sources_frequency_idx ON sources (fetch_frequency);

CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(500) NOT NULL,
  source varchar(200) NOT NULL,
  source_url text NOT NULL,
  source_type signal_source_type NOT NULL,
  category signal_category NOT NULL,
  impact_level impact_level NOT NULL DEFAULT 'medium',
  india_relevance india_relevance NOT NULL DEFAULT 'global_context',
  summary text NOT NULL DEFAULT '',
  raw_content text NOT NULL DEFAULT '',
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  status signal_status NOT NULL DEFAULT 'new',
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

CREATE UNIQUE INDEX IF NOT EXISTS signals_source_url_uidx ON signals (source_url);
CREATE INDEX IF NOT EXISTS signals_status_idx ON signals (status);
CREATE INDEX IF NOT EXISTS signals_category_idx ON signals (category);
CREATE INDEX IF NOT EXISTS signals_impact_idx ON signals (impact_level);
CREATE INDEX IF NOT EXISTS signals_relevance_idx ON signals (india_relevance);
CREATE INDEX IF NOT EXISTS signals_fetched_at_idx ON signals (fetched_at);
CREATE INDEX IF NOT EXISTS signals_source_idx ON signals (source);

CREATE TABLE IF NOT EXISTS editorial_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  priority integer NOT NULL DEFAULT 5,
  deadline timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS editorial_queue_signal_uidx ON editorial_queue (signal_id);
CREATE INDEX IF NOT EXISTS editorial_queue_priority_idx ON editorial_queue (priority);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES signals(id) ON DELETE SET NULL,
  actor_id text NOT NULL,
  action varchar(100) NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_signal_idx ON audit_logs (signal_id);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at);

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES signals(id) ON DELETE SET NULL,
  slug varchar(200) NOT NULL,
  category content_category NOT NULL,
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
  status article_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  modified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS articles_category_slug_uidx ON articles (category, slug);
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS articles_public_read ON articles;
CREATE POLICY articles_public_read ON articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
