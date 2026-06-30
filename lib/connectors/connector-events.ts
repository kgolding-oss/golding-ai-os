export type ConnectorEventType = "connector.registered" | "connector.initialized" | "authentication.requested" | "authentication.completed" | "execution.started" | "execution.completed" | "execution.failed" | "policy.denied" | "health.changed";
export type ConnectorEvent = { id: string; type: ConnectorEventType; connectorId: string; organizationId?: string | null; userId?: string | null; workflowId?: string | null; runtimeSessionId?: string | null; correlationId: string; timestamp: string; message: string; payload?: Record<string, unknown> };
const events: ConnectorEvent[] = [];
export function emitConnectorEvent(event: Omit<ConnectorEvent, "id" | "timestamp">) { const record = { ...event, id: `connector-event-${events.length + 1}`, timestamp: new Date().toISOString() }; events.push(record); return record; }
export function listConnectorEvents() { return [...events]; }
