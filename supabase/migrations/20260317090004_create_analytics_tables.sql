/*
  # Create anomalies and predictions tables

  1. New Tables
    - `anomalies`
      - id, router_name, type, severity, description, confidence, resolved (bool), detected_at
    - `predictions`
      - id, metric, current_value, predicted_value, unit, timeframe, confidence, created_at

  2. Security
    - Enable RLS, allow anon
*/

CREATE TABLE IF NOT EXISTS anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  router_name text NOT NULL,
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL,
  confidence integer DEFAULT 85,
  resolved boolean DEFAULT false,
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read anomalies"
  ON anomalies FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert anomalies"
  ON anomalies FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update anomalies"
  ON anomalies FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete anomalies"
  ON anomalies FOR DELETE TO anon USING (true);

-- ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL,
  current_value float NOT NULL DEFAULT 0,
  predicted_value float NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT '%',
  timeframe text NOT NULL DEFAULT 'Next 7 days',
  confidence integer DEFAULT 85,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read predictions"
  ON predictions FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert predictions"
  ON predictions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update predictions"
  ON predictions FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete predictions"
  ON predictions FOR DELETE TO anon USING (true);
