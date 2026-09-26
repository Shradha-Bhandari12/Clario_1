import { createClient } from '@/lib/supabase/client';
import type { ScheduledJob } from '@/types';

const supabase = () => createClient();

export const schedulerService = {
    async getAll() {
        const { data, error } = await supabase()
            .from('scheduled_jobs')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as ScheduledJob[];
    },

    async create(job: Partial<ScheduledJob>) {
        const { data, error } = await supabase()
            .from('scheduled_jobs')
            .insert(job)
            .select()
            .single();
        if (error) throw error;
        return data as ScheduledJob;
    },

    async update(id: string, updates: Partial<ScheduledJob>) {
        const { data, error } = await supabase()
            .from('scheduled_jobs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ScheduledJob;
    },

    async delete(id: string) {
        const { error } = await supabase()
            .from('scheduled_jobs')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
