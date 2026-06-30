import { getRows } from "../supabase/data";
import { organizationFilter } from "../activeOrganization";
import { logger } from "../observability";

export type Organization = { id: string; name: string; slug?: string; mission?: string | null; industry?: string | null; status?: string | null; executive?: string | null; primary_color?: string | null; secondary_color?: string | null; updated_at?: string | null; created_at?: string | null };
export type Project = { id: string; name?: string | null; title?: string | null; status?: string | null; updated_at?: string | null; created_at?: string | null };
export type Task = { id: string; title: string; status?: string | null; priority?: string | null; due_at?: string | null; approval_required?: boolean | null; description?: string | null; details?: string | null; created_at?: string | null; updated_at?: string | null };
export type Approval = { id: string; title: string; status?: string | null; risk_score?: number | null; reason?: string | null; created_at?: string | null };
export type Agent = { id: string; name: string; role?: string | null; status?: string | null; health?: string | null; approval_required?: boolean | null; memory_enabled?: boolean | null; updated_at?: string | null; created_at?: string | null };
export type Activity = { id: string; activity_type: string; summary: string; created_at?: string | null };
export type Health = { id: string; service_name: string; connection_status?: string | null; health?: string | null; notes?: string | null; checked_at?: string | null };
export type AuditLog = { id: string; action: string; entity_table?: string | null; metadata?: Record<string, unknown> | null; created_at?: string | null };
export type Membership = { id: string; organization_id: string; profile_id?: string | null; status?: string | null; created_at?: string | null };
export type UserPreference = { profile_id: string; active_organization_id?: string | null; updated_at?: string | null };

export type DashboardData = { organizations: Organization[]; projects: Project[]; tasks: Task[]; approvals: Approval[]; agents: Agent[]; activity: Activity[]; health: Health[]; auditLogs: AuditLog[]; memberships: Membership[]; userPreferences: UserPreference[] };

function query(params: string[]) {
  return `?${params.filter(Boolean).join("&")}`;
}

function scopedQuery(activeOrganizationId: string | null | undefined, extras: string[]) {
  const filter = organizationFilter(activeOrganizationId);
  if (!filter) return null;
  return query(["select=*", filter, ...extras]);
}

async function getOptionalRows<T>(table: string, token: string, query = "?select=*") {
  try {
    return await getRows<T>(table, token, query);
  } catch (error) {
    logger.error("dashboard.datasource.unavailable", `Dashboard data source unavailable: ${table}`, error, { table }, { subsystem: "dashboard-data" });
    return [];
  }
}

export async function getDashboardData(token: string, activeOrganizationId?: string | null): Promise<DashboardData> {
  const organizationQuery = activeOrganizationId ? query(["select=*", `id=eq.${encodeURIComponent(activeOrganizationId)}`, "order=updated_at.desc"]) : null;
  const projectQuery = scopedQuery(activeOrganizationId, ["order=updated_at.desc", "limit=25"]);
  const taskQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=50"]);
  const approvalQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=25"]);
  const agentQuery = scopedQuery(activeOrganizationId, ["order=name"]);
  const activityQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=12"]);
  const auditQuery = scopedQuery(activeOrganizationId, ["order=created_at.desc", "limit=12"]);
  const membershipQuery = scopedQuery(activeOrganizationId, ["status=eq.active", "order=created_at.asc"]);
  const preferenceQuery = activeOrganizationId ? query(["select=profile_id,active_organization_id,updated_at", `active_organization_id=eq.${encodeURIComponent(activeOrganizationId)}`, "limit=25"]) : null;

  const [organizations, projects, tasks, approvals, agents, activity, health, auditLogs, memberships, userPreferences] = await Promise.all([
    organizationQuery ? getOptionalRows<Organization>("organizations", token, organizationQuery) : Promise.resolve([]),
    projectQuery ? getOptionalRows<Project>("projects", token, projectQuery) : Promise.resolve([]),
    taskQuery ? getOptionalRows<Task>("tasks", token, taskQuery) : Promise.resolve([]),
    approvalQuery ? getOptionalRows<Approval>("approvals", token, approvalQuery) : Promise.resolve([]),
    agentQuery ? getOptionalRows<Agent>("agent_registry", token, agentQuery) : Promise.resolve([]),
    activityQuery ? getOptionalRows<Activity>("agent_activity", token, activityQuery) : Promise.resolve([]),
    getOptionalRows<Health>("system_health", token, "?select=*&order=service_name"),
    auditQuery ? getOptionalRows<AuditLog>("audit_logs", token, auditQuery) : Promise.resolve([]),
    membershipQuery ? getOptionalRows<Membership>("organization_memberships", token, membershipQuery) : Promise.resolve([]),
    preferenceQuery ? getOptionalRows<UserPreference>("user_preferences", token, preferenceQuery) : Promise.resolve([]),
  ]);

  return { organizations, projects, tasks, approvals, agents, activity, health, auditLogs, memberships, userPreferences };
}
