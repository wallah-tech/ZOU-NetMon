import { supabase } from './supabase';

export interface TrafficRecord {
  id: string;
  router_name: string;
  inbound_mbps: number;
  outbound_mbps: number;
  total_mbps: number;
  source_ip: string | null;
  destination: string | null;
  protocol: string;
  data_transferred_mb: number;
  duration_minutes: number;
  recorded_at: string;
}

export type TimeRange = 'realtime' | '1h' | '24h' | '7d' | 'custom';

export interface TrafficStats {
  totalMbps: number;
  inboundMbps: number;
  outboundMbps: number;
  topSources: TrafficRecord[];
  timeSeriesData: { time: string; inbound: number; outbound: number; total: number }[];
}

function getIntervalFromRange(range: TimeRange): string {
  switch (range) {
    case 'realtime': return '30 minutes';
    case '1h': return '1 hour';
    case '24h': return '24 hours';
    case '7d': return '7 days';
    default: return '1 hour';
  }
}

export const trafficService = {
  async getTrafficStats(range: TimeRange = '1h'): Promise<TrafficStats> {
    const interval = getIntervalFromRange(range);
    const { data, error } = await supabase
      .from('traffic_data')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    const records: TrafficRecord[] = data || [];

    const totalInbound = records.reduce((s, r) => s + r.inbound_mbps, 0);
    const totalOutbound = records.reduce((s, r) => s + r.outbound_mbps, 0);
    const avgTotal = records.length ? (totalInbound + totalOutbound) / records.length : 0;

    const timeSeriesData = records.map(r => ({
      time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inbound: Math.round(r.inbound_mbps),
      outbound: Math.round(r.outbound_mbps),
      total: Math.round(r.total_mbps),
    }));

    const topSources = [...records]
      .sort((a, b) => b.data_transferred_mb - a.data_transferred_mb)
      .slice(0, 10);

    return {
      totalMbps: Math.round(avgTotal),
      inboundMbps: records.length ? Math.round(totalInbound / records.length) : 0,
      outboundMbps: records.length ? Math.round(totalOutbound / records.length) : 0,
      topSources,
      timeSeriesData,
    };
  },

  async getProtocolBreakdown(range: TimeRange = '24h'): Promise<{ protocol: string; count: number; total_mb: number }[]> {
    const interval = getIntervalFromRange(range);
    const { data, error } = await supabase
      .from('traffic_data')
      .select('protocol, data_transferred_mb')
      .gte('recorded_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString());

    if (error) throw error;
    const records = data || [];
    const byProtocol: Record<string, { count: number; total_mb: number }> = {};
    for (const r of records) {
      if (!byProtocol[r.protocol]) byProtocol[r.protocol] = { count: 0, total_mb: 0 };
      byProtocol[r.protocol].count++;
      byProtocol[r.protocol].total_mb += r.data_transferred_mb;
    }
    return Object.entries(byProtocol).map(([protocol, v]) => ({ protocol, ...v }));
  },
};

function parseIntervalToMs(interval: string): number {
  if (interval.includes('minutes')) return parseInt(interval) * 60 * 1000;
  if (interval.includes('hour')) return parseInt(interval) * 3600 * 1000;
  if (interval.includes('day')) return parseInt(interval) * 86400 * 1000;
  return 3600 * 1000;
}
