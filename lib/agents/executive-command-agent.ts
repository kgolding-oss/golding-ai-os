import { buildAttentionQueue, buildRecommendations, getFailedActivity, getPendingApprovals, getUnhealthyAgents, isTaskOpen } from "../dashboard/intelligence";
import type { AgentCommand, AgentCommandContext, AgentCommandResponse, ExecutiveCommandOutput, TimelineItem } from "../types/agent";
import { BaseAgent } from "./base-agent";
import { CommandRegistry } from "./command-registry";

function buildTimeline(context: AgentCommandContext): TimelineItem[] {
  const activity = context.data.activity.map((item) => ({ id: `activity-${item.id}`, title: item.activity_type, detail: item.summary, occurredAt: item.created_at ?? null, source: "agent_activity" }));
  const audits = context.data.auditLogs.map((item) => ({ id: `audit-${item.id}`, title: item.action, detail: item.entity_table ?? "Audit event", occurredAt: item.created_at ?? null, source: "audit_logs" }));
  return [...activity, ...audits].sort((a, b) => new Date(b.occurredAt ?? 0).getTime() - new Date(a.occurredAt ?? 0).getTime()).slice(0, 10);
}

function buildOutput(context: AgentCommandContext): ExecutiveCommandOutput {
  const attentionQueue = buildAttentionQueue(context.data);
  const recommendations = buildRecommendations({ ...context.data, organization: context.organization, membershipCount: context.membershipCount });
  const pendingApprovals = getPendingApprovals(context.data.approvals).length;
  const openTasks = context.data.tasks.filter(isTaskOpen).length;
  const unhealthyAgents = getUnhealthyAgents(context.data.agents).length;
  const { failedAgentActivity, failedAuditLogs } = getFailedActivity(context.data.activity, context.data.auditLogs);
  const blockers = attentionQueue.filter((item) => item.severity === "critical" || item.source === "system_health" || /block/i.test(item.title + item.detail));
  return {
    executiveBrief: {
      title: context.organization ? `${context.organization.name} executive brief` : "Executive brief unavailable",
      summary: context.organization ? `${pendingApprovals} approvals, ${openTasks} open tasks, ${unhealthyAgents} agent exceptions, and ${blockers.length} blockers need visibility.` : "Select an active organization to generate deterministic command intelligence.",
      metrics: { pendingApprovals, openTasks, unhealthyAgents, blockers: blockers.length, recentActivity: context.data.activity.length, failedEvents: failedAgentActivity.length + failedAuditLogs.length },
      organization: context.organization,
      generatedAt: (context.now ?? new Date()).toISOString(),
    },
    attentionQueue,
    recommendations,
    blockers,
    timeline: buildTimeline(context),
    suggestedNextActions: recommendations.slice(0, 4).map((recommendation) => ({ id: `next-${recommendation.id}`, label: recommendation.action, reason: recommendation.rationale })),
  };
}

function response(command: AgentCommand, context: AgentCommandContext): AgentCommandResponse {
  return { commandId: command.id, label: command.label, output: buildOutput(context) };
}

export function createExecutiveCommands(): AgentCommand[] {
  const definitions: Array<Omit<AgentCommand, "handler">> = [
    { id: "review-priorities", label: "Review today's priorities", description: "Rank the live work queue by urgency and executive relevance.", category: "priorities", permissions: ["read:dashboard"], phrases: ["priorities", "today priorities"] },
    { id: "attention", label: "What needs my attention?", description: "Show approvals, urgent work, and operating exceptions requiring review.", category: "attention", permissions: ["read:dashboard"], phrases: ["attention", "what needs attention"] },
    { id: "blockers", label: "Show blockers", description: "List critical blockers from tasks, services, approvals, and activity.", category: "blockers", permissions: ["read:dashboard"], phrases: ["blockers", "show me blockers"] },
    { id: "recent-activity", label: "Summarize recent activity", description: "Summarize recent agent and audit events.", category: "activity", permissions: ["read:dashboard"], phrases: ["activity", "recent activity"] },
    { id: "ai-workforce", label: "Review AI workforce", description: "Review active agents and health exceptions.", category: "workforce", permissions: ["read:agents"], phrases: ["agents", "ai workforce"] },
    { id: "executive-brief", label: "Prepare executive brief", description: "Prepare the deterministic operating brief for the active organization.", category: "brief", permissions: ["read:dashboard"], phrases: ["brief", "executive brief"] },
  ];
  return definitions.map((definition) => ({ ...definition, handler: (context) => response({ ...definition, handler: () => { throw new Error("Unused command placeholder"); } }, context) }));
}

export class ExecutiveCommandAgent extends BaseAgent<{ command: string; context: AgentCommandContext }, AgentCommandResponse> {
  private readonly registry: CommandRegistry;

  constructor(registry = new CommandRegistry(createExecutiveCommands())) {
    super({ id: "executive-command-agent", name: "Executive Command Agent", role: "Executive operating system coordinator", description: "Deterministic command layer for priorities, blockers, recommendations, activity, and AI workforce status.", version: "1.0.0", availableCommands: registry.list() });
    this.registry = registry;
  }

  run(input: { command: string; context: AgentCommandContext }): AgentCommandResponse {
    return this.registry.execute(input.command, input.context);
  }

  execute(command: string, context: AgentCommandContext) {
    return this.run({ command, context });
  }

  getRecommendations(context?: AgentCommandContext) {
    return context ? buildRecommendations({ ...context.data, organization: context.organization, membershipCount: context.membershipCount }) : [];
  }
}
