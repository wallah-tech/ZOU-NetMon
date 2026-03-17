/*
  # Create reports table

  1. New Tables
    - `reports`
      - id, title, type, date_range, format, status, size_bytes, created_at

  2. Security - allow anon
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Traffic Analysis',
  date_range text NOT NULL DEFAULT 'Last 7 Days',
  format text NOT NULL DEFAULT 'PDF',
  status text NOT NULL DEFAULT 'ready',
  size_bytes bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read reports"
  ON reports FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert reports"
  ON reports FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update reports"
  ON reports FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete reports"
  ON reports FOR DELETE TO anon USING (true);
