'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Plus, RefreshCw, Shield } from 'lucide-react';
import { mcpService } from '@/services/mcp.service';
import { useToastStore } from '@/stores/toast-store';
import { RequireRole } from '@/components/ui/require-role';
import { TableSkeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import type { McpTool } from '@/types';

export default function McpPage() {
    const [tools, setTools] = useState<McpTool[]>([]);
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        mcpService.getAll().then(setTools).catch(() => addToast('Failed to load MCP tools', 'error')).finally(() => setLoading(false));
    }, []);

    const toggleStatus = async (tool: McpTool) => {
        try {
            const updated = await mcpService.update(tool.id, { status: tool.status === 'active' ? 'disabled' : 'active' });
            setTools((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            addToast(`Tool ${updated.status === 'active' ? 'enabled' : 'disabled'}`);
        } catch { addToast('Failed to update tool', 'error'); }
    };

    if (loading) return <TableSkeleton rows={4} />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">MCP Tool Registry</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tools.length} tools registered</p>
                </div>
                <RequireRole permission="mcp.create">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Register Tool
                    </button>
                </RequireRole>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, i) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <Cpu className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">{tool.tool_name}</h3>
                                    <span className="text-[10px] text-slate-400 font-mono">v{tool.version}</span>
                                </div>
                            </div>
                            <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                                tool.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                            )}>
                                {tool.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{tool.description || 'No description'}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Shield className="w-3 h-3" /> {tool.permission_scope}
                            </div>
                            <RequireRole permission="mcp.manage">
                                <button onClick={() => toggleStatus(tool)} className="text-xs text-accent hover:underline font-medium">
                                    {tool.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                            </RequireRole>
                        </div>
                    </motion.div>
                ))}
            </div>

            {tools.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <Cpu className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No MCP tools registered</p>
                </div>
            )}
        </div>
    );
}
