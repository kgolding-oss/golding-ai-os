import type { AgentCommand, AgentCommandContext, AgentHealth, AgentRuntime, AgentStatus, AgentSummary, AgentTool, AgentValidationResult, OrganizationScope, Recommendation } from "../types/agent";

export abstract class BaseAgent<TInput = unknown, TOutput = unknown> implements AgentRuntime<TInput, TOutput> {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly version: string;
  readonly organizationScope: OrganizationScope;
  protected health: AgentHealth;
  protected status: AgentStatus;
  readonly availableCommands: AgentCommand[];
  readonly availableTools: AgentTool[];

  protected constructor(config: { id: string; name: string; role: string; description: string; version: string; organizationScope?: OrganizationScope; health?: AgentHealth; status?: AgentStatus; availableCommands?: AgentCommand[]; availableTools?: AgentTool[] }) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.description = config.description;
    this.version = config.version;
    this.organizationScope = config.organizationScope ?? {};
    this.health = config.health ?? "healthy";
    this.status = config.status ?? "active";
    this.availableCommands = config.availableCommands ?? [];
    this.availableTools = config.availableTools ?? [];
  }

  abstract run(input: TInput): TOutput | Promise<TOutput>;

  validate(): AgentValidationResult {
    const issues = [
      this.id ? null : "Agent id is required.",
      this.name ? null : "Agent name is required.",
      this.role ? null : "Agent role is required.",
      this.version ? null : "Agent version is required.",
    ].filter((issue): issue is string => Boolean(issue));

    return { valid: issues.length === 0, issues };
  }

  getRecommendations(_context?: AgentCommandContext): Recommendation[] {
    return [];
  }

  getHealth(): AgentHealth {
    return this.health;
  }

  getSummary(): AgentSummary {
    return { id: this.id, name: this.name, role: this.role, description: this.description, version: this.version, health: this.health, status: this.status, commandCount: this.availableCommands.length, toolCount: this.availableTools.length, organizationScope: this.organizationScope };
  }
}
