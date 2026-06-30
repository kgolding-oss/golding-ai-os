export class RuntimeError extends Error { constructor(public code: string, message: string, public details: Record<string, unknown> = {}) { super(message); } }
export const runtimeError = (code: string, message: string, details: Record<string, unknown> = {}) => ({ code, message, details, timestamp: new Date().toISOString() });
