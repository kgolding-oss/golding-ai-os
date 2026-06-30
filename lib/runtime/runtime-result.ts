import type { RuntimeResult, RuntimeToolResult } from "./runtime-types";
export function createRuntimeResult(sessionId: string, startedAt: string, toolResults: RuntimeToolResult[]): RuntimeResult { const errors = toolResults.flatMap((r) => r.error ? [r.error] : []); return { sessionId, success: errors.length === 0, toolResults, errors, durationMs: Date.now() - Date.parse(startedAt) }; }
