import { getRows } from "../supabase/data";

export type Organization = { id: string; name: string; slug?: string; mission?: string | null; industry?: string | null; status?: string | null; executive?: string | null; primary_color?: string | null; secondary_color?: string | null; updated_at?: string | null; created_at?: string | null };
export type Task = { id: string; title: string; organization_id?: string | null; status?: string | null; priority?: string | null; due_at?: string | null; approval_required?: boolean | null; description?: string | null; details?: string | null; created_at?: string | null; updated_at?: string | null };
export type Approval = { id: string; title: string; status?: string | null; risk_score?: number | null; reason?: string | null; created_at?: string | null };
export type Agent = { id: string; name: string; role?: string | null; status?: string | null; health?: string | null; approval_required?: boolean | null; memory_enabled?: boolean | null; updated_at?: string | null; created_at?: string | null };
export type Activity = { id: string; activity_type: string; summary: string; created_at?: string | null };
export type Health = { id: string; service_name: string; connection_status?: string | null; health?: string | null; notes?: string | null; checked_at?: string | null };

export type DashboardData = {
  organizations: Organization[];
  tasks: Task[];
  approvals: Approval[];
  agents: Agent[];
  activity: Activity[];
  health: Health[];
};

export async function getDashboardData(token: string, activeOrganizationId?: string | null): Promise<DashboardData> {
  const organizationScope = activeOrganizationId ? `organization_id=eq.${activeOrganizationId}` : "id=is.null";
  const activeOrganizationScope = activeOrganizationId ? `id=eq.${activeOrganizationId}` : "id=is.null";
  const [organizations, tasks, approvals, agents, activity, health] = await Promise.all([
    getRows<Organization>("organizations", token, `?select=*&${activeOrganizationScope}&order=updated_at.desc`),
    getRows<Task>("tasks", token, `?select=*&${organizationScope}&order=created_at.desc&limit=50`),
    getRows<Approval>("approvals", token, `?select=*&${organizationScope}&order=created_at.desc&limit=25`),
    getRows<Agent>("agent_registry", token, `?select=*&${organizationScope}&order=name`),
    getRows<Activity>("agent_activity", token, `?select=*&${organizationScope}&order=created_at.desc&limit=12`),
    getRows<Health>("system_health", token, "?select=*&order=service_name"),
  ]);

  return { organizations, tasks, approvals, agents, activity, health };
}
