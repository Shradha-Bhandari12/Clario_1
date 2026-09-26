-- ============================================
-- Seed Data — Demo content for KIRA Admin
-- Run AFTER schema.sql and rls-policies.sql
-- ============================================

-- Insert demo users (these should match Supabase Auth accounts)
-- In production, you'd create auth users first, then insert here with their UUIDs
INSERT INTO public.users (id, email, full_name, role, status) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'aarav@kira.dev', 'Aarav Mehta', 'super_admin', 'active'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'priya@kira.dev', 'Priya Sharma', 'admin', 'active'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'rahul@kira.dev', 'Rahul Kapoor', 'designer', 'active'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'neha@kira.dev', 'Neha Gupta', 'viewer', 'active');

-- Insert demo workflows
INSERT INTO public.workflows (id, name, description, version, trigger_type, mcp_exposed, voice_trigger, status, tags, created_by) VALUES
  ('w1000000-0000-0000-0000-000000000001', 'Voice Query Handler', 'Handles natural language queries from the voice assistant, processes intent, and routes to appropriate backend service.', 3, 'webhook', true, true, 'active', ARRAY['voice', 'nlp', 'core'], 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000002', 'Student Data Sync', 'Syncs student records from the main database to the mobile app cache layer every 30 minutes.', 2, 'schedule', false, false, 'active', ARRAY['sync', 'data', 'students'], 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'),
  ('w1000000-0000-0000-0000-000000000003', 'Fee Reminder Workflow', 'Triggers fee reminder notifications to parents via WhatsApp and email based on due dates.', 1, 'schedule', true, false, 'active', ARRAY['notifications', 'fees', 'parents'], 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000004', 'Attendance Processor', 'Processes daily attendance data and generates analytics reports for admin dashboard.', 2, 'event', false, false, 'disabled', ARRAY['attendance', 'analytics'], 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'),
  ('w1000000-0000-0000-0000-000000000005', 'MCP Tool Router', 'Routes incoming MCP tool calls to the appropriate workflow handler with permission checks.', 4, 'api', true, true, 'active', ARRAY['mcp', 'router', 'core'], 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Insert workflow versions
INSERT INTO public.workflow_versions (workflow_id, version, note, created_by) VALUES
  ('w1000000-0000-0000-0000-000000000001', 1, 'Initial version', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000001', 2, 'Added voice trigger support', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000001', 3, 'Enhanced NLP processing pipeline', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000002', 1, 'Initial sync logic', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'),
  ('w1000000-0000-0000-0000-000000000002', 2, 'Optimized batch processing', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'),
  ('w1000000-0000-0000-0000-000000000005', 1, 'Basic routing', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000005', 2, 'Added permission checks', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000005', 3, 'MCP v2 compliance', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('w1000000-0000-0000-0000-000000000005', 4, 'Rate limiting and caching', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');

-- Insert MCP tools
INSERT INTO public.mcp_tools (workflow_id, tool_name, description, permission_scope, version, status) VALUES
  ('w1000000-0000-0000-0000-000000000001', 'ask_kira', 'Send a natural language query to KIRA voice assistant', 'public', '1.2.0', 'active'),
  ('w1000000-0000-0000-0000-000000000003', 'send_fee_reminder', 'Trigger fee reminder for a specific student or batch', 'admin', '1.0.0', 'active'),
  ('w1000000-0000-0000-0000-000000000005', 'route_tool_call', 'Route an MCP tool call to the appropriate handler', 'private', '2.1.0', 'active'),
  ('w1000000-0000-0000-0000-000000000002', 'trigger_sync', 'Manually trigger student data synchronization', 'admin', '1.0.0', 'disabled');

-- Insert sample logs
INSERT INTO public.logs (workflow_id, user_id, type, status, message, duration_ms) VALUES
  ('w1000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'execution', 'success', 'Voice query processed successfully', 245),
  ('w1000000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'execution', 'success', 'Query: What is the attendance today?', 312),
  ('w1000000-0000-0000-0000-000000000002', NULL, 'execution', 'success', 'Synced 1,247 student records', 8500),
  ('w1000000-0000-0000-0000-000000000003', NULL, 'execution', 'error', 'WhatsApp API rate limit exceeded', 150),
  ('w1000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'mcp', 'success', 'Tool call routed: ask_kira', 89),
  ('w1000000-0000-0000-0000-000000000001', NULL, 'audit', 'success', 'Workflow version bumped to v3', NULL),
  ('w1000000-0000-0000-0000-000000000004', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'execution', 'warning', 'Attendance data incomplete for Section B', 4200);

-- Insert sample alerts
INSERT INTO public.alerts (rule_name, condition, threshold, time_window, active) VALUES
  ('High Failure Rate', 'failure_rate', 25, '1h', true),
  ('Slow Execution', 'avg_duration', 5000, '30m', true),
  ('MCP Timeout', 'mcp_timeout', 10, '15m', false);
