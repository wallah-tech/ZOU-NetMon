import { supabase } from './supabase';
import { Router, CreateRouterInput } from '../types/router';

export const routerService = {
  async getRouters(): Promise<Router[]> {
    const { data, error } = await supabase
      .from('routers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRouter(id: string): Promise<Router | null> {
    const { data, error } = await supabase
      .from('routers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createRouter(input: CreateRouterInput): Promise<Router> {
    const { data, error } = await supabase
      .from('routers')
      .insert([{
        name: input.name,
        ip_address: input.ip_address,
        location: input.location,
        model: input.model || null,
        firmware_version: input.firmware_version || null,
        snmp_enabled: input.snmp_enabled || false,
        netflow_enabled: input.netflow_enabled || false,
        sflow_enabled: input.sflow_enabled || false,
        status: 'online',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRouter(id: string, input: Partial<CreateRouterInput>): Promise<Router> {
    const { data, error } = await supabase
      .from('routers')
      .update({
        ...(input.name && { name: input.name }),
        ...(input.ip_address && { ip_address: input.ip_address }),
        ...(input.location && { location: input.location }),
        ...(input.model !== undefined && { model: input.model }),
        ...(input.firmware_version !== undefined && { firmware_version: input.firmware_version }),
        ...(input.snmp_enabled !== undefined && { snmp_enabled: input.snmp_enabled }),
        ...(input.netflow_enabled !== undefined && { netflow_enabled: input.netflow_enabled }),
        ...(input.sflow_enabled !== undefined && { sflow_enabled: input.sflow_enabled }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRouter(id: string): Promise<void> {
    const { error } = await supabase
      .from('routers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
