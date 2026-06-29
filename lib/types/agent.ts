export type AgentHealth = "healthy" | "degraded" | "unhealthy" | "offline";
export type AgentStatus = "idle" | "running" | "blocked" | "disabled";
export type AgentScope = "global" | "organization" | "user";

export type StructuredAgentOutput<TData = unknown> = {
  title: string;
  summary: string;
  sections: Array<{ title: string; items: string[] }>;
  recommendations: string[];
  metadata: Record<string, unknown>;
  data?: TData;
};

export type AgentRunContext<TInput = unknown, TState = unknown> = {
  input?: TInput;
  state?: TState;
  organizationId?: string | null;
  userId?: string | null;
  now?: Date;
};

export type AgentRunResult<TData = unknown> = {
  agentId: string;
  status: AgentStatus;
  health: AgentHealth;
  output: StructuredAgentOutput<TData>;
  errors: string[];
};

export type AgentCommand<TContext = AgentRunContext, TResult = AgentRunResult> = {
  id: string;
  label: string;
  description: string;
  category: string;
  permissions: string[];
  aliases: string[];
  handler: (context: TContext, commandText: string) => TResult | Promise<TResult>;
};

export type AgentTool = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

export interface BaseAgent<TInput = unknown, TState = unknown, TData = unknown> {
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
  run(context: AgentRunContext<TInput, TState>): Promise<AgentRunResult<TData>>;
  validate(context?: AgentRunContext<TInput, TState>): string[];
  getRecommendations(context?: AgentRunContext<TInput, TState>): string[];
  getHealth(): AgentHealth;
  getSummary(): StructuredAgentOutput;
}
