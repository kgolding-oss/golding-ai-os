import type { AgentHealth, AgentStatus, BaseAgent } from "../types/agent";

export type AgentMessageType = "request" | "response" | "event" | "notification" | "delegation" | "completion" | "failure" | "health_update" | "heartbeat";
export type AgentMessagePriority = "low" | "normal" | "high" | "critical";
export type AgentMessageStatus = "draft" | "queued" | "sent" | "delivered" | "processing" | "completed" | "failed" | "cancelled";
export type TaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "retrying";
export type OrchestrationEventType = "message.sent" | "task.enqueued" | "task.started" | "task.completed" | "task.failed" | "task.cancelled" | "agent.heartbeat" | "health.updated";

export type AgentEndpoint = { id: string; name?: string; role?: string };
export type AgentMessage<TPayload = unknown> = {
  id: string; correlationId: string; organizationId: string | null; workflowId: string | null;
  sender: AgentEndpoint; recipient: AgentEndpoint; timestamp: string; type: AgentMessageType;
  priority: AgentMessagePriority; payload: TPayload; metadata: Record<string, unknown>; status: AgentMessageStatus;
};
export type ExecutionContext<TInput = unknown> = { id: string; organizationId: string | null; workflowId: string | null; taskId: string; agentId: string; input: TInput; metadata: Record<string, unknown>; createdAt: string; startedAt?: string; completedAt?: string; attempts: number; idempotencyKey: string };
export type QueuedTask<TPayload = unknown> = { id: string; agentId: string; organizationId: string | null; workflowId: string | null; message: AgentMessage<TPayload>; priority: AgentMessagePriority; status: TaskStatus; attempts: number; maxAttempts: number; createdAt: string; updatedAt: string; scheduledFor?: string; idempotencyKey: string; lastError?: string };
export type TaskExecutionRecord = { taskId: string; agentId: string; organizationId: string | null; workflowId: string | null; status: TaskStatus; startedAt: string; completedAt?: string; runtimeMs: number; attempts: number; error?: string };
export type AgentRuntimeMetrics = { agentId: string; executionCount: number; successCount: number; failureCount: number; successRate: number; failureRate: number; averageRuntimeMs: number; lastExecutionAt?: string; queuedWork: number; currentActivity: string; healthScore: number };
export type AgentHealthSnapshot = AgentRuntimeMetrics & { availability: AgentStatus; health: AgentHealth; lastHeartbeatAt?: string };
export type OrchestrationHealth = { status: AgentHealth; registeredAgents: number; runningAgents: number; idleAgents: number; queuedWork: number; completedWork: number; failedWork: number; throughputPerMinute: number; healthScore: number; generatedAt: string };
export type OrchestrationEvent<TPayload = unknown> = { id: string; type: OrchestrationEventType; timestamp: string; organizationId: string | null; workflowId: string | null; agentId?: string; taskId?: string; payload: TPayload };
export type RegisteredAgent = BaseAgent & { source: "runtime" | "dashboard" | "system" };
export type AgentRegistrySource = { listAgents(): RegisteredAgent[] };
