import { supabase } from './supabase';

export interface Settings {
  id: number;
  snmp_version: string;
  polling_interval: number;
  netflow_port: number;
  sflow_port: number;
  cpu_alert_threshold: number;
  memory_alert_threshold: number;
  bandwidth_threshold: number;
  email_notifications: boolean;
  data_retention_days: number;
  auto_archive: boolean;
  two_factor_auth: boolean;
  session_timeout_minutes: number;
  updated_at: string;
}

export const defaultSettings: Omit<Settings, 'id' | 'updated_at'> = {
  snmp_version: 'SNMPv2c',
  polling_interval: 60,
  netflow_port: 2055,
  sflow_port: 6343,
  cpu_alert_threshold: 75,
  memory_alert_threshold: 80,
  bandwidth_threshold: 85,
  email_notifications: true,
  data_retention_days: 90,
  auto_archive: true,
  two_factor_auth: true,
  session_timeout_minutes: 30,
};

export const settingsService = {
  async getSettings(): Promise<Settings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      // First-time: insert defaults
      const { data: inserted, error: insertErr } = await supabase
        .from('settings')
        .insert([{ id: 1, ...defaultSettings }])
        .select()
        .single();
      if (insertErr) throw insertErr;
      return inserted;
    }
    return data;
  },

  async saveSettings(settings: Partial<Omit<Settings, 'id' | 'updated_at'>>): Promise<Settings> {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        id: 1,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
