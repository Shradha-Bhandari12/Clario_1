'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Play, GitCompare, Clock, Tag, Cpu, Shield } from 'lucide-react';
import { workflowService } from '@/services/workflow.service';
import { useToastStore } from '@/stores/toast-store';
import { RequireRole } from '@/components/ui/require-role';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import type { Workflow, WorkflowVersion } from '@/types';
import Link from 'next/link';

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [versions, setVersions] = useState<WorkflowVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'versions'>('overview');
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        const load = async () => {
            try {
                const [wf, vers] = await Promise.all([
                    workflowService.getById(id),
                    workflowService.getVersions(id),
                ]);
                setWorkflow(wf);
                setVersions(vers);
            } catch {
                addToast('Failed to load workflow', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="grid grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
    if (!workflow) return <div className="text-center py-12 text-slate-400">Workflow not found</div>;

    const tabs = ['overview', 'schema', 'versions'] as const;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/workflows" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{workflow.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <RequireRole permission="workflows.edit">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </RequireRole>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'px-4 py-2.5 text-sm font-medium transition-colors relative capitalize',
                            activeTab === tab
                                ? 'text-accent'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Details */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <h3 className="font-semibold mb-4">Details</h3>
                        <div className="space-y-3">
                            {[
                                { icon: Tag, label: 'Trigger', value: workflow.trigger_type },
                                { icon: Clock, label: 'Version', value: `v${workflow.version}` },
                                { icon: Shield, label: 'Scope', value: workflow.permission_scope },
                                { icon: Cpu, label: 'MCP Exposed', value: workflow.mcp_exposed ? 'Yes' : 'No' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <item.icon className="w-4 h-4" /> {item.label}
                                    </div>
                                    <span className="text-sm font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags & metadata */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <h3 className="font-semibold mb-4">Metadata</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-slate-400 block mb-2">Tags</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {workflow.tags?.map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full">{tag}</span>
                                    ))}
                                    {(!workflow.tags || workflow.tags.length === 0) && <span className="text-xs text-slate-400">No tags</span>}
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Created</span>
                                    <span>{formatDate(workflow.created_at)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-slate-400">Last Updated</span>
                                    <span>{formatDate(workflow.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'schema' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Input / Output Schema</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Input Schema</span>
                            <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs font-mono overflow-auto max-h-80">
                                {JSON.stringify(workflow.input_schema, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Output Schema</span>
                            <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs font-mono overflow-auto max-h-80">
                                {JSON.stringify(workflow.output_schema, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'versions' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Version History</h3>
                        <span className="text-xs text-slate-400">Current: v{workflow.version}</span>
                    </div>
                    {versions.length > 0 ? (
                        <div className="space-y-2">
                            {versions.map((v) => (
                                <div key={v.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-medium">v{v.version}</span>
                                        <span className="text-sm text-slate-500">{v.note || 'No description'}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{formatDate(v.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-8">No version history available</p>
                    )}
                </div>
            )}
        </div>
    );
}
