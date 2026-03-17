/*
  # Create routers table

  1. New Tables
    - `routers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `ip_address` (text, unique, not null)
      - `location` (text, not null)
      - `model` (text)
      - `firmware_version` (text)
      - `status` (text, default 'online')
      - `snmp_enabled` (boolean, default false)
      - `netflow_enabled` (boolean, default false)
      - `sflow_enabled` (boolean, default false)
      - `cpu_usage` (float, default 0)
      - `memory_usage` (float, default 0)
      - `uptime_seconds` (bigint, default 0)
      - `connected_devices` (integer, default 0)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `routers` table
    - Add policies for read/create/update/delete operations
*/

CREATE TABLE IF NOT EXISTS routers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ip_address text UNIQUE NOT NULL,
  location text NOT NULL,
  model text,
  firmware_version text,
  status text DEFAULT 'online',
  snmp_enabled boolean DEFAULT false,
  netflow_enabled boolean DEFAULT false,
  sflow_enabled boolean DEFAULT false,
  cpu_usage float DEFAULT 0,
  memory_usage float DEFAULT 0,
  uptime_seconds bigint DEFAULT 0,
  connected_devices integer DEFAULT 0,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE routers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read routers"
  ON routers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can create routers"
  ON routers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Everyone can update routers"
  ON routers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Everyone can delete routers"
  ON routers FOR DELETE
  TO authenticated
  USING (true);
