import type { NavItem, UserRole } from '@/types';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'KIRA Admin';
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';

export const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    designer: 'Designer',
    viewer: 'Viewer',
};

export const ROLE_COLORS: Record<UserRole, string> = {
    super_admin: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900',
    admin: 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent-foreground',
    designer: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
    viewer: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50',
};

export const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Workflows', href: '/workflows', icon: 'GitBranch' },
    { label: 'Builder', href: '/builder', icon: 'Blocks', roles: ['super_admin', 'admin', 'designer'] },
    { label: 'MCP Registry', href: '/mcp', icon: 'Cpu' },
    { label: 'Scheduler', href: '/scheduler', icon: 'Clock', roles: ['super_admin', 'admin'] },
    { label: 'Logs', href: '/logs', icon: 'ScrollText' },
    { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    { label: 'Webhook Playground', href: '/webhook-playground', icon: 'Webhook', roles: ['super_admin', 'admin', 'designer'] },
    { label: 'Users', href: '/users', icon: 'Users', roles: ['super_admin', 'admin'] },
    { label: 'Settings', href: '/settings', icon: 'Settings', roles: ['super_admin', 'admin'] },
];
