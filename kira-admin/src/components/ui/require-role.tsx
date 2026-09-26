'use client';

import { useAuthStore } from '@/stores/auth-store';
import { hasPermission, type Permission } from '@/lib/rbac';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

interface RequireRoleProps {
    roles?: UserRole[];
    permission?: Permission;
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequireRole({ roles, permission, children, fallback = null }: RequireRoleProps) {
    const user = useAuthStore((s) => s.user);

    if (!user) return <>{fallback}</>;

    if (roles && !roles.includes(user.role)) return <>{fallback}</>;
    if (permission && !hasPermission(user.role, permission)) return <>{fallback}</>;

    return <>{children}</>;
}
