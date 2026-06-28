import { supabaseSelect } from "@/lib/supabase/server";

export type Business = { id: string; name: string; slug: string; status: string; description: string | null };
export type Task = { id: string; title: string; status: string; due_date: string | null; priority: string; business_id: string | null };
export type Approval = { id: string; title: string; status: string; priority: string; requested_by: string | null };
export type AuditLog = { id: string; action: string; created_at: string; entity_type: string | null };

export async function getDashboardData(accessToken: string) {
  const [businesses, tasks, approvals, auditLogs] = await Promise.all([
    supabaseSelect<Business>("businesses", accessToken, "select=id,name,slug,status,description&order=name.asc"),
    supabaseSelect<Task>("tasks", accessToken, "select=id,title,status,due_date,priority,business_id&status=neq.done&order=due_date.asc.nullslast&limit=8"),
    supabaseSelect<Approval>("approvals", accessToken, "select=id,title,status,priority,requested_by&status=eq.pending&order=created_at.desc&limit=6"),
    supabaseSelect<AuditLog>("audit_logs", accessToken, "select=id,action,created_at,entity_type&order=created_at.desc&limit=8"),
  ]);

  return { businesses, tasks, approvals, auditLogs };
}
