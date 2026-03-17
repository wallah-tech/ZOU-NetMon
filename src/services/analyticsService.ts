import { supabase } from './supabase';

export interface Anomaly {
  id: string;
  router_name: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  confidence: number;
  resolved: boolean;
  detected_at: string;
}

export interface Prediction {
  id: string;
  metric: string;
  current_value: number;
  predicted_value: number;
  unit: string;
  timeframe: string;
  confidence: number;
  created_at: string;
}

export const analyticsService = {
  async getAnomalies(): Promise<Anomaly[]> {
    const { data, error } = await supabase
      .from('anomalies')
      .select('*')
      .order('detected_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async resolveAnomaly(id: string): Promise<void> {
    const { error } = await supabase
      .from('anomalies')
      .update({ resolved: true })
      .eq('id', id);
    if (error) throw error;
  },

  async getPredictions(): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAnomalyTimeline(): Promise<{ date: string; high: number; medium: number; low: number }[]> {
    const { data, error } = await supabase
      .from('anomalies')
      .select('severity, detected_at')
      .gte('detected_at', new Date(Date.now() - 7 * 86400 * 1000).toISOString())
      .order('detected_at', { ascending: true });
    if (error) throw error;
    const byDay: Record<string, { high: number; medium: number; low: number }> = {};
    for (const a of data || []) {
      const day = new Date(a.detected_at).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric' });
      if (!byDay[day]) byDay[day] = { high: 0, medium: 0, low: 0 };
      if (a.severity === 'high') byDay[day].high++;
      else if (a.severity === 'medium') byDay[day].medium++;
      else byDay[day].low++;
    }
    return Object.entries(byDay).map(([date, v]) => ({ date, ...v }));
  },

  subscribeToChanges(callback: () => void) {
    return supabase
      .channel('public:analytics_tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomalies' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, callback)
      .subscribe();
  },
};
