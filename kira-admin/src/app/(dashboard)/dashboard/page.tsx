import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Overview and system health
                </p>
            </div>

            {/* Metric cards placeholder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Workflows', value: '—', color: 'bg-accent' },
                    { label: 'Active Workflows', value: '—', color: 'bg-slate-800 dark:bg-slate-100 dark:text-slate-900' },
                    { label: 'Active MCP Tools', value: '—', color: 'bg-accent/40' },
                    { label: 'Failed (24h)', value: '—', color: 'bg-red-500' },
                ].map((m) => (
                    <div
                        key={m.label}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-500 dark:text-slate-400">{m.label}</span>
                            <div className={`w-8 h-8 rounded-lg ${m.color} flex items-center justify-center`}>
                                <div className="w-4 h-4 rounded-sm border border-white/20" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{m.value}</div>
                        <div className="text-xs text-slate-400 mt-1">Loading...</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Chart placeholder */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Workflow Usage (Last 7 Days)</h3>
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                        Chart will be rendered in Phase 8
                    </div>
                </div>

                {/* Activity placeholder */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                        Activity feed will be rendered in Phase 8
                    </div>
                </div>
            </div>
        </div>
    );
}
