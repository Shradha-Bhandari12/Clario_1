'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, GitBranch, Blocks, Cpu, Clock,
    ScrollText, BarChart3, Webhook, Users, Settings,
    ChevronLeft, LogOut, Search, Bell
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { createClient } from '@/lib/supabase/client';
import { NAV_ITEMS, APP_NAME, APP_ENV, ROLE_LABELS, ROLE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import type { ReactNode } from 'react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard, GitBranch, Blocks, Cpu, Clock,
    ScrollText, BarChart3, Webhook, Users, Settings,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const hasRole = useAuthStore((s) => s.hasRole);
    const { isCollapsed, toggle } = useSidebarStore();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.roles || (user && hasRole(item.roles))
    );

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                animate={{ width: isCollapsed ? 72 : 260 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col border-r border-sidebar dark:border-border bg-sidebar shrink-0"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 h-[56px] px-4 border-b border-sidebar-active/50">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm">K</span>
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                <span className="font-semibold text-sm tracking-tight text-white">{APP_NAME}</span>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[10px] text-white capitalize">{APP_ENV}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                    {visibleItems.map((item) => {
                        const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative group',
                                    isActive
                                        ? 'bg-sidebar-active text-sidebar-active-foreground font-medium'
                                        : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-white'
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <Icon className="w-[18px] h-[18px] shrink-0" />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="overflow-hidden whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle */}
                <div className="px-2 py-2 border-t border-sidebar-active/50">
                    <button
                        onClick={toggle}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition-colors"
                    >
                        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronLeft className="w-[18px] h-[18px]" />
                        </motion.div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    Collapse
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-[56px] border-b border-border bg-white dark:bg-sidebar flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-background dark:bg-sidebar-hover border border-border rounded-lg text-sm text-foreground/60 hover:text-foreground transition-colors min-w-[240px]">
                            <Search className="w-4 h-4" />
                            <span>Search...</span>
                            <kbd className="ml-auto text-[10px] bg-background dark:bg-sidebar px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Dark mode */}
                        <DarkModeToggle />

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg hover:bg-background dark:hover:bg-sidebar-hover transition-colors">
                            <Bell className="w-[18px] h-[18px] text-foreground/60" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                        </button>

                        {/* User */}
                        {user && (
                            <div className="flex items-center gap-3 pl-3 border-l border-border">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[13px] font-medium leading-none mb-1">{user.full_name}</div>
                                    <span className={cn('inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border border-border bg-background', ROLE_COLORS[user.role])}>
                                        {ROLE_LABELS[user.role]}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                                    {user.full_name.charAt(0)}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 rounded-lg hover:bg-background dark:hover:bg-sidebar-hover transition-colors"
                                    title="Sign out"
                                >
                                    <LogOut className="w-4 h-4 text-foreground/40" />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-background p-6">
                    <Breadcrumbs />
                    {children}
                </main>
            </div>
        </div>
    );
}
