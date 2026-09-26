'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Webhook, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { useToastStore } from '@/stores/toast-store';

interface WebhookResult {
    status: number;
    statusText: string;
    duration: number;
    body: Record<string, unknown>;
    timestamp: string;
}

export default function WebhookPlaygroundPage() {
    const [url, setUrl] = useState('https://api.example.com/webhook');
    const [method, setMethod] = useState('POST');
    const [payload, setPayload] = useState(JSON.stringify({ event: 'workflow.completed', workflow_id: 'wf_001', timestamp: new Date().toISOString() }, null, 2));
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState<WebhookResult[]>([]);
    const addToast = useToastStore((s) => s.addToast);

    const handleSend = async () => {
        setSending(true);
        const start = Date.now();

        // Simulate webhook call
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500));
        const duration = Date.now() - start;
        const success = Math.random() > 0.2;

        const result: WebhookResult = {
            status: success ? 200 : 500,
            statusText: success ? 'OK' : 'Internal Server Error',
            duration,
            body: success
                ? { received: true, processed: true, id: `evt_${Date.now()}` }
                : { error: 'Webhook processing failed', code: 'INTERNAL_ERROR' },
            timestamp: new Date().toISOString(),
        };

        setResults((prev) => [result, ...prev]);

        // Log to Supabase
        try {
            await analyticsService.insertLog({
                type: 'mcp',
                status: success ? 'success' : 'error',
                message: `Webhook ${method} ${url} — ${result.status}`,
                duration_ms: duration,
                payload: { url, method, request: JSON.parse(payload), response: result.body },
            });
        } catch { /* ignore logging errors */ }

        addToast(success ? 'Webhook sent successfully' : 'Webhook failed', success ? 'success' : 'error');
        setSending(false);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Webhook Playground</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Test webhook endpoints with custom payloads</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Request panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Request</h3>

                    {/* URL + Method */}
                    <div className="flex gap-2 mb-4">
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono font-medium"
                        >
                            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                    </div>

                    {/* Payload */}
                    <div className="mb-4">
                        <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Payload (JSON)</label>
                        <textarea
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            rows={10}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <><Clock className="w-4 h-4 animate-spin" /> Sending...</>
                        ) : (
                            <><Send className="w-4 h-4" /> Send Webhook</>
                        )}
                    </button>
                </div>

                {/* Response panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold mb-4">Responses</h3>

                    {results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Webhook className="w-10 h-10 mb-3 opacity-40" />
                            <p className="text-sm">Send a webhook to see results</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {results.map((r, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-2">
                                            {r.status < 400 ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className="text-sm font-mono font-medium">{r.status} {r.statusText}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">{r.duration}ms</span>
                                    </div>
                                    <pre className="px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 max-h-32 overflow-auto">
                                        {JSON.stringify(r.body, null, 2)}
                                    </pre>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
