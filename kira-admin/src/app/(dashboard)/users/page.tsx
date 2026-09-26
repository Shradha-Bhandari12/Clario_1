'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Shield, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToastStore } from '@/stores/toast-store';
import { RequireRole } from '@/components/ui/require-role';
import { TableSkeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants';
import type { User, UserRole } from '@/types';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        const load = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setUsers(data as User[]);
            } catch { addToast('Failed to load users', 'error'); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const updateRole = async (userId: string, newRole: UserRole) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase.from('users').update({ role: newRole } as Partial<User>).eq('id', userId).select().single();
            if (error) throw error;
            const updated = data as unknown as User;
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            addToast(`Role updated to ${ROLE_LABELS[newRole]}`);
        } catch { addToast('Failed to update role', 'error'); }
    };

    if (loading) return <TableSkeleton rows={4} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{users.length} users registered</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">User</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Role</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Joined</th>
                            <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((u, i) => (
                            <motion.tr
                                key={u.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {u.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{u.full_name}</div>
                                            <div className="text-xs text-slate-400">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <RequireRole permission="users.roles" fallback={
                                        <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', ROLE_COLORS[u.role])}>
                                            {ROLE_LABELS[u.role]}
                                        </span>
                                    }>
                                        <select
                                            value={u.role}
                                            onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                                            className={cn('px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer focus:ring-2 focus:ring-accent/30', ROLE_COLORS[u.role])}
                                        >
                                            {(['super_admin', 'admin', 'designer', 'viewer'] as UserRole[]).map((r) => (
                                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                            ))}
                                        </select>
                                    </RequireRole>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium border',
                                        u.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800'
                                    )}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500">{formatDate(u.created_at)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                        <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
