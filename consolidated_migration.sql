
/*
  # Fix routers table RLS policies
  Allow anon access so the frontend (using anon key) can read/write routers.
*/

DROP POLICY IF EXISTS "Everyone can read routers" ON routers;
DROP POLICY IF EXISTS "Everyone can create routers" ON routers;
DROP POLICY IF EXISTS "Everyone can update routers" ON routers;
DROP POLICY IF EXISTS "Everyone can delete routers" ON routers;

CREATE POLICY "Allow anon read routers"
  ON routers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert routers"
  ON routers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update routers"
  ON routers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete routers"
  ON routers FOR DELETE
  TO anon
  USING (true);


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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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


/*
  # Seed sample data for all tables

  Insert realistic sample data so the dashboard shows live data immediately.
*/

-- â”€â”€â”€ Sample Routers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO routers (name, ip_address, location, model, firmware_version, status, snmp_enabled, netflow_enabled, cpu_usage, memory_usage, uptime_seconds, connected_devices)
VALUES
  ('Router-Main-01', '10.0.0.1', 'Main Campus', 'Cisco ASR 1001-X', '17.3.3', 'online', true, true, 42.5, 58.2, 1728000, 234),
  ('Router-Harare-01', '10.1.0.1', 'Harare Regional', 'Cisco ISR 4331', '16.9.6', 'online', true, false, 31.8, 45.1, 864000, 156),
  ('Router-Bulawayo-01', '10.2.0.1', 'Bulawayo Regional', 'Cisco ISR 4321', '16.9.4', 'online', true, true, 28.4, 62.7, 1382400, 98),
  ('Router-Lab-03', '10.3.0.3', 'Main Campus', 'Cisco Catalyst 8200', '17.5.1', 'warning', true, true, 81.3, 87.5, 432000, 67),
  ('Router-Mutare-01', '10.4.0.1', 'Mutare Regional', 'Cisco ISR 4221', '16.9.3', 'online', false, false, 19.2, 38.4, 691200, 43),
  ('Router-Masvingo-01', '10.5.0.1', 'Masvingo Regional', 'Cisco ISR 4221', '16.9.3', 'online', true, false, 22.7, 41.3, 518400, 38)
ON CONFLICT (ip_address) DO NOTHING;

-- â”€â”€â”€ Sample Alerts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO alerts (router_name, type, title, message, acknowledged, created_at)
VALUES
  ('Router-Lab-03', 'critical', 'Interface Down', 'Router-Lab-03 interface eth0 is down', false, now() - interval '2 hours 15 minutes'),
  ('Router-Main-01', 'warning', 'High CPU Usage', 'CPU usage exceeded 75% threshold on Router-Main-01', false, now() - interval '1 hour 45 minutes'),
  ('Router-Lab-03', 'warning', 'High Memory Usage', 'Memory usage at 85% on Router-Lab-03', true, now() - interval '3 hours 30 minutes'),
  ('Router-Harare-01', 'info', 'Maintenance Completed', 'Scheduled maintenance completed successfully', true, now() - interval '5 hours'),
  ('Router-Main-01', 'warning', 'Bandwidth Threshold', 'Bandwidth usage exceeded 80% on main link', true, now() - interval '8 hours'),
  ('Router-Harare-01', 'critical', 'Port Scan Detected', 'Potential port scanning activity from 10.1.23.45', false, now() - interval '30 minutes'),
  ('Router-Mutare-01', 'info', 'Firmware Update Available', 'New firmware 16.9.4 is available for Router-Mutare-01', false, now() - interval '1 day');

