import type { AgentMessagePriority, OrchestrationHealth, QueuedTask, RegisteredAgent } from "./types";
import type { Agent } from "../dashboard/queries";
import { AgentBus } from "./agent-bus";
import { OrchestrationEventSystem } from "./event-system";
import { LifecycleManager } from "./lifecycle-manager";
import { calculateAgentMetrics, calculateSystemHealth } from "./metrics";
import { buildRegisteredAgents } from "./registry-integration";
import { OrchestrationStateManager } from "./state-manager";
import { InMemoryTaskQueue } from "./task-queue";
import { createId, nowIso } from "./utils";
import { recordOrchestrationEvent, recordOrchestrationMessage, recordOrchestrationTask } from "../persistence";

export class AgentOrchestrator {
  readonly bus = new AgentBus(); readonly events = new OrchestrationEventSystem(); readonly queue = new InMemoryTaskQueue(); readonly lifecycle = new LifecycleManager(); readonly state = new OrchestrationStateManager();
  constructor(private readonly agents: RegisteredAgent[] = buildRegisteredAgents()) {}
  static fromDashboardAgents(agents: Agent[]) { return new AgentOrchestrator(buildRegisteredAgents(agents)); }
  discoverAgents() { return [...this.agents]; }
  getAgent(agentId: string) { return this.agents.find((agent) => agent.id === agentId) ?? null; }
  delegate(input: { fromAgentId?: string; toAgentId: string; organizationId?: string | null; workflowId?: string | null; payload: unknown; priority?: AgentMessagePriority; metadata?: Record<string, unknown>; accessToken?: string | null; userId?: string | null }): QueuedTask {
    const sender = this.getAgent(input.fromAgentId ?? "executive-command-agent"); const recipient = this.getAgent(input.toAgentId); if (!recipient) throw new Error(`Agent ${input.toAgentId} is not registered.`);
    const message = this.bus.publish(this.bus.createMessage({ type: "delegation", organizationId: input.organizationId, workflowId: input.workflowId, sender: { id: sender?.id ?? "system", name: sender?.name }, recipient: { id: recipient.id, name: recipient.name, role: recipient.role }, payload: input.payload, priority: input.priority, metadata: input.metadata }));
    const task = this.queue.enqueue(message); const event = { type: "task.enqueued" as const, organizationId: task.organizationId, workflowId: task.workflowId, agentId: task.agentId, taskId: task.id, payload: task }; const emittedEvent = this.events.emit(event); const pc = { token: input.accessToken, organizationId: input.organizationId, profileId: input.userId, correlationId: message.correlationId }; void recordOrchestrationMessage(pc, message); void recordOrchestrationTask(pc, task); void recordOrchestrationEvent(pc, emittedEvent); return task;
  }
  runNext(agentId?: string) { const task = this.queue.dequeue(agentId); if (!task) return null; const startedAt = nowIso(); this.events.emit({ type: "task.started", organizationId: task.organizationId, workflowId: task.workflowId, agentId: task.agentId, taskId: task.id, payload: task }); const context = this.state.create({ id: createId("ctx"), organizationId: task.organizationId, workflowId: task.workflowId, taskId: task.id, agentId: task.agentId, input: task.message.payload, metadata: task.message.metadata, createdAt: task.createdAt, startedAt, attempts: task.attempts, idempotencyKey: task.idempotencyKey }); const completedAt = nowIso(); const record = { taskId: task.id, agentId: task.agentId, organizationId: task.organizationId, workflowId: task.workflowId, status: context ? "completed" as const : "failed" as const, startedAt, completedAt, runtimeMs: Date.parse(completedAt) - Date.parse(startedAt), attempts: task.attempts, error: context ? undefined : "Duplicate execution prevented" }; this.queue.record(record); this.state.record(record); this.events.emit({ type: record.status === "completed" ? "task.completed" : "task.failed", organizationId: task.organizationId, workflowId: task.workflowId, agentId: task.agentId, taskId: task.id, payload: record }); return record; }
  heartbeat(agentId: string) { const at = this.lifecycle.heartbeat(agentId); this.events.emit({ type: "agent.heartbeat", organizationId: null, workflowId: null, agentId, payload: { lastHeartbeatAt: at } }); return at; }
  agentMetrics(agentId: string) { return calculateAgentMetrics(agentId, this.queue.history(), this.queue.inspect(), this.lifecycle.getHeartbeat(agentId)); }
  health(): OrchestrationHealth { const snapshots = this.agents.map((agent) => this.agentMetrics(agent.id)); return calculateSystemHealth(this.agents.length, snapshots, this.queue.inspect(), this.queue.history()); }
  workforce() { return { agents: this.agents.map((agent) => this.lifecycle.describe(agent, this.agentMetrics(agent.id))), queue: this.queue.inspect(), history: this.queue.history(), events: this.events.list(), health: this.health() }; }
}
export const orchestrator = new AgentOrchestrator();
