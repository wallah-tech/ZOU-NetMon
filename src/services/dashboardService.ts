import { supabase } from './supabase';

export interface DashboardStats {
  totalRouters: number;
  onlineRouters: number;
  activeAlerts: number;
  avgBandwidthMbps: number;
  networkHealth: number;
  campusStatus: { campus: string; status: string; avgLatency: number }[];
}

const campusLatencyMap: Record<string, number> = {
  'Main Campus': 12,
  'Harare Regional': 18,
  'Bulawayo Regional': 24,
  'Mutare Regional': 65,
  'Masvingo Regional': 31,
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [routersRes, alertsRes, trafficRes] = await Promise.all([
      supabase.from('routers').select('status, location, cpu_usage, memory_usage'),
      supabase.from('alerts').select('type, acknowledged'),
      supabase.from('traffic_data').select('total_mbps').gte('recorded_at', new Date(Date.now() - 3600 * 1000).toISOString()),
    ]);

    if (routersRes.error) throw routersRes.error;
    if (alertsRes.error) throw alertsRes.error;
    if (trafficRes.error) throw trafficRes.error;

    const routers = routersRes.data || [];
    const alerts = alertsRes.data || [];
    const traffic = trafficRes.data || [];

    const totalRouters = routers.length;
    const onlineRouters = routers.filter(r => r.status === 'online').length;
    const activeAlerts = alerts.filter(a => !a.acknowledged).length;
    const avgBandwidthMbps = traffic.length
      ? Math.round(traffic.reduce((s, t) => s + t.total_mbps, 0) / traffic.length)
      : 0;
    const avgCpu = routers.length
      ? routers.reduce((s, r) => s + (r.cpu_usage || 0), 0) / routers.length
      : 0;
    const networkHealth = Math.max(0, Math.min(100, Math.round(100 - avgCpu * 0.3 - (activeAlerts * 2))));

    // Build campus status from routers
    const campusByLocation: Record<string, string[]> = {};
    for (const r of routers) {
      if (!campusByLocation[r.location]) campusByLocation[r.location] = [];
      campusByLocation[r.location].push(r.status);
    }
    const campusStatus = Object.entries(campusByLocation).map(([campus, statuses]) => ({
      campus,
      status: statuses.includes('offline') ? 'offline' : statuses.includes('warning') ? 'warning' : 'online',
      avgLatency: campusLatencyMap[campus] || Math.floor(Math.random() * 50 + 10),
    }));

    return {
      totalRouters,
      onlineRouters,
      activeAlerts,
      avgBandwidthMbps,
      networkHealth,
      campusStatus,
    };
  },

  async getBandwidthConsumers(): Promise<{ name: string; usage_mbps: number; percent: number }[]> {
    const { data, error } = await supabase
      .from('traffic_data')
      .select('destination, data_transferred_mb')
      .order('data_transferred_mb', { ascending: false })
      .limit(20);
    if (error) throw error;

    const byDest: Record<string, number> = {};
    for (const r of data || []) {
      const dest = r.destination || 'Unknown';
      byDest[dest] = (byDest[dest] || 0) + r.data_transferred_mb;
    }
    const sorted = Object.entries(byDest)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, total]) => ({
      name: name.replace(/\.zou\.ac\.zw$/, '').replace(/^(\w)/, c => c.toUpperCase()),
      usage_mbps: Math.round(total),
      percent: Math.round((total / max) * 100),
    }));
  },
};
