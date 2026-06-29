import type { AgentCommand, AgentHealth, AgentRunContext, AgentRunResult, AgentScope, AgentStatus, AgentTool, BaseAgent as BaseAgentContract, StructuredAgentOutput } from "../types/agent";

export type BaseAgentOptions = {
  id: string;
  name: string;
  role: string;
  description: string;
  version: string;
  organizationScope?: AgentScope;
  health?: AgentHealth;
  status?: AgentStatus;
  availableCommands?: AgentCommand[];
  availableTools?: AgentTool[];
};

export abstract class AbstractBaseAgent<TInput = unknown, TState = unknown, TData = unknown> implements BaseAgentContract<TInput, TState, TData> {
  id: string;
  name: string;
  role: string;
  description: string;
  version: string;
  organizationScope: AgentScope;
  health: AgentHealth;
  status: AgentStatus;
  availableCommands: AgentCommand[];
  availableTools: AgentTool[];

  protected constructor(options: BaseAgentOptions) {
    this.id = options.id;
    this.name = options.name;
    this.role = options.role;
    this.description = options.description;
    this.version = options.version;
    this.organizationScope = options.organizationScope ?? "organization";
    this.health = options.health ?? "healthy";
    this.status = options.status ?? "idle";
    this.availableCommands = options.availableCommands ?? [];
    this.availableTools = options.availableTools ?? [];
  }

  abstract run(context: AgentRunContext<TInput, TState>): Promise<AgentRunResult<TData>>;

  validate(): string[] {
    const errors: string[] = [];
    if (!this.id) errors.push("Agent id is required.");
    if (!this.name) errors.push("Agent name is required.");
    if (!this.role) errors.push("Agent role is required.");
    if (!this.version) errors.push("Agent version is required.");
    return errors;
  }

  getRecommendations(): string[] {
    if (this.health === "unhealthy" || this.health === "offline") return ["Pause dependent workflows until agent health is restored."];
    if (this.status === "blocked") return ["Resolve blocking validation errors before executing commands."];
    return ["Agent is ready for deterministic command execution."];
  }

  getHealth(): AgentHealth {
    return this.health;
  }

  getSummary(): StructuredAgentOutput {
    return {
      title: this.name,
      summary: this.description,
      sections: [
        { title: "Role", items: [this.role] },
        { title: "Capabilities", items: this.availableCommands.map((command) => command.label) },
      ],
      recommendations: this.getRecommendations(),
      metadata: { id: this.id, version: this.version, status: this.status, health: this.health, organizationScope: this.organizationScope },
    };
  }

  protected result<TOutputData>(output: StructuredAgentOutput<TOutputData>, errors: string[] = []): AgentRunResult<TOutputData> {
    this.status = errors.length ? "blocked" : "idle";
    this.health = errors.length ? "degraded" : this.health;
    return { agentId: this.id, status: this.status, health: this.health, output, errors };
  }
}

export type { AgentCommand, AgentHealth, AgentRunContext, AgentRunResult, AgentScope, AgentStatus, AgentTool, BaseAgentContract as BaseAgent, StructuredAgentOutput };
