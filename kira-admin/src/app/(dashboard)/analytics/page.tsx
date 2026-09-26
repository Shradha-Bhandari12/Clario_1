'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { useToastStore } from '@/stores/toast-store';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<{ totalWorkflows: number; activeWorkflows: number; activeTools: number; failedLast24h: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        analyticsService.getMetrics().then(setMetrics).catch(() => addToast('Failed to load metrics', 'error')).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="grid grid-cols-4 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;

    const cards = [
        { label: 'Total Workflows', value: metrics?.totalWorkflows ?? 0, icon: BarChart3, color: 'bg-accent', trend: '+12%', up: true },
        { label: 'Active Workflows', value: metrics?.activeWorkflows ?? 0, icon: TrendingUp, color: 'bg-slate-800 dark:bg-slate-100 dark:!text-slate-900', trend: '+5%', up: true },
        { label: 'MCP Tools Active', value: metrics?.activeTools ?? 0, icon: Clock, color: 'bg-accent/40', trend: '0%', up: true },
        { label: 'Failed (24h)', value: metrics?.failedLast24h ?? 0, icon: AlertTriangle, color: 'bg-red-500', trend: '-8%', up: false },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System metrics and performance data</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-500">{card.label}</span>
                            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                                <card.icon className={cn('w-4 h-4 text-white', card.color.includes('dark:!text-slate-900') && 'dark:text-slate-900')} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <div className={cn('text-xs mt-1 flex items-center gap-1', card.up ? 'text-emerald-600' : 'text-red-500')}>
                            {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {card.trend} vs last week
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Execution Trends</h3>
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Chart visualization — Phase 9 enhancement</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Tool Popularity</h3>
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Chart visualization — Phase 9 enhancement</div>
                </div>
            </div>
        </div>
    );
}
