import type { DashboardData } from "../dashboard/queries";
import type { StructuredAgentOutput } from "../types/agent";

export type WorkflowTriggerType = "manual" | "scheduled" | "event" | "agent";
export type WorkflowExecutionState = "pending" | "validating" | "running" | "succeeded" | "failed" | "cancelled";
export type WorkflowStatus = "ready" | "disabled" | "blocked";

export type WorkflowContext<TInput = unknown> = {
  input?: TInput;
  state?: DashboardData;
  organizationId?: string | null;
  userId?: string | null;
  now?: Date;
};

export type WorkflowValidationResult = { valid: boolean; errors: string[] };
export type WorkflowResult<TData = unknown> = StructuredAgentOutput<TData> & { workflowId: string; executionId: string };
export type WorkflowExecutionRecord<TData = unknown> = {
  id: string;
  workflowId: string;
  workflowName: string;
  state: WorkflowExecutionState;
  startedAt: string;
  completedAt?: string;
  errors: string[];
  result?: WorkflowResult<TData>;
};

export type WorkflowSummary = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  currentState: WorkflowExecutionState;
  lastExecutionAt: string | null;
};

export interface Workflow<TInput = unknown, TData = unknown> {
  id: string;
  name: string;
  description: string;
  version: string;
  triggerType: WorkflowTriggerType;
  status: WorkflowStatus;
  validate(context: WorkflowContext<TInput>): WorkflowValidationResult;
  execute(context: WorkflowContext<TInput>, executionId: string): Promise<WorkflowResult<TData>>;
}
