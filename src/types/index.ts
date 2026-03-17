export interface Router {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  cpu: number;
  memory: number;
  uptime: string;
  interfaces: Interface[];
}

export interface Interface {
  id: string;
  name: string;
  status: 'up' | 'down';
  bandwidth: number;
  inbound: number;
  outbound: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  router: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface TrafficData {
  timestamp: string;
  inbound: number;
  outbound: number;
  total: number;
}

export interface Anomaly {
  id: string;
  router: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  timestamp: string;
  confidence: number;
}

export interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  timeframe: string;
  confidence: number;
}
