import { getRows } from "../supabase/data";
import { organizationFilter } from "../activeOrganization";

export type Organization = { id: string; name: string; slug?: string; mission?: string | null; industry?: string | null; status?: string | null; executive?: string | null; primary_color?: string | null; secondary_color?: string | null; updated_at?: string | null; created_at?: string | null };
export type Task = { id: string; title: string; status?: string | null; priority?: string | null; due_at?: string | null; approval_required?: boolean | null; description?: string | null; details?: string | null; created_at?: string | null; updated_at?: string | null };
export type Approval = { id: string; title: string; status?: string | null; risk_score?: number | null; reason?: string | null; created_at?: string | null };
export type Agent = { id: string; name: string; role?: string | null; status?: string | null; health?: string | null; approval_required?: boolean | null; memory_enabled?: boolean | null; updated_at?: string | null; created_at?: string | null };
export type Activity = { id: string; activity_type: string; summary: string; created_at?: string | null };
export type Health = { id: string; service_name: string; connection_status?: string | null; health?: string | null; notes?: string | null; checked_at?: string | null };

export type DashboardData = { organizations: Organization[]; tasks: Task[]; approvals: Approval[]; agents: Agent[]; activity: Activity[]; health: Health[] };

function query(params: string[]) {
  return `?${params.filter(Boolean).join("&")}`;
}

function scopedQuery(activeOrganizationId: string | null | undefined, extras: string[]) {
  const filter = organizationFilter(activeOrganizationId);
  if (!filter) return null;
  return query(["select=*", filter, ...extras]);
}

export async function getDashboardData(token: string, activeOrganizationId?: string | null): Promise<DashboardData> {
  const organizationQuery = activeOrganizationId ? query(["select=*", `id=eq.${encodeURIComponent(activeOrganizationId)}`, "order=updated_at.desc"]) : null;
  const taskQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=50"]);
  const approvalQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=25"]);
  const agentQuery = scopedQuery(activeOrganizationId, ["order=name"]);
  const activityQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=12"]);

  const [organizations, tasks, approvals, agents, activity, health] = await Promise.all([
    organizationQuery ? getRows<Organization>("organizations", token, organizationQuery) : Promise.resolve([]),
    taskQuery ? getRows<Task>("tasks", token, taskQuery) : Promise.resolve([]),
    approvalQuery ? getRows<Approval>("approvals", token, approvalQuery) : Promise.resolve([]),
    agentQuery ? getRows<Agent>("agent_registry", token, agentQuery) : Promise.resolve([]),
    activityQuery ? getRows<Activity>("agent_activity", token, activityQuery) : Promise.resolve([]),
    getRows<Health>("system_health", token, "?select=*&order=service_name"),
  ]);

  return { organizations, tasks, approvals, agents, activity, health };
}
