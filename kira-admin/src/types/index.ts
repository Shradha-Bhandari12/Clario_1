export type { Database, User, Workflow, WorkflowVersion, McpTool, Log, Alert, ScheduledJob, FeatureFlag, UserRole, WorkflowStatus, TriggerType, LogType, LogStatus, JobStatus } from './database';
import type { UserRole } from './database';

// Navigation item type for sidebar
export interface NavItem {
    label: string;
    href: string;
    icon: string;
    roles?: UserRole[];
    badge?: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}
