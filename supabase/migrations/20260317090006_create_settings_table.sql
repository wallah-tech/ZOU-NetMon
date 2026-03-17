/*
  # Create settings table

  1. New Tables
    - `settings` - single-row config table

  2. Security - allow anon
*/

CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1,
  snmp_version text DEFAULT 'SNMPv2c',
  polling_interval integer DEFAULT 60,
  netflow_port integer DEFAULT 2055,
  sflow_port integer DEFAULT 6343,
  cpu_alert_threshold integer DEFAULT 75,
  memory_alert_threshold integer DEFAULT 80,
  bandwidth_threshold integer DEFAULT 85,
  email_notifications boolean DEFAULT true,
  data_retention_days integer DEFAULT 90,
  auto_archive boolean DEFAULT true,
  two_factor_auth boolean DEFAULT true,
  session_timeout_minutes integer DEFAULT 30,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT settings_single_row CHECK (id = 1)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read settings"
  ON settings FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert settings"
  ON settings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update settings"
  ON settings FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
