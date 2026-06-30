export function safeJson(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return value === undefined ? {} : { value };
  try { return JSON.parse(JSON.stringify(value)) as Record<string, unknown>; } catch { return { unserializable: true }; }
}
export function errorDetails(error: unknown) { return error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error ? { message: String(error) } : null; }
export function correlationId(prefix = "corr") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
