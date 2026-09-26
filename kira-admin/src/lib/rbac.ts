import type { UserRole } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
    viewer: 0,
    designer: 1,
    admin: 2,
    super_admin: 3,
};

// Check if a role is at or above a minimum required level
export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if a role is one of the given roles
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
}

// Permission definitions
export const PERMISSIONS = {
    // Workflow permissions
    'workflows.create': ['super_admin', 'admin', 'designer'] as UserRole[],
    'workflows.edit': ['super_admin', 'admin', 'designer'] as UserRole[],
    'workflows.delete': ['super_admin'] as UserRole[],
    'workflows.publish': ['super_admin', 'admin'] as UserRole[],

    // MCP permissions
    'mcp.manage': ['super_admin', 'admin'] as UserRole[],
    'mcp.create': ['super_admin', 'admin'] as UserRole[],

    // User management
    'users.manage': ['super_admin', 'admin'] as UserRole[],
    'users.roles': ['super_admin'] as UserRole[],
    'users.delete': ['super_admin'] as UserRole[],

    // Settings
    'settings.manage': ['super_admin', 'admin'] as UserRole[],

    // Scheduler
    'scheduler.manage': ['super_admin', 'admin'] as UserRole[],

    // Alerts
    'alerts.manage': ['super_admin', 'admin'] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
    return PERMISSIONS[permission].includes(userRole);
}
