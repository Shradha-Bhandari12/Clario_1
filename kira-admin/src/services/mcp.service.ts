import { createClient } from '@/lib/supabase/client';
import type { McpTool } from '@/types';

const supabase = () => createClient();

export const mcpService = {
    async getAll() {
        const { data, error } = await supabase()
            .from('mcp_tools')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as McpTool[];
    },

    async create(tool: Partial<McpTool>) {
        const { data, error } = await supabase()
            .from('mcp_tools')
            .insert(tool)
            .select()
            .single();
        if (error) throw error;
        return data as McpTool;
    },

    async update(id: string, updates: Partial<McpTool>) {
        const { data, error } = await supabase()
            .from('mcp_tools')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as McpTool;
    },

    async delete(id: string) {
        const { error } = await supabase()
            .from('mcp_tools')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
