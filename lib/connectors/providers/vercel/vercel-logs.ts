import type { VercelRuntimeInput } from "./vercel-types";
export async function summarizeVercelLogs(_i: VercelRuntimeInput) { return { recentErrors: [], warningCounts: 0, latencyMetrics: { p50Ms: 0, p95Ms: 0, p99Ms: 0 }, valuesExposed: false }; }
