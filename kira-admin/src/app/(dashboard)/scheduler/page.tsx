'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Play, Pause, Trash2, RotateCw } from 'lucide-react';
import { schedulerService } from '@/services/scheduler.service';
import { useToastStore } from '@/stores/toast-store';
import { RequireRole } from '@/components/ui/require-role';
import { TableSkeleton } from '@/components/ui/skeleton';
import { cn, formatDateTime } from '@/lib/utils';
import type { ScheduledJob } from '@/types';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-accent/10 text-accent border border-accent/20',
    paused: 'bg-amber-50 text-amber-600 border border-amber-100',
    completed: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    failed: 'bg-red-50 text-red-600 border border-red-100',
};

export default function SchedulerPage() {
    const [jobs, setJobs] = useState<ScheduledJob[]>([]);
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        schedulerService.getAll().then(setJobs).catch(() => addToast('Failed to load jobs', 'error')).finally(() => setLoading(false));
    }, []);

    const toggleJob = async (job: ScheduledJob) => {
        try {
            const newStatus = job.status === 'active' ? 'paused' : 'active';
            const updated = await schedulerService.update(job.id, { status: newStatus });
            setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
            addToast(`Job ${newStatus === 'active' ? 'resumed' : 'paused'}`);
        } catch { addToast('Failed to update job', 'error'); }
    };

    const deleteJob = async (id: string) => {
        if (!confirm('Delete this scheduled job?')) return;
        try {
            await schedulerService.delete(id);
            setJobs((prev) => prev.filter((j) => j.id !== id));
            addToast('Job deleted');
        } catch { addToast('Failed to delete job', 'error'); }
    };

    if (loading) return <TableSkeleton rows={4} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scheduler</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{jobs.length} scheduled jobs</p>
                </div>
                <RequireRole permission="scheduler.manage">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> New Job
                    </button>
                </RequireRole>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Workflow</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Cron</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Last Run</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Next Run</th>
                            <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {jobs.map((job, i) => (
                            <motion.tr
                                key={job.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <span className="text-sm font-medium font-mono truncate block max-w-[200px]">{job.workflow_id}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">{job.cron_expression}</code>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[job.status])}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500">{job.last_run ? formatDateTime(job.last_run) : '—'}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">{job.next_run ? formatDateTime(job.next_run) : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <RequireRole permission="scheduler.manage">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => toggleJob(job)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={job.status === 'active' ? 'Pause' : 'Resume'}>
                                                {job.status === 'active' ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-accent" />}
                                            </button>
                                            <button onClick={() => deleteJob(job.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        </div>
                                    </RequireRole>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {jobs.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No scheduled jobs</p>
                    </div>
                )}
            </div>
        </div>
    );
}
