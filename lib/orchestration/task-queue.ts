import type { AgentMessage, AgentMessagePriority, QueuedTask, TaskExecutionRecord } from "./types";
import { createId, nowIso, priorityWeight } from "./utils";

export interface TaskQueue { enqueue<T>(message: AgentMessage<T>, options?: { maxAttempts?: number; scheduledFor?: string; idempotencyKey?: string }): QueuedTask<T>; dequeue(agentId?: string): QueuedTask | null; cancel(taskId: string, reason?: string): QueuedTask | null; retry(taskId: string): QueuedTask | null; prioritize(taskId: string, priority: AgentMessagePriority): QueuedTask | null; inspect(): QueuedTask[]; history(taskId?: string): TaskExecutionRecord[]; record(record: TaskExecutionRecord): void; }
export class InMemoryTaskQueue implements TaskQueue {
  private readonly tasks = new Map<string, QueuedTask>(); private readonly records: TaskExecutionRecord[] = [];
  enqueue<T>(message: AgentMessage<T>, options: { maxAttempts?: number; scheduledFor?: string; idempotencyKey?: string } = {}) {
    const idempotencyKey = options.idempotencyKey ?? `${message.correlationId}:${message.recipient.id}:${message.type}`;
    const duplicate = Array.from(this.tasks.values()).find((task) => task.idempotencyKey === idempotencyKey && ["queued", "running", "retrying"].includes(task.status));
    if (duplicate) return duplicate as QueuedTask<T>;
    const task: QueuedTask<T> = { id: createId("task"), agentId: message.recipient.id, organizationId: message.organizationId, workflowId: message.workflowId, message, priority: message.priority, status: "queued", attempts: 0, maxAttempts: options.maxAttempts ?? 1, createdAt: nowIso(), updatedAt: nowIso(), scheduledFor: options.scheduledFor, idempotencyKey };
    this.tasks.set(task.id, task); return task;
  }
  dequeue(agentId?: string) { const ready = Array.from(this.tasks.values()).filter((task) => task.status === "queued" && (!agentId || task.agentId === agentId) && (!task.scheduledFor || task.scheduledFor <= nowIso())).sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.createdAt.localeCompare(b.createdAt))[0]; if (!ready) return null; ready.status = "running"; ready.attempts += 1; ready.updatedAt = nowIso(); return ready; }
  cancel(taskId: string, reason = "Cancelled") { const task = this.tasks.get(taskId); if (!task || ["completed", "failed", "cancelled"].includes(task.status)) return null; task.status = "cancelled"; task.lastError = reason; task.updatedAt = nowIso(); return task; }
  retry(taskId: string) { const task = this.tasks.get(taskId); if (!task || task.attempts >= task.maxAttempts) return null; task.status = "queued"; task.updatedAt = nowIso(); return task; }
  prioritize(taskId: string, priority: AgentMessagePriority) { const task = this.tasks.get(taskId); if (!task) return null; task.priority = priority; task.message.priority = priority; task.updatedAt = nowIso(); return task; }
  inspect() { return Array.from(this.tasks.values()).sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.createdAt.localeCompare(b.createdAt)); }
  history(taskId?: string) { return taskId ? this.records.filter((record) => record.taskId === taskId) : [...this.records]; }
  record(record: TaskExecutionRecord) { this.records.push(record); const task = this.tasks.get(record.taskId); if (task) { task.status = record.status; task.lastError = record.error; task.updatedAt = nowIso(); } }
}
