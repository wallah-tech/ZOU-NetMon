export interface Router {
  id: string;
  name: string;
  ip_address: string;
  location: string;
  model?: string;
  firmware_version?: string;
  status: 'online' | 'offline' | 'warning';
  snmp_enabled: boolean;
  netflow_enabled: boolean;
  sflow_enabled: boolean;
  cpu_usage: number;
  memory_usage: number;
  uptime_seconds: number;
  connected_devices: number;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRouterInput {
  name: string;
  ip_address: string;
  location: string;
  model?: string;
  firmware_version?: string;
  snmp_enabled?: boolean;
  netflow_enabled?: boolean;
  sflow_enabled?: boolean;
}

export interface UpdateRouterInput extends Partial<CreateRouterInput> {
  id: string;
}
