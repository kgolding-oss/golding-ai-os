import type { ConnectorErrorRecord } from "./connector-types";
export class ConnectorError extends Error { constructor(public code: string, message: string, public details: Record<string, unknown> = {}) { super(message); } }
export function connectorError(code: string, message: string, details: Record<string, unknown> = {}): ConnectorErrorRecord { return { code, message, details, timestamp: new Date().toISOString() }; }
