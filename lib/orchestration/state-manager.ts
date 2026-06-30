import type { ExecutionContext, TaskExecutionRecord } from "./types";
export class OrchestrationStateManager {
  private readonly contexts = new Map<string, ExecutionContext>(); private readonly idempotency = new Set<string>(); private readonly history: TaskExecutionRecord[] = [];
  create<T>(context: ExecutionContext<T>) { if (this.idempotency.has(context.idempotencyKey)) return null; this.idempotency.add(context.idempotencyKey); this.contexts.set(context.id, context); return context; }
  get(id: string) { return this.contexts.get(id) ?? null; }
  complete(id: string, completedAt: string) { const context = this.contexts.get(id); if (context) context.completedAt = completedAt; return context ?? null; }
  record(record: TaskExecutionRecord) { this.history.push(record); }
  getHistory() { return [...this.history]; }
}
