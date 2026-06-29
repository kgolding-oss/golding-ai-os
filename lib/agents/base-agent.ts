export type AgentHealth = "healthy" | "degraded" | "unhealthy";

export type StructuredAgentOutput = {
  status: "success" | "empty" | "unsupported";
  summary: string;
  generatedAt: string;
  sections: Array<{ title: string; items: string[] }>;
};

export type AgentRunContext<TInput> = {
  input: TInput;
  command?: string;
  now?: Date;
};

export type AgentRunResult<TOutput extends StructuredAgentOutput> = {
  agentId: string;
  command?: string;
  output: TOutput;
};

export interface BaseAgent<TInput, TOutput extends StructuredAgentOutput> {
  id: string;
  name: string;
  role: string;
  purpose: string;
  scope: string[];
  availableActions: string[];
  health: AgentHealth;
  run(context: AgentRunContext<TInput>): AgentRunResult<TOutput>;
}
