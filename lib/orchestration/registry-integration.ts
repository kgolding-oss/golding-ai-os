import type { Agent } from "../dashboard/queries";
import type { AgentRunContext, AgentRunResult, BaseAgent } from "../types/agent";
import { executiveCommandAgent } from "../agents/command-agent";
import { chiefOfStaffAgent } from "../agents/chief-of-staff";
import { grantDevelopmentAgent } from "../agents/grant-development";
import { crmRelationshipAgent } from "../agents/crm";
import type { RegisteredAgent } from "./types";
class DashboardRegisteredAgent implements BaseAgent {
  health = "healthy" as const; status = "idle" as const; version = "dashboard"; organizationScope = "organization" as const; availableCommands = []; availableTools = [];
  constructor(private readonly record: Agent) {}
  get id() { return this.record.id; } get name() { return this.record.name; } get role() { return this.record.role ?? "Registered dashboard agent"; } get description() { return `${this.name} registry adapter`; }
  async run(_context: AgentRunContext): Promise<AgentRunResult> { return { agentId: this.id, status: "idle", health: this.getHealth(), errors: [], output: this.getSummary() }; }
  validate() { return []; } getRecommendations() { return ["Attach a deterministic runtime handler before autonomous execution."]; } getHealth() { return (this.record.health as BaseAgent["health"]) ?? "healthy"; }
  getSummary() { return { title: this.name, summary: this.description, sections: [{ title: "Registry", items: [`Status: ${this.record.status ?? "draft"}`, `Role: ${this.role}`] }], recommendations: this.getRecommendations(), metadata: { source: "dashboard", record: this.record } }; }
}
export function buildRegisteredAgents(records: Agent[] = []): RegisteredAgent[] {
  const systemAgents = [executiveCommandAgent, chiefOfStaffAgent, grantDevelopmentAgent, crmRelationshipAgent].map((agent) => { const registered = agent as unknown as RegisteredAgent; registered.source = "system"; return registered; });
  return [...systemAgents, ...records.map((record) => { const agent = new DashboardRegisteredAgent(record) as unknown as RegisteredAgent; agent.source = "dashboard"; return agent; })];
}
