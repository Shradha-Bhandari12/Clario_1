'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Key, Database, Shield, Bell, Globe } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';
import { cn } from '@/lib/utils';

const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'database', label: 'Database', icon: Database },
] as const;

type TabId = typeof TABS[number]['id'];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const addToast = useToastStore((s) => s.addToast);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system configuration</p>
            </div>

            <div className="flex gap-6">
                {/* Tab list */}
                <nav className="w-48 shrink-0 space-y-0.5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                                activeTab === tab.id
                                    ? 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-foreground font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            )}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Tab content */}
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                    {activeTab === 'general' && (
                        <div>
                            <h3 className="font-semibold mb-4">General Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Application Name</label>
                                    <input type="text" defaultValue="KIRA Admin" className="w-full max-w-md px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Environment</label>
                                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                        <option>Development</option>
                                        <option>Staging</option>
                                        <option>Production</option>
                                    </select>
                                </div>
                                <button onClick={() => addToast('Settings saved')} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors mt-2">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h3 className="font-semibold mb-4">Security Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="text-sm font-medium">Two-Factor Authentication</div>
                                        <div className="text-xs text-slate-400">Require 2FA for all admin accounts</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-accent rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                                    </label>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="text-sm font-medium">Session Timeout</div>
                                        <div className="text-xs text-slate-400">Auto-logout after inactivity</div>
                                    </div>
                                    <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm">
                                        <option>30 minutes</option>
                                        <option>1 hour</option>
                                        <option>4 hours</option>
                                        <option>Never</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="text-sm font-medium">IP Allowlisting</div>
                                        <div className="text-xs text-slate-400">Restrict access to specific IPs</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-accent rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h3 className="font-semibold mb-4">Notification Preferences</h3>
                            <div className="space-y-3">
                                {['Workflow failures', 'Scheduled job completions', 'Security alerts', 'MCP tool errors'].map((item) => (
                                    <div key={item} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <span className="text-sm">{item}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-accent rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div>
                            <h3 className="font-semibold mb-4">API Keys</h3>
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium font-mono">kira_live_••••••••••••abcd</div>
                                        <div className="text-xs text-slate-400 mt-1">Created Jan 15, 2026</div>
                                    </div>
                                    <button className="text-xs text-red-500 hover:underline">Revoke</button>
                                </div>
                            </div>
                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Generate New Key
                            </button>
                        </div>
                    )}

                    {activeTab === 'database' && (
                        <div>
                            <h3 className="font-semibold mb-4">Database</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-500">Provider</span>
                                    <span className="text-sm font-medium">Supabase (PostgreSQL)</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-500">Region</span>
                                    <span className="text-sm font-medium">ap-south-1</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-500">RLS</span>
                                    <span className="text-sm font-medium text-emerald-600">Enabled</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
