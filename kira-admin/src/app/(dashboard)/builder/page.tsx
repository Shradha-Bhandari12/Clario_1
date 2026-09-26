'use client';

import { Blocks } from 'lucide-react';

export default function BuilderPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Workflow Builder</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visual drag-and-drop workflow editor</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 min-h-[500px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center mb-4">
                    <Blocks className="w-8 h-8 text-violet-500/60" />
                </div>
                <h3 className="text-lg font-semibold mb-2">React Flow Builder</h3>
                <p className="text-sm text-slate-400 text-center max-w-md mb-4">
                    The visual workflow builder will be powered by React Flow with drag-and-drop nodes,
                    edge connections, and bi-directional sync with the workflow schema.
                </p>
                <span className="text-xs px-3 py-1 bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full font-medium">
                    Phase 6 — React Flow Integration
                </span>
            </div>
        </div>
    );
}
