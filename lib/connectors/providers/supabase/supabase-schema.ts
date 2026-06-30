export const defaultSupabaseSchemaSnapshot = { version: "unknown", tables: [], rlsDisabledTables: [], missingIndexes: [], driftDetected: false, growthTrend: "unknown" };
export function summarizeSupabaseSchema(input: Record<string, unknown> = {}) { return { ...defaultSupabaseSchemaSnapshot, ...input, capturedAt: new Date().toISOString() }; }
