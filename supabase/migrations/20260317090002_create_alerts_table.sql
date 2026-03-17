/*
  # Create alerts table

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `router_name` (text) - name reference
      - `type` (text) - critical | warning | info
      - `title` (text)
      - `message` (text)
      - `acknowledged` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow anon read/write
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  router_name text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read alerts"
  ON alerts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert alerts"
  ON alerts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update alerts"
  ON alerts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete alerts"
  ON alerts FOR DELETE
  TO anon
  USING (true);
