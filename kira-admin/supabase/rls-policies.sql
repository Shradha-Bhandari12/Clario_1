-- ============================================
-- Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================
-- Users policies
-- =====================
CREATE POLICY "Users: read own or admin+" ON public.users
  FOR SELECT USING (
    id = auth.uid() OR get_user_role() IN ('super_admin', 'admin')
  );

CREATE POLICY "Users: super_admin can insert" ON public.users
  FOR INSERT WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "Users: super_admin can update" ON public.users
  FOR UPDATE USING (get_user_role() = 'super_admin');

CREATE POLICY "Users: super_admin can delete" ON public.users
  FOR DELETE USING (get_user_role() = 'super_admin');

-- =====================
-- Workflows policies
-- =====================
CREATE POLICY "Workflows: all authenticated can read" ON public.workflows
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Workflows: admin+ can insert" ON public.workflows
  FOR INSERT WITH CHECK (get_user_role() IN ('super_admin', 'admin', 'designer'));

CREATE POLICY "Workflows: admin+ can update" ON public.workflows
  FOR UPDATE USING (get_user_role() IN ('super_admin', 'admin', 'designer'));

CREATE POLICY "Workflows: super_admin can delete" ON public.workflows
  FOR DELETE USING (get_user_role() = 'super_admin');

-- =====================
-- Workflow Versions policies
-- =====================
CREATE POLICY "Versions: all authenticated can read" ON public.workflow_versions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Versions: admin+ can insert" ON public.workflow_versions
  FOR INSERT WITH CHECK (get_user_role() IN ('super_admin', 'admin', 'designer'));

-- =====================
-- MCP Tools policies
-- =====================
CREATE POLICY "MCP: all authenticated can read" ON public.mcp_tools
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MCP: admin+ can manage" ON public.mcp_tools
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin'));

-- =====================
-- Logs policies
-- =====================
CREATE POLICY "Logs: all authenticated can read" ON public.logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Logs: all authenticated can insert" ON public.logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================
-- Alerts policies
-- =====================
CREATE POLICY "Alerts: all authenticated can read" ON public.alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Alerts: admin+ can manage" ON public.alerts
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin'));

-- =====================
-- Scheduled Jobs policies
-- =====================
CREATE POLICY "Jobs: all authenticated can read" ON public.scheduled_jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Jobs: admin+ can manage" ON public.scheduled_jobs
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin'));

-- =====================
-- Feature Flags policies
-- =====================
CREATE POLICY "Flags: all authenticated can read" ON public.feature_flags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Flags: admin+ can manage" ON public.feature_flags
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin'));
