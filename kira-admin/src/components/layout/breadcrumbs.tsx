'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    workflows: 'Workflows',
    builder: 'Builder',
    mcp: 'MCP Registry',
    scheduler: 'Scheduler',
    logs: 'Logs',
    analytics: 'Analytics',
    'webhook-playground': 'Webhook Playground',
    users: 'Users',
    settings: 'Settings',
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length <= 1) return null;

    const crumbs = segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = ROUTE_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const isLast = i === segments.length - 1;
        return { href, label, isLast };
    });

    return (
        <nav className="flex items-center gap-1.5 text-sm mb-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <Home className="w-3.5 h-3.5" />
            </Link>
            {crumbs.map((crumb) => (
                <div key={crumb.href} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                    {crumb.isLast ? (
                        <span className="font-medium text-slate-700 dark:text-slate-200">{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
