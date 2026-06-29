import type { Approval, DashboardData, Health, Task } from "./queries";

export type DashboardMetric = { label: string; value: string; detail: string };

const activeTaskStatuses = new Set(["todo", "doing", "review", "blocked"]);

export function buildMetrics(data: DashboardData): DashboardMetric[] {
  const activeTasks = data.tasks.filter((task) => activeTaskStatuses.has(String(task.status ?? "todo"))).length;
  const pendingApprovals = data.approvals.filter((approval) => approval.status === "pending").length;
  const healthyServices = data.health.filter((service) => service.health === "Healthy").length;
  const totalServices = data.health.length;

  return [
    { label: "Organizations", value: String(data.organizations.length), detail: "Operating companies in command view" },
    { label: "Active tasks", value: String(activeTasks), detail: "Open, doing, review, or blocked work" },
    { label: "Pending approvals", value: String(pendingApprovals), detail: "Executive decisions awaiting action" },
    { label: "System health", value: totalServices ? `${healthyServices}/${totalServices}` : "0/0", detail: "Healthy registered services" },
  ];
}

export function getPriorityTasks(tasks: Task[], limit = 6) {
  const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return [...tasks]
    .filter((task) => task.status !== "done")
    .sort((a, b) => (priorityRank[a.priority ?? "medium"] ?? 1) - (priorityRank[b.priority ?? "medium"] ?? 1))
    .slice(0, limit);
}

export function getRecentApprovals(approvals: Approval[], limit = 4) {
  return approvals.slice(0, limit);
}

export function getHealthSummary(health: Health[]) {
  const connected = health.filter((service) => service.connection_status === "Connected").length;
  const notConnected = Math.max(health.length - connected, 0);
  return { connected, notConnected };
}
