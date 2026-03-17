import { supabase } from './supabase';

export interface Alert {
  id: string;
  router_name: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export type AlertFilter = 'all' | 'unacknowledged' | 'critical';

export const alertService = {
  async getAlerts(filter: AlertFilter = 'all'): Promise<Alert[]> {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'unacknowledged') {
      query = query.eq('acknowledged', false);
    } else if (filter === 'critical') {
      query = query.eq('type', 'critical');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async acknowledgeAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', id);
    if (error) throw error;
  },

  async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alert])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getAlertCounts(): Promise<{ total: number; critical: number; warnings: number; acknowledged: number }> {
    const { data, error } = await supabase
      .from('alerts')
      .select('type, acknowledged');
    if (error) throw error;
    const alerts = data || [];
    return {
      total: alerts.filter(a => !a.acknowledged).length,
      critical: alerts.filter(a => a.type === 'critical' && !a.acknowledged).length,
      warnings: alerts.filter(a => a.type === 'warning' && !a.acknowledged).length,
      acknowledged: alerts.filter(a => a.acknowledged).length,
    };
  },

  subscribeToChanges(callback: () => void) {
    return supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, callback)
      .subscribe();
  },
};
