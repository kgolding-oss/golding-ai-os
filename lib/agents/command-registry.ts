import type { DashboardData } from "../dashboard/queries";
import { buildAttentionQueue, buildRecommendations, getPendingApprovals, getUnhealthyAgents, isTaskOpen } from "../dashboard/intelligence";
import type { AgentCommand, AgentRunContext, AgentRunResult, StructuredAgentOutput } from "../types/agent";
import { evaluateReleaseHealth } from "./release-health";

export type CommandAgentInput = { command: string };
export type CommandAgentContext = AgentRunContext<CommandAgentInput, DashboardData>;
export type CommandDefinition = AgentCommand<CommandAgentContext, AgentRunResult>;

function normalizeCommand(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function data(context: CommandAgentContext): DashboardData {
  return context.state ?? { organizations: [], projects: [], tasks: [], approvals: [], agents: [], activity: [], health: [], auditLogs: [], memberships: [], userPreferences: [] };
}

function output(title: string, summary: string, sections: StructuredAgentOutput["sections"], recommendations: string[], metadata: Record<string, unknown> = {}): AgentRunResult {
  return { agentId: "executive-command-agent", status: "idle", health: "healthy", errors: [], output: { title, summary, sections, recommendations, metadata } };
}

export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();

  register(command: CommandDefinition) {
    this.commands.set(command.id, command);
    return this;
  }

  list() {
    return Array.from(this.commands.values());
  }

  match(commandText: string) {
    const normalized = normalizeCommand(commandText);
    return this.list().find((command) => [command.label, ...command.aliases].some((alias) => normalizeCommand(alias) === normalized || normalized.includes(normalizeCommand(alias))));
  }

  async execute(context: CommandAgentContext, commandText: string) {
    const match = this.match(commandText);
    if (!match) return this.help(commandText);
    return match.handler(context, commandText);
  }

  help(commandText: string): AgentRunResult {
    const supported = this.list().map((command) => `${command.label} (${command.aliases.join(", ")})`);
    return output("Command help", `I do not recognize “${commandText || "empty command"}”.`, [{ title: "Supported commands", items: supported }], ["Use one of the supported command labels or aliases."], { commandText, matched: false });
  }
}

export function createCommandRegistry() {
  const registry = new CommandRegistry();
  registry
    .register({ id: "priorities", label: "Review today's priorities", description: "Rank urgent work and approvals.", category: "priorities", permissions: ["dashboard:read"], aliases: ["today priorities", "priorities", "review priorities"], handler: (context) => {
      const d = data(context); const recommendations = buildRecommendations({ ...d, organization: d.organizations[0] ?? null, membershipCount: d.memberships.length }); const openTasks = d.tasks.filter(isTaskOpen);
      return output("Today's priorities", `${recommendations.length} recommendations and ${openTasks.length} open tasks are visible.`, [{ title: "Recommendations", items: recommendations.map((r) => `${r.severity}: ${r.title}`) || [] }, { title: "Open tasks", items: openTasks.slice(0, 5).map((task) => task.title) }], recommendations.map((r) => r.action), { matched: true });
    }})
    .register({ id: "attention", label: "What needs my attention?", description: "Show immediate attention queue.", category: "attention", permissions: ["dashboard:read"], aliases: ["attention", "needs attention", "what needs attention"], handler: (context) => {
      const queue = buildAttentionQueue(data(context)); return output("Attention queue", `${queue.length} items need review.`, [{ title: "Items", items: queue.map((item) => `${item.severity}: ${item.title} — ${item.detail}`) }], queue.slice(0, 3).map((item) => `Review ${item.title}.`), { matched: true });
    }})
    .register({ id: "blockers", label: "Show blockers", description: "Summarize blocked and overdue work.", category: "execution", permissions: ["dashboard:read"], aliases: ["blockers", "blocked", "show blocked work"], handler: (context) => {
      const blockers = data(context).tasks.filter((task) => String(task.status ?? "").toLowerCase() === "blocked"); return output("Execution blockers", `${blockers.length} blocked tasks found.`, [{ title: "Blocked tasks", items: blockers.map((task) => task.title) }], blockers.length ? ["Assign owners and next actions to blocked tasks."] : ["No blocked task records are visible."], { matched: true });
    }})
    .register({ id: "activity", label: "Summarize recent activity", description: "Summarize activity and audit logs.", category: "activity", permissions: ["dashboard:read"], aliases: ["activity", "recent activity", "summarize activity"], handler: (context) => {
      const d = data(context); return output("Recent activity", `${d.activity.length} agent activities and ${d.auditLogs.length} audit events are visible.`, [{ title: "Agent activity", items: d.activity.map((item) => item.summary) }, { title: "Audit events", items: d.auditLogs.map((item) => item.action) }], ["Review failed or denied events before release decisions."], { matched: true });
    }})
    .register({ id: "workforce", label: "Review AI workforce", description: "Review agent health.", category: "agents", permissions: ["agents:read"], aliases: ["ai workforce", "agents", "agent health"], handler: (context) => {
      const agents = data(context).agents; const unhealthy = getUnhealthyAgents(agents); return output("AI workforce", `${agents.length} agents registered; ${unhealthy.length} need health review.`, [{ title: "Agents", items: agents.map((agent) => `${agent.name}: ${agent.health ?? agent.status ?? "unknown"}`) }], unhealthy.length ? ["Inspect unhealthy agents before assigning automated workflows."] : ["AI workforce health is clear."], { matched: true });
    }})
    .register({ id: "brief", label: "Prepare executive brief", description: "Prepare release and operating summary.", category: "executive", permissions: ["dashboard:read", "release:read"], aliases: ["executive brief", "brief", "prepare brief"], handler: (context) => {
      const d = data(context); const release = evaluateReleaseHealth({ lintPassed: true, typecheckPassed: true, buildPassed: true, criticalBlockers: buildAttentionQueue(d).filter((item) => item.severity === "critical").length, openApprovals: getPendingApprovals(d.approvals).length }); return output("Executive brief", `Release health is ${release.status} with score ${release.score}.`, [{ title: "Release health", items: release.reasons }, { title: "Operating snapshot", items: [`${d.tasks.length} tasks`, `${d.approvals.length} approvals`, `${d.agents.length} agents`] }], release.status === "ready" ? ["Ready for browser preview."] : ["Resolve release health risks before preview."], { matched: true, release });
    }});
  return registry;
}

export const commandRegistry = createCommandRegistry();