-- â”€â”€â”€ Sample Traffic Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO traffic_data (router_name, inbound_mbps, outbound_mbps, total_mbps, source_ip, destination, protocol, data_transferred_mb, duration_minutes, recorded_at)
VALUES
  ('Router-Main-01', 1820, 580, 2400, '10.1.45.23', 'elearning.zou.ac.zw', 'HTTPS', 456, 45, now() - interval '5 minutes'),
  ('Router-Main-01', 1750, 550, 2300, '10.1.67.89', 'admin.zou.ac.zw', 'HTTPS', 328, 32, now() - interval '10 minutes'),
  ('Router-Harare-01', 890, 210, 1100, '10.2.12.45', 'library.zou.ac.zw', 'HTTP', 234, 28, now() - interval '15 minutes'),
  ('Router-Bulawayo-01', 650, 150, 800, '10.3.89.12', 'portal.zou.ac.zw', 'HTTPS', 198, 18, now() - interval '20 minutes'),
  ('Router-Main-01', 1680, 490, 2170, '10.1.34.78', 'mail.zou.ac.zw', 'SMTP', 156, 52, now() - interval '25 minutes'),
  ('Router-Main-01', 1920, 610, 2530, '10.1.45.23', 'elearning.zou.ac.zw', 'HTTPS', 512, 50, now() - interval '1 hour'),
  ('Router-Harare-01', 940, 230, 1170, '10.2.12.45', 'library.zou.ac.zw', 'HTTP', 280, 35, now() - interval '2 hours'),
  ('Router-Main-01', 1580, 430, 2010, '10.1.45.23', 'elearning.zou.ac.zw', 'HTTPS', 390, 42, now() - interval '3 hours'),
  ('Router-Bulawayo-01', 720, 180, 900, '10.3.89.12', 'portal.zou.ac.zw', 'HTTPS', 210, 22, now() - interval '6 hours'),
  ('Router-Main-01', 2100, 700, 2800, '10.1.45.23', 'elearning.zou.ac.zw', 'HTTPS', 620, 60, now() - interval '12 hours'),
  ('Router-Mutare-01', 320, 80, 400, '10.4.12.10', 'portal.zou.ac.zw', 'HTTPS', 120, 15, now() - interval '4 hours'),
  ('Router-Masvingo-01', 280, 70, 350, '10.5.12.10', 'library.zou.ac.zw', 'HTTP', 90, 12, now() - interval '5 hours');

-- â”€â”€â”€ Sample Anomalies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO anomalies (router_name, type, severity, description, confidence, resolved, detected_at)
VALUES
  ('Router-Lab-03', 'Traffic Spike', 'high', 'Unusual traffic spike detected - 300% above baseline', 94, false, now() - interval '1 hour 20 minutes'),
  ('Router-Main-01', 'CPU Pattern', 'medium', 'Abnormal CPU usage pattern detected', 87, false, now() - interval '2 hours 30 minutes'),
  ('Router-Harare-01', 'Port Scan', 'high', 'Potential port scanning activity detected from external IP', 91, false, now() - interval '40 minutes'),
  ('Router-Bulawayo-01', 'Bandwidth Anomaly', 'low', 'Slight deviation in bandwidth usage pattern - monitoring', 72, true, now() - interval '1 day'),
  ('Router-Main-01', 'Login Failures', 'medium', 'Multiple failed login attempts to management interface', 88, false, now() - interval '3 hours');

-- â”€â”€â”€ Sample Predictions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO predictions (metric, current_value, predicted_value, unit, timeframe, confidence)
VALUES
  ('Bandwidth Usage', 2.4, 3.1, 'Gbps', 'Next 7 days', 88),
  ('Peak Connections', 1234, 1580, 'connections', 'Next 24 hours', 92),
  ('Storage Usage', 67, 78, '%', 'Next 30 days', 85),
  ('CPU Load (Main Router)', 42.5, 67.0, '%', 'Next 48 hours', 79),
  ('Active Devices', 636, 720, 'devices', 'Next 7 days', 83);

-- â”€â”€â”€ Sample Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO reports (title, type, date_range, format, status, size_bytes, created_at)
VALUES
  ('Weekly Traffic Summary', 'Traffic Analysis', 'Last 7 Days', 'PDF', 'ready', 2411724, now() - interval '2 days'),
  ('Monthly Network Performance', 'Performance Report', 'Last 30 Days', 'PDF', 'ready', 4929945, now() - interval '15 days'),
  ('Anomaly Detection Summary', 'AI Analytics', 'Last 14 Days', 'PDF', 'ready', 1887436, now() - interval '1 day'),
  ('Bandwidth Utilization Q1', 'Capacity Planning', 'Last 90 Days', 'Excel', 'ready', 3355443, now() - interval '30 days'),
  ('Security Events Log', 'Security Report', 'Last 7 Days', 'CSV', 'ready', 5349000, now() - interval '3 hours');


