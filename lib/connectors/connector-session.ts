import type { ConnectorExecutionContext, ConnectorExecutionResult } from "./connector-types";
export type ConnectorSession = { id: string; connectorId: string; context: ConnectorExecutionContext; startedAt: string; completedAt?: string; executions: ConnectorExecutionResult[] };
const sessions: ConnectorSession[] = [];
export function createConnectorSession(connectorId: string, context: ConnectorExecutionContext) { const session = { id: `connector-session-${sessions.length + 1}`, connectorId, context, startedAt: new Date().toISOString(), executions: [] }; sessions.push(session); return session; }
export function listConnectorSessions() { return [...sessions]; }
