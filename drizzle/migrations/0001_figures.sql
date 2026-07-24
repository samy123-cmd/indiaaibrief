-- Figures registry for live-editable India AI statistics

CREATE TABLE IF NOT EXISTS figures (
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

CREATE UNIQUE INDEX IF NOT EXISTS figures_key_uidx ON figures (key);
CREATE INDEX IF NOT EXISTS figures_group_idx ON figures (group_key);
CREATE INDEX IF NOT EXISTS figures_active_idx ON figures (is_active);

ALTER TABLE figures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS figures_public_read ON figures;
CREATE POLICY figures_public_read ON figures
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
