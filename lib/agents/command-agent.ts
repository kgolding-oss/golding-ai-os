import { buildAttentionQueue, buildRecommendations, getDisconnectedServices, getPendingApprovals, getUnhealthyAgents, isTaskOpen } from "../dashboard/intelligence";
import type { Activity, AuditLog, DashboardData, Task } from "../dashboard/queries";
import type { AgentRunContext, AgentRunResult, BaseAgent, StructuredAgentOutput } from "./base-agent";

export type CommandAgentOutput = StructuredAgentOutput & {
  executiveBrief: string;
  attentionQueue: Array<{ title: string; detail: string; severity: string; source: string }>;
  recommendations: Array<{ title: string; rationale: string; action: string; severity: string }>;
  blockers: string[];
  timeline: string[];
  suggestedNextActions: string[];
  priorityRanking: string[];
  supportedCommands: string[];
};

const supportedCommands = [
  "Review today's priorities",
  "What needs my attention?",
  "Show blockers",
  "Summarize recent activity",
  "Review AI workforce",
  "Prepare executive brief",
];

const commandAliases: Record<string, string> = {
  "review todays priorities": "priorities",
  "review today's priorities": "priorities",
  "what needs my attention": "attention",
  "show blockers": "blockers",
  "summarize recent activity": "activity",
  "review ai workforce": "workforce",
  "prepare executive brief": "brief",
};

function normalizeCommand(command?: string) {
  return String(command ?? "Prepare executive brief").trim().toLowerCase().replace(/[?!.]/g, "").replace(/\s+/g, " ");
}

function taskLabel(task: Task) {
  const due = task.due_at ? ` · due ${new Date(task.due_at).toLocaleDateString()}` : "";
  return `${task.title}${task.priority ? ` · ${task.priority}` : ""}${due}`;
}

function eventLabel(item: Activity | AuditLog) {
  const created = item.created_at ? new Date(item.created_at).toLocaleString() : "recently";
  if ("summary" in item) return `${created}: ${item.activity_type} — ${item.summary}`;
  return `${created}: ${item.action}${item.entity_table ? ` on ${item.entity_table}` : ""}`;
}

function buildTimeline(data: DashboardData) {
  return [...data.activity, ...data.auditLogs]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 8)
    .map(eventLabel);
}

function buildPriorityRanking(data: DashboardData) {
  const openTasks = data.tasks.filter(isTaskOpen);
  const weight = (task: Task) => {
    const priority = String(task.priority ?? "").toLowerCase();
    const status = String(task.status ?? "").toLowerCase();
    let score = 0;
    if (priority === "urgent") score += 40;
    if (priority === "high") score += 30;
    if (status === "blocked") score += 35;
    if (task.approval_required) score += 15;
    if (task.due_at) {
      const days = (new Date(task.due_at).getTime() - Date.now()) / 86400000;
      if (days < 0) score += 35;
      else if (days <= 3) score += 20;
    }
    return score;
  };
  return openTasks.sort((a, b) => weight(b) - weight(a)).slice(0, 6).map(taskLabel);
}

export const commandAgent: BaseAgent<DashboardData, CommandAgentOutput> = {
  id: "executive-command-agent",
  name: "Executive Command Agent",
  role: "executive-operator",
  purpose: "Turn existing Golding AI OS records into deterministic executive intelligence without external AI calls.",
  scope: ["organizations", "projects", "tasks", "approvals", "agent_registry", "agent_activity", "system_health", "audit_logs", "organization_memberships", "user_preferences"],
  availableActions: supportedCommands,
  health: "healthy",
  run(context: AgentRunContext<DashboardData>): AgentRunResult<CommandAgentOutput> {
    const data = context.input;
    const org = data.organizations[0] ?? null;
    const attentionQueue = buildAttentionQueue(data);
    const recommendations = buildRecommendations({ ...data, organization: org, membershipCount: data.memberships.length });
    const pendingApprovals = getPendingApprovals(data.approvals);
    const disconnectedServices = getDisconnectedServices(data.health);
    const unhealthyAgents = getUnhealthyAgents(data.agents);
    const priorityRanking = buildPriorityRanking(data);
    const timeline = buildTimeline(data);
    const blockers = [
      ...attentionQueue.filter((item) => item.severity === "critical" || item.source === "approvals").map((item) => `${item.title}: ${item.detail}`),
      ...disconnectedServices.map((service) => `${service.service_name}: ${service.connection_status ?? "unknown"} / ${service.health ?? "unknown"}`),
    ].slice(0, 8);
    const suggestedNextActions = recommendations.map((item) => item.action).slice(0, 6);
    const commandKey = commandAliases[normalizeCommand(context.command)];
    const unsupported = !commandKey;
    const executiveBrief = org
      ? `${org.name}: ${pendingApprovals.length} pending approvals, ${priorityRanking.length} ranked priorities, ${unhealthyAgents.length} agent exceptions, and ${disconnectedServices.length} service issues are visible.`
      : "No active organization data is available. Select an organization to generate a full executive brief.";
    const output: CommandAgentOutput = {
      status: unsupported ? "unsupported" : attentionQueue.length || priorityRanking.length || timeline.length ? "success" : "empty",
      summary: unsupported ? "Unsupported command. Choose one of the starter executive commands." : executiveBrief,
      generatedAt: (context.now ?? new Date()).toISOString(),
      executiveBrief,
      attentionQueue,
      recommendations,
      blockers: blockers.length ? blockers : ["No deterministic blockers found in the current organization data."],
      timeline: timeline.length ? timeline : ["No recent agent activity or audit log entries found."],
      suggestedNextActions: suggestedNextActions.length ? suggestedNextActions : ["Keep monitoring the command center until tasks, approvals, or health signals require action."],
      priorityRanking: priorityRanking.length ? priorityRanking : ["No open prioritized tasks found."],
      supportedCommands,
      sections: [],
    };
    output.sections = selectSections(commandKey, output);
    return { agentId: this.id, command: context.command, output };
  },
};

function selectSections(commandKey: string | undefined, output: CommandAgentOutput) {
  if (!commandKey) return [{ title: "Supported commands", items: output.supportedCommands }];
  const map: Record<string, Array<{ title: string; items: string[] }>> = {
    priorities: [{ title: "Priority ranking", items: output.priorityRanking }, { title: "Next best actions", items: output.suggestedNextActions }],
    attention: [{ title: "Attention queue", items: output.attentionQueue.map((item) => `${item.severity}: ${item.title} — ${item.detail}`) }],
    blockers: [{ title: "Blockers", items: output.blockers }],
    activity: [{ title: "Timeline", items: output.timeline }],
    workforce: [{ title: "AI workforce", items: output.attentionQueue.filter((item) => item.source === "agent_registry" || item.source === "agent_activity").map((item) => `${item.title} — ${item.detail}`) }],
    brief: [{ title: "Executive brief", items: [output.executiveBrief] }, { title: "Recommendations", items: output.recommendations.map((item) => `${item.title}: ${item.action}`) }, { title: "Timeline", items: output.timeline }],
  };
  const sections = map[commandKey];
  if (commandKey === "workforce" && sections[0].items.length === 0) return [{ title: "AI workforce", items: ["No AI workforce exceptions found."] }];
  return sections;
}
