/*
  # Seed sample data for all tables

  Insert realistic sample data so the dashboard shows live data immediately.
*/

-- ─── Sample Routers ───────────────────────────────────────────────────────────
INSERT INTO routers (name, ip_address, location, model, firmware_version, status, snmp_enabled, netflow_enabled, cpu_usage, memory_usage, uptime_seconds, connected_devices)
VALUES
  ('Router-Main-01', '10.0.0.1', 'Main Campus', 'Cisco ASR 1001-X', '17.3.3', 'online', true, true, 42.5, 58.2, 1728000, 234),
  ('Router-Harare-01', '10.1.0.1', 'Harare Regional', 'Cisco ISR 4331', '16.9.6', 'online', true, false, 31.8, 45.1, 864000, 156),
  ('Router-Bulawayo-01', '10.2.0.1', 'Bulawayo Regional', 'Cisco ISR 4321', '16.9.4', 'online', true, true, 28.4, 62.7, 1382400, 98),
  ('Router-Lab-03', '10.3.0.3', 'Main Campus', 'Cisco Catalyst 8200', '17.5.1', 'warning', true, true, 81.3, 87.5, 432000, 67),
  ('Router-Mutare-01', '10.4.0.1', 'Mutare Regional', 'Cisco ISR 4221', '16.9.3', 'online', false, false, 19.2, 38.4, 691200, 43),
  ('Router-Masvingo-01', '10.5.0.1', 'Masvingo Regional', 'Cisco ISR 4221', '16.9.3', 'online', true, false, 22.7, 41.3, 518400, 38)
ON CONFLICT (ip_address) DO NOTHING;

-- ─── Sample Alerts ────────────────────────────────────────────────────────────
INSERT INTO alerts (router_name, type, title, message, acknowledged, created_at)
VALUES
  ('Router-Lab-03', 'critical', 'Interface Down', 'Router-Lab-03 interface eth0 is down', false, now() - interval '2 hours 15 minutes'),
  ('Router-Main-01', 'warning', 'High CPU Usage', 'CPU usage exceeded 75% threshold on Router-Main-01', false, now() - interval '1 hour 45 minutes'),
  ('Router-Lab-03', 'warning', 'High Memory Usage', 'Memory usage at 85% on Router-Lab-03', true, now() - interval '3 hours 30 minutes'),
  ('Router-Harare-01', 'info', 'Maintenance Completed', 'Scheduled maintenance completed successfully', true, now() - interval '5 hours'),
  ('Router-Main-01', 'warning', 'Bandwidth Threshold', 'Bandwidth usage exceeded 80% on main link', true, now() - interval '8 hours'),
  ('Router-Harare-01', 'critical', 'Port Scan Detected', 'Potential port scanning activity from 10.1.23.45', false, now() - interval '30 minutes'),
  ('Router-Mutare-01', 'info', 'Firmware Update Available', 'New firmware 16.9.4 is available for Router-Mutare-01', false, now() - interval '1 day');

-- ─── Sample Traffic Data ──────────────────────────────────────────────────────
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

-- ─── Sample Anomalies ─────────────────────────────────────────────────────────
INSERT INTO anomalies (router_name, type, severity, description, confidence, resolved, detected_at)
VALUES
  ('Router-Lab-03', 'Traffic Spike', 'high', 'Unusual traffic spike detected - 300% above baseline', 94, false, now() - interval '1 hour 20 minutes'),
  ('Router-Main-01', 'CPU Pattern', 'medium', 'Abnormal CPU usage pattern detected', 87, false, now() - interval '2 hours 30 minutes'),
  ('Router-Harare-01', 'Port Scan', 'high', 'Potential port scanning activity detected from external IP', 91, false, now() - interval '40 minutes'),
  ('Router-Bulawayo-01', 'Bandwidth Anomaly', 'low', 'Slight deviation in bandwidth usage pattern - monitoring', 72, true, now() - interval '1 day'),
  ('Router-Main-01', 'Login Failures', 'medium', 'Multiple failed login attempts to management interface', 88, false, now() - interval '3 hours');

-- ─── Sample Predictions ───────────────────────────────────────────────────────
INSERT INTO predictions (metric, current_value, predicted_value, unit, timeframe, confidence)
VALUES
  ('Bandwidth Usage', 2.4, 3.1, 'Gbps', 'Next 7 days', 88),
  ('Peak Connections', 1234, 1580, 'connections', 'Next 24 hours', 92),
  ('Storage Usage', 67, 78, '%', 'Next 30 days', 85),
  ('CPU Load (Main Router)', 42.5, 67.0, '%', 'Next 48 hours', 79),
  ('Active Devices', 636, 720, 'devices', 'Next 7 days', 83);

-- ─── Sample Reports ───────────────────────────────────────────────────────────
INSERT INTO reports (title, type, date_range, format, status, size_bytes, created_at)
VALUES
  ('Weekly Traffic Summary', 'Traffic Analysis', 'Last 7 Days', 'PDF', 'ready', 2411724, now() - interval '2 days'),
  ('Monthly Network Performance', 'Performance Report', 'Last 30 Days', 'PDF', 'ready', 4929945, now() - interval '15 days'),
  ('Anomaly Detection Summary', 'AI Analytics', 'Last 14 Days', 'PDF', 'ready', 1887436, now() - interval '1 day'),
  ('Bandwidth Utilization Q1', 'Capacity Planning', 'Last 90 Days', 'Excel', 'ready', 3355443, now() - interval '30 days'),
  ('Security Events Log', 'Security Report', 'Last 7 Days', 'CSV', 'ready', 5349000, now() - interval '3 hours');
