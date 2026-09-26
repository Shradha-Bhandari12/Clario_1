import { createClient } from '@/lib/supabase/client';
import type { Workflow, WorkflowVersion } from '@/types';

const supabase = () => createClient();

export const workflowService = {
    async getAll() {
        const { data, error } = await supabase()
            .from('workflows')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data as Workflow[];
    },

    async getById(id: string) {
        const { data, error } = await supabase()
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as Workflow;
    },

    async create(workflow: Partial<Workflow>) {
        const { data, error } = await supabase()
            .from('workflows')
            .insert(workflow)
            .select()
            .single();
        if (error) throw error;
        return data as Workflow;
    },

    async update(id: string, updates: Partial<Workflow>) {
        const { data, error } = await supabase()
            .from('workflows')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Workflow;
    },

    async delete(id: string) {
        const { error } = await supabase()
            .from('workflows')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async getVersions(workflowId: string) {
        const { data, error } = await supabase()
            .from('workflow_versions')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('version', { ascending: false });
        if (error) throw error;
        return data as WorkflowVersion[];
    },

    async createVersion(version: Partial<WorkflowVersion>) {
        const { data, error } = await supabase()
            .from('workflow_versions')
            .insert(version)
            .select()
            .single();
        if (error) throw error;
        return data as WorkflowVersion;
    },
};
