import type { Activity, Agent, Approval, AuditLog, DashboardData, Health, Organization, Project, Task } from "../dashboard/queries";

export type Severity = "critical" | "high" | "medium" | "low";
export type AgentStatus = "active" | "inactive" | "paused" | "draft";
export type AgentHealth = "healthy" | "degraded" | "unhealthy" | "offline" | "unknown";

export type OrganizationScope = {
  organizationId?: string | null;
  organizationName?: string | null;
};

export type AgentTool = {
  id: string;
  label: string;
  description: string;
};

export type AgentCommandPermission = "read:dashboard" | "read:agents" | "read:release" | "write:tasks";

export type AgentCommandContext = {
  data: DashboardData;
  organization: Organization | null;
  membershipCount: number;
  now?: Date;
};

export type AgentCommandHandler<TOutput = AgentCommandResponse> = (context: AgentCommandContext) => TOutput;

export type AgentCommand<TOutput = AgentCommandResponse> = {
  id: string;
  label: string;
  description: string;
  category: "priorities" | "attention" | "blockers" | "activity" | "workforce" | "brief" | "help";
  permissions: AgentCommandPermission[];
  phrases?: string[];
  handler: AgentCommandHandler<TOutput>;
};

export type AttentionItem = { id: string; title: string; detail: string; severity: Severity; source: string };
export type Recommendation = { id: string; title: string; rationale: string; action: string; severity: Severity };
export type TimelineItem = { id: string; title: string; detail: string; occurredAt: string | null; source: string };
export type ExecutiveBrief = { title: string; summary: string; metrics: Record<string, number>; organization: Organization | null; generatedAt: string };
export type SuggestedNextAction = { id: string; label: string; reason: string; commandId?: string };

export type ExecutiveCommandOutput = {
  executiveBrief: ExecutiveBrief;
  attentionQueue: AttentionItem[];
  recommendations: Recommendation[];
  blockers: AttentionItem[];
  timeline: TimelineItem[];
  suggestedNextActions: SuggestedNextAction[];
};

export type AgentCommandResponse = {
  commandId: string;
  label: string;
  output: ExecutiveCommandOutput;
  help?: { message: string; availableCommands: Array<Pick<AgentCommand, "id" | "label" | "description" | "category">> };
};

export type AgentValidationResult = { valid: boolean; issues: string[] };
export type AgentSummary = { id: string; name: string; role: string; description: string; version: string; health: AgentHealth; status: AgentStatus; commandCount: number; toolCount: number; organizationScope: OrganizationScope };

export interface AgentRuntime<TInput = unknown, TOutput = unknown> {
  run(input: TInput): TOutput | Promise<TOutput>;
  validate(): AgentValidationResult;
  getRecommendations(context?: AgentCommandContext): Recommendation[];
  getHealth(): AgentHealth;
  getSummary(): AgentSummary;
}

export type DashboardEntity = Activity | Agent | Approval | AuditLog | Health | Organization | Project | Task;
