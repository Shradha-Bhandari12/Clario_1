'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, GitBranch, ExternalLink, MoreHorizontal, Trash2, Play } from 'lucide-react';
import { workflowService } from '@/services/workflow.service';
import { useToastStore } from '@/stores/toast-store';
import { useAuthStore } from '@/stores/auth-store';
import { RequireRole } from '@/components/ui/require-role';
import { TableSkeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import type { Workflow, WorkflowStatus, TriggerType } from '@/types';

const STATUS_STYLES: Record<WorkflowStatus, string> = {
    active: 'bg-accent/10 text-accent border border-accent/20 dark:bg-accent/20 dark:text-accent-foreground',
    disabled: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    archived: 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
};

const TRIGGER_ICONS: Record<TriggerType, string> = {
    webhook: '🔗', schedule: '⏰', event: '⚡', api: '🔌',
};

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const addToast = useToastStore((s) => s.addToast);
    const user = useAuthStore((s) => s.user);

    const loadWorkflows = async () => {
        try {
            const data = await workflowService.getAll();
            setWorkflows(data);
        } catch {
            addToast('Failed to load workflows', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadWorkflows(); }, []);

    const filtered = workflows.filter((wf) => {
        const matchesSearch = wf.name.toLowerCase().includes(search.toLowerCase()) ||
            wf.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || wf.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this workflow? This cannot be undone.')) return;
        try {
            await workflowService.delete(id);
            setWorkflows((prev) => prev.filter((w) => w.id !== id));
            addToast('Workflow deleted');
        } catch {
            addToast('Failed to delete workflow', 'error');
        }
    };

    if (loading) return <TableSkeleton rows={6} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
                <RequireRole permission="workflows.create">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> New Workflow
                    </button>
                </RequireRole>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                    {['all', 'active', 'disabled', 'archived'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                                statusFilter === s
                                    ? 'bg-accent text-white'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Name</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Trigger</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Version</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">MCP</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Updated</th>
                            <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((wf, i) => (
                            <motion.tr
                                key={wf.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <Link href={`/workflows/${wf.id}`} className="font-semibold text-sm hover:text-accent transition-colors">
                                        {wf.name}
                                    </Link>
                                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{wf.description}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm">{TRIGGER_ICONS[wf.trigger_type]} {wf.trigger_type}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-mono">v{wf.version}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[wf.status])}>
                                        {wf.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {wf.mcp_exposed ? (
                                        <span className="text-xs text-accent font-medium">Exposed</span>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500">{formatDate(wf.updated_at)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link href={`/workflows/${wf.id}`} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                        </Link>
                                        <RequireRole permission="workflows.delete">
                                            <button onClick={() => handleDelete(wf.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        </RequireRole>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="py-12 text-center text-sm text-slate-400">
                        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No workflows found
                    </div>
                )}
            </div>
        </div>
    );
}
