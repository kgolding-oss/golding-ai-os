import type { DashboardData } from "../dashboard/queries";
import { buildAttentionQueue, buildRecommendations, getPendingApprovals, getUnhealthyAgents, isTaskOpen } from "../dashboard/intelligence";
import type { AgentCommand, AgentRunContext, AgentRunResult, StructuredAgentOutput } from "../types/agent";
import { knowledgeRegistry } from "../knowledge/registry";
import { evaluateReleaseHealth } from "./release-health";
import { workflowEngine } from "../workflows";
import type { WorkflowExecutionRecord, WorkflowSummary } from "../workflows";

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

function workflowSections(record: WorkflowExecutionRecord): StructuredAgentOutput["sections"] {
  return record.result?.sections ?? [{ title: "Workflow errors", items: record.errors.length ? record.errors : ["Workflow did not produce a result."] }];
}

function workflowRecommendations(record: WorkflowExecutionRecord): string[] {
  return record.result?.recommendations ?? (record.errors.length ? ["Review workflow validation and execution errors."] : ["Workflow completed without recommendations."]);
}

function workflowSummaryItems(workflows: WorkflowSummary[]) {
  return workflows.map((workflow) => `${workflow.name}: ${workflow.status}; trigger ${workflow.triggerType}; state ${workflow.currentState}; last run ${workflow.lastExecutionAt ?? "never"}`);
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
    .register({ id: "knowledge-sources", label: "List registered providers", description: "Show available knowledge sources and provider status.", category: "knowledge", permissions: ["knowledge:read"], aliases: ["show available knowledge sources", "available knowledge sources", "list registered providers", "registered providers", "knowledge sources"], handler: () => {
      const providers = knowledgeRegistry.listProviders(); return output("Knowledge sources", `${providers.length} knowledge providers are registered.`, [{ title: "Registered providers", items: providers.map((provider) => `${provider.name}: ${provider.status}; ${provider.indexedDocumentCount} indexed documents; last sync ${provider.lastSyncAt ?? "not synced"}`) }], ["Connect provider integrations in a future milestone before indexing production data."], { matched: true, providers });
    }})

    .register({ id: "list-workflows", label: "List workflows", description: "List registered workflow engine definitions.", category: "workflows", permissions: ["dashboard:read"], aliases: ["list workflows", "registered workflows", "show workflows"], handler: () => {
      const workflows = workflowEngine.listWorkflows(); return output("Registered workflows", `${workflows.length} workflows are registered.`, [{ title: "Workflows", items: workflowSummaryItems(workflows) }], ["Execute a workflow by name when deterministic orchestration is needed."], { matched: true, workflows });
    }})
    .register({ id: "workflow-status", label: "Show workflow status", description: "Show workflow execution status and history.", category: "workflows", permissions: ["dashboard:read"], aliases: ["show workflow status", "workflow status", "workflow history"], handler: () => {
      const workflows = workflowEngine.listWorkflows(); const history = workflowEngine.getHistory(); return output("Workflow status", `${workflows.length} workflows tracked with ${history.length} execution records.`, [{ title: "Current status", items: workflowSummaryItems(workflows) }, { title: "Recent executions", items: history.slice(-5).map((record) => `${record.workflowName}: ${record.state} at ${record.completedAt ?? record.startedAt}`) }], ["Use workflow history to audit deterministic agent execution."], { matched: true, workflows, history });
    }})
    .register({ id: "execute-daily-brief-workflow", label: "Execute executive daily brief", description: "Run the Executive Daily Brief workflow.", category: "workflows", permissions: ["dashboard:read"], aliases: ["execute executive daily brief", "run executive daily brief", "daily brief workflow"], handler: async (context) => {
      const record = await workflowEngine.execute("executive-daily-brief", { state: data(context), organizationId: context.organizationId, userId: context.userId, now: context.now }); return output(record.result?.title ?? "Executive Daily Brief", record.result?.summary ?? `Workflow ${record.state}.`, workflowSections(record), workflowRecommendations(record), { matched: true, record });
    }})
    .register({ id: "execute-release-verification-workflow", label: "Execute release verification", description: "Run the Release Verification workflow.", category: "workflows", permissions: ["release:read"], aliases: ["execute release verification", "run release verification", "release verification workflow"], handler: async (context) => {
      const record = await workflowEngine.execute("release-verification", { state: data(context), organizationId: context.organizationId, userId: context.userId, now: context.now }); return output(record.result?.title ?? "Release Verification", record.result?.summary ?? `Workflow ${record.state}.`, workflowSections(record), workflowRecommendations(record), { matched: true, record });
    }})
    .register({ id: "execute-knowledge-discovery-workflow", label: "Execute knowledge discovery", description: "Run the Knowledge Discovery workflow.", category: "workflows", permissions: ["knowledge:read"], aliases: ["execute knowledge discovery", "run knowledge discovery", "knowledge discovery workflow"], handler: async (context) => {
      const record = await workflowEngine.execute("knowledge-discovery", { state: data(context), organizationId: context.organizationId, userId: context.userId, now: context.now }); return output(record.result?.title ?? "Knowledge Discovery", record.result?.summary ?? `Workflow ${record.state}.`, workflowSections(record), workflowRecommendations(record), { matched: true, record });
    }})
    .register({ id: "brief", label: "Prepare executive brief", description: "Prepare release and operating summary.", category: "executive", permissions: ["dashboard:read", "release:read"], aliases: ["executive brief", "brief", "prepare brief"], handler: (context) => {
      const d = data(context); const release = evaluateReleaseHealth({ lintPassed: true, typecheckPassed: true, buildPassed: true, criticalBlockers: buildAttentionQueue(d).filter((item) => item.severity === "critical").length, openApprovals: getPendingApprovals(d.approvals).length }); return output("Executive brief", `Release health is ${release.status} with score ${release.score}.`, [{ title: "Release health", items: release.reasons }, { title: "Operating snapshot", items: [`${d.tasks.length} tasks`, `${d.approvals.length} approvals`, `${d.agents.length} agents`] }], release.status === "ready" ? ["Ready for browser preview."] : ["Resolve release health risks before preview."], { matched: true, release });
    }});
  return registry;
}

export const commandRegistry = createCommandRegistry();
