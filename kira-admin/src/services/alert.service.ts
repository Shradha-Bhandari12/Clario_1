import { createClient } from '@/lib/supabase/client';
import type { Alert } from '@/types';

const supabase = () => createClient();

export const alertService = {
    async getAll() {
        const { data, error } = await supabase()
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Alert[];
    },

    async create(alert: Partial<Alert>) {
        const { data, error } = await supabase()
            .from('alerts')
            .insert(alert)
            .select()
            .single();
        if (error) throw error;
        return data as Alert;
    },

    async update(id: string, updates: Partial<Alert>) {
        const { data, error } = await supabase()
            .from('alerts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Alert;
    },

    async delete(id: string) {
        const { error } = await supabase()
            .from('alerts')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
