// Database type definitions matching Supabase schema
// These will be auto-generated once connected via `supabase gen types`

export type UserRole = 'super_admin' | 'admin' | 'designer' | 'viewer';
export type WorkflowStatus = 'active' | 'disabled' | 'archived';
export type TriggerType = 'webhook' | 'schedule' | 'event' | 'api';
export type LogType = 'execution' | 'audit' | 'mcp' | 'sync';
export type LogStatus = 'success' | 'error' | 'warning' | 'pending';
export type JobStatus = 'active' | 'paused' | 'completed' | 'failed';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url: string | null;
    status: 'active' | 'inactive';
    last_login: string | null;
    created_at: string;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    version: number;
    trigger_type: TriggerType;
    input_schema: Record<string, unknown>;
    output_schema: Record<string, unknown>;
    execution_mode: string;
    mcp_exposed: boolean;
    voice_trigger: boolean;
    app_exposed: boolean;
    permission_scope: string;
    status: WorkflowStatus;
    tags: string[];
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface WorkflowVersion {
    id: string;
    workflow_id: string;
    version: number;
    schema_snapshot: Record<string, unknown>;
    note: string;
    created_by: string | null;
    created_at: string;
}

export interface McpTool {
    id: string;
    workflow_id: string;
    tool_name: string;
    description: string;
    permission_scope: string;
    version: string;
    status: 'active' | 'disabled';
    last_synced: string | null;
    created_at: string;
}

export interface Log {
    id: string;
    workflow_id: string | null;
    user_id: string | null;
    type: LogType;
    status: LogStatus;
    message: string;
    payload: Record<string, unknown>;
    duration_ms: number | null;
    created_at: string;
}

export interface Alert {
    id: string;
    rule_name: string;
    condition: string;
    threshold: number;
    time_window: string;
    active: boolean;
    created_at: string;
}

export interface ScheduledJob {
    id: string;
    workflow_id: string;
    cron_expression: string;
    status: JobStatus;
    last_run: string | null;
    next_run: string | null;
    created_at: string;
}

export interface FeatureFlag {
    id: string;
    workflow_id: string;
    name: string;
    rollout_percentage: number;
    enabled: boolean;
    created_at: string;
}

// Supabase Database type mapping
export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Partial<User>;
                Update: Partial<User>;
            };
            workflows: {
                Row: Workflow;
                Insert: Partial<Workflow>;
                Update: Partial<Workflow>;
            };
            workflow_versions: {
                Row: WorkflowVersion;
                Insert: Partial<WorkflowVersion>;
                Update: Partial<WorkflowVersion>;
            };
            mcp_tools: {
                Row: McpTool;
                Insert: Partial<McpTool>;
                Update: Partial<McpTool>;
            };
            logs: {
                Row: Log;
                Insert: Partial<Log>;
                Update: Partial<Log>;
            };
            alerts: {
                Row: Alert;
                Insert: Partial<Alert>;
                Update: Partial<Alert>;
            };
            scheduled_jobs: {
                Row: ScheduledJob;
                Insert: Partial<ScheduledJob>;
                Update: Partial<ScheduledJob>;
            };
            feature_flags: {
                Row: FeatureFlag;
                Insert: Partial<FeatureFlag>;
                Update: Partial<FeatureFlag>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}
