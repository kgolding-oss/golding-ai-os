import type { Activity, Agent, Approval, AuditLog, Health, Organization, Project, Task } from "./queries";

export type AttentionItem = { id: string; title: string; detail: string; severity: "critical" | "high" | "medium" | "low"; source: string };
export type Recommendation = { id: string; title: string; rationale: string; action: string; severity: AttentionItem["severity"] };

const closedTaskStatuses = new Set(["done", "completed", "cancelled", "archived"]);
const unhealthyValues = new Set(["error", "failed", "unhealthy", "degraded", "offline"]);
const disconnectedValues = new Set(["not connected", "disconnected", "offline", "error"]);

export function isTaskOpen(task: Task) {
  return !closedTaskStatuses.has(String(task.status ?? "todo").toLowerCase());
}

export function isOverdue(task: Task, now = new Date()) {
  if (!task.due_at || !isTaskOpen(task)) return false;
  return new Date(task.due_at).getTime() < now.getTime();
}

export function isUrgentTask(task: Task, now = new Date()) {
  const priority = String(task.priority ?? "").toLowerCase();
  return isTaskOpen(task) && (priority === "urgent" || priority === "high" || task.status === "blocked" || isOverdue(task, now));
}

export function getPendingApprovals(approvals: Approval[]) {
  return approvals.filter((approval) => String(approval.status ?? "pending").toLowerCase() === "pending");
}

export function getUnhealthyAgents(agents: Agent[]) {
  return agents.filter((agent) => unhealthyValues.has(String(agent.health ?? agent.status ?? "").toLowerCase()) || String(agent.status ?? "").toLowerCase() === "inactive");
}

export function getDisconnectedServices(health: Health[]) {
  return health.filter((service) => disconnectedValues.has(String(service.connection_status ?? "").toLowerCase()) || unhealthyValues.has(String(service.health ?? "").toLowerCase()));
}

export function getFailedActivity(activity: Activity[], auditLogs: AuditLog[]) {
  const failedAgentActivity = activity.filter((item) => /fail|error|rejected|blocked/i.test(`${item.activity_type} ${item.summary}`));
  const failedAuditLogs = auditLogs.filter((item) => /fail|error|rejected|denied|unauthorized/i.test(`${item.action} ${JSON.stringify(item.metadata ?? {})}`));
  return { failedAgentActivity, failedAuditLogs };
}

export function buildAttentionQueue(input: { tasks: Task[]; approvals: Approval[]; agents: Agent[]; health: Health[]; activity: Activity[]; auditLogs: AuditLog[] }) {
  const now = new Date();
  const overdueTasks = input.tasks.filter((task) => isOverdue(task, now));
  const urgentTasks = input.tasks.filter((task) => isUrgentTask(task, now) && !overdueTasks.some((overdue) => overdue.id === task.id));
  const pendingApprovals = getPendingApprovals(input.approvals);
  const unhealthyAgents = getUnhealthyAgents(input.agents);
  const disconnectedServices = getDisconnectedServices(input.health);
  const { failedAgentActivity, failedAuditLogs } = getFailedActivity(input.activity, input.auditLogs);

  return [
    ...overdueTasks.map((task) => ({ id: `overdue-${task.id}`, title: task.title, detail: `Overdue${task.due_at ? ` since ${new Date(task.due_at).toLocaleDateString()}` : ""}.`, severity: "critical" as const, source: "tasks" })),
    ...pendingApprovals.map((approval) => ({ id: `approval-${approval.id}`, title: approval.title, detail: approval.reason ?? `Risk score ${approval.risk_score ?? 0}.`, severity: Number(approval.risk_score ?? 0) >= 7 ? "critical" as const : "high" as const, source: "approvals" })),
    ...urgentTasks.map((task) => ({ id: `urgent-${task.id}`, title: task.title, detail: task.description ?? task.details ?? `${task.priority ?? "Priority"} work needs executive visibility.`, severity: "high" as const, source: "tasks" })),
    ...unhealthyAgents.map((agent) => ({ id: `agent-${agent.id}`, title: agent.name, detail: `${agent.role ?? "Agent"} is ${agent.health ?? agent.status ?? "not healthy"}.`, severity: "medium" as const, source: "agent_registry" })),
    ...disconnectedServices.slice(0, 5).map((service) => ({ id: `service-${service.id}`, title: service.service_name, detail: `${service.connection_status ?? "Unknown"} · ${service.health ?? "Unknown"}.`, severity: "medium" as const, source: "system_health" })),
    ...failedAgentActivity.slice(0, 3).map((item) => ({ id: `activity-${item.id}`, title: item.activity_type, detail: item.summary, severity: "medium" as const, source: "agent_activity" })),
    ...failedAuditLogs.slice(0, 3).map((item) => ({ id: `audit-${item.id}`, title: item.action, detail: item.entity_table ?? "Audit log event", severity: "medium" as const, source: "audit_logs" })),
  ].slice(0, 12);
}

export function buildRecommendations(input: { organization: Organization | null; tasks: Task[]; approvals: Approval[]; agents: Agent[]; health: Health[]; projects: Project[]; activity: Activity[]; auditLogs: AuditLog[]; membershipCount: number }) {
  const queue = buildAttentionQueue(input);
  const pendingApprovals = getPendingApprovals(input.approvals);
  const disconnectedServices = getDisconnectedServices(input.health);
  const openTasks = input.tasks.filter(isTaskOpen);
  const staleOrg = input.organization?.updated_at ? Date.now() - new Date(input.organization.updated_at).getTime() > 1000 * 60 * 60 * 24 * 30 : false;
  const recommendations: Recommendation[] = [];

  if (pendingApprovals.length) recommendations.push({ id: "approve", title: "Clear the approval queue", rationale: `${pendingApprovals.length} decision${pendingApprovals.length === 1 ? "" : "s"} are waiting on executive review.`, action: "Review approvals before adding new operational work.", severity: "high" });
  if (queue.some((item) => item.source === "tasks" && item.severity === "critical")) recommendations.push({ id: "overdue", title: "Re-sequence overdue execution", rationale: "At least one overdue task is competing for immediate attention.", action: "Assign an owner, reset the due date, or close stale work.", severity: "critical" });
  if (disconnectedServices.length) recommendations.push({ id: "services", title: "Stabilize disconnected services", rationale: `${disconnectedServices.length} registered service${disconnectedServices.length === 1 ? "" : "s"} are disconnected or unhealthy.`, action: "Prioritize core integrations required for the next milestone.", severity: "medium" });
  if (getUnhealthyAgents(input.agents).length) recommendations.push({ id: "agents", title: "Inspect AI workforce health", rationale: "One or more registered agents are inactive, degraded, or unhealthy.", action: "Pause dependent workflows until agent ownership and health are restored.", severity: "medium" });
  if (!input.projects.length && openTasks.length) recommendations.push({ id: "projects", title: "Connect tasks to projects", rationale: "Open work exists without visible project structure in the command center.", action: "Create or assign projects so execution has a portfolio lane.", severity: "low" });
  if (staleOrg) recommendations.push({ id: "stale-org", title: "Refresh organization operating profile", rationale: "The active organization has not been updated in over 30 days.", action: "Confirm mission, status, owner, and current strategic focus.", severity: "low" });
  if (input.membershipCount <= 1) recommendations.push({ id: "membership", title: "Review organization coverage", rationale: "Only one active membership is visible for this organization.", action: "Invite critical operators or confirm Karim remains sole owner for now.", severity: "low" });

  return recommendations.slice(0, 6);
}
