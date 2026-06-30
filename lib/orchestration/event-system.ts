import type { OrchestrationEvent, OrchestrationEventType } from "./types";
import { createId, nowIso } from "./utils";
export type EventHandler<T = unknown> = (event: OrchestrationEvent<T>) => void;
export class OrchestrationEventSystem {
  private readonly events: OrchestrationEvent[] = []; private readonly handlers = new Map<OrchestrationEventType, Set<EventHandler>>();
  emit<T>(event: Omit<OrchestrationEvent<T>, "id" | "timestamp">) { const full = { ...event, id: createId("evt"), timestamp: nowIso() }; this.events.unshift(full); this.handlers.get(full.type)?.forEach((handler) => handler(full)); return full; }
  on(type: OrchestrationEventType, handler: EventHandler) { const handlers = this.handlers.get(type) ?? new Set<EventHandler>(); handlers.add(handler); this.handlers.set(type, handlers); return () => handlers.delete(handler); }
  list(limit = 50) { return this.events.slice(0, limit); }
}
