import { createClient } from '@/lib/supabase/client';
import type { Log } from '@/types';

const supabase = () => createClient();

export const analyticsService = {
    async getLogs(filters?: { type?: string; status?: string; limit?: number }) {
        let query = supabase()
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.status) query = query.eq('status', filters.status);
        query = query.limit(filters?.limit || 50);

        const { data, error } = await query;
        if (error) throw error;
        return data as Log[];
    },

    async insertLog(log: Partial<Log>) {
        const { data, error } = await supabase()
            .from('logs')
            .insert(log)
            .select()
            .single();
        if (error) throw error;
        return data as Log;
    },

    async getMetrics() {
        const { data: workflows } = await supabase()
            .from('workflows')
            .select('id, status');
        const { data: mcpTools } = await supabase()
            .from('mcp_tools')
            .select('id, status');
        const { data: recentLogs } = await supabase()
            .from('logs')
            .select('id, status, created_at')
            .gte('created_at', new Date(Date.now() - 86400000).toISOString());

        const totalWorkflows = workflows?.length || 0;
        const activeWorkflows = workflows?.filter((w) => w.status === 'active').length || 0;
        const activeTools = mcpTools?.filter((t) => t.status === 'active').length || 0;
        const failedLast24h = recentLogs?.filter((l) => l.status === 'error').length || 0;

        return { totalWorkflows, activeWorkflows, activeTools, failedLast24h };
    },
};
