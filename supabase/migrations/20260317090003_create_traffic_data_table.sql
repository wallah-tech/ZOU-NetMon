/*
  # Create traffic_data table

  1. New Tables
    - `traffic_data`
      - `id` (uuid, primary key)
      - `router_name` (text)
      - `inbound_mbps` (float)
      - `outbound_mbps` (float)
      - `total_mbps` (float)
      - `source_ip` (text)
      - `destination` (text)
      - `protocol` (text)
      - `recorded_at` (timestamptz)

  2. Security
    - Enable RLS, allow anon
*/

CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  router_name text NOT NULL DEFAULT 'Main Router',
  inbound_mbps float DEFAULT 0,
  outbound_mbps float DEFAULT 0,
  total_mbps float DEFAULT 0,
  source_ip text,
  destination text,
  protocol text DEFAULT 'HTTPS',
  data_transferred_mb float DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read traffic_data"
  ON traffic_data FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert traffic_data"
  ON traffic_data FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update traffic_data"
  ON traffic_data FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete traffic_data"
  ON traffic_data FOR DELETE
  TO anon
  USING (true);
