export type ExecutiveRow = Record<string, unknown>;

export type PriorityTask = ExecutiveRow & {
  id: string;
  title: string;
  priorityScore: number;
  scoreReasons: string[];
  estimatedFocusMinutes: number;
};

const priorityWeights: Record<string, number> = { urgent: 35, high: 25, medium: 12, low: 4 };
const incompleteStatuses = new Set(["todo", "doing", "review", "blocked", "pending"]);

export function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function isIncomplete(status: unknown) {
  return incompleteStatuses.has(asText(status, "todo").toLowerCase());
}

export function calculatePriorityScore(task: ExecutiveRow, now = new Date()) {
  const reasons: string[] = [];
  let score = 0;
  const priority = asText(task.priority, "medium").toLowerCase();
  score += priorityWeights[priority] ?? priorityWeights.medium;
  reasons.push(`${priority} priority`);

  const dueAt = asText(task.due_at);
  if (dueAt) {
    const due = new Date(dueAt);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
    if (daysUntilDue < 0) {
      score += 45 + Math.min(Math.abs(daysUntilDue) * 3, 30);
      reasons.push("overdue");
    } else if (daysUntilDue === 0) {
      score += 30;
      reasons.push("due today");
    } else if (daysUntilDue <= 3) {
      score += 18;
      reasons.push("due soon");
    } else if (daysUntilDue <= 7) {
      score += 8;
      reasons.push("due this week");
    }
  } else {
    score += 3;
    reasons.push("unscheduled");
  }

  if (task.approval_required === true) {
    score += 18;
    reasons.push("approval required");
  }
  if (asText(task.organization_id)) {
    score += 5;
    reasons.push("organization scoped");
  }
  const dependencies = Array.isArray(task.dependencies) ? task.dependencies : [];
  if (dependencies.length > 0) {
    score += Math.min(dependencies.length * 5, 20);
    reasons.push(`${dependencies.length} dependencies`);
  }
  const completion = typeof task.completion_percent === "number" ? task.completion_percent : task.completion_date ? 100 : 0;
  if (completion > 0 && completion < 100) {
    score += Math.max(2, Math.round((100 - completion) / 10));
    reasons.push(`${completion}% complete`);
  }
  if (asText(task.status).toLowerCase() === "blocked") {
    score += 22;
    reasons.push("blocked risk");
  }
  return { score: Math.min(100, score), reasons };
}

export function getTopPriorities(tasks: ExecutiveRow[], now = new Date()): PriorityTask[] {
  return tasks
    .filter((task) => isIncomplete(task.status))
    .map((task) => {
      const scored = calculatePriorityScore(task, now);
      return {
        ...task,
        id: asText(task.id, asText(task.title, "task")),
        title: asText(task.title, "Untitled task"),
        priorityScore: scored.score,
        scoreReasons: scored.reasons,
        estimatedFocusMinutes: estimateFocusMinutes(task, scored.score),
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10);
}

export function estimateFocusMinutes(task: ExecutiveRow, score: number) {
  if (task.approval_required === true) return 15;
  if (asText(task.status).toLowerCase() === "blocked") return 45;
  return Math.max(25, Math.min(120, Math.round(score / 10) * 10));
}

export function buildRecommendations(input: {
  organizations: ExecutiveRow[];
  projects: ExecutiveRow[];
  tasks: ExecutiveRow[];
  approvals: ExecutiveRow[];
  health: ExecutiveRow[];
  documents: ExecutiveRow[];
}) {
  const recommendations: string[] = [];
  const pendingApprovals = input.approvals.filter((approval) => asText(approval.status) === "pending");
  if (pendingApprovals.length) recommendations.push(`${pendingApprovals.length} approvals are waiting.`);

  const activeTasks = input.tasks.filter((task) => isIncomplete(task.status));
  input.organizations.forEach((organization) => {
    const organizationTasks = activeTasks.filter((task) => task.organization_id === organization.id);
    if (!organizationTasks.length) recommendations.push(`${asText(organization.name, "An organization")} has no active tasks.`);
  });

  const fundingTasks = activeTasks.filter((task) => /fund|capital|investor/i.test(`${task.title ?? ""} ${task.description ?? ""} ${task.details ?? ""}`));
  if (!fundingTasks.length) recommendations.push("Funding pipeline is empty.");

  const unhealthy = input.health.filter((service) => !["healthy", "connected"].includes(asText(service.health, asText(service.connection_status)).toLowerCase()));
  recommendations.push(unhealthy.length ? `${unhealthy.length} system health items need review.` : "System health is normal.");

  const today = new Date().toISOString().slice(0, 10);
  const legalUpdatedToday = input.documents.some((document) => /legal/i.test(`${document.title ?? ""} ${document.document_type ?? ""}`) && asText(document.updated_at).startsWith(today));
  if (!legalUpdatedToday) recommendations.push("No legal research has been updated today.");

  return recommendations.slice(0, 8);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" }).format(date);
}

export function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(date);
}
