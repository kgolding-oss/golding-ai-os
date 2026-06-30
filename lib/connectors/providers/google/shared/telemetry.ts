import type { GoogleWorkspaceTelemetryMetric } from "./types";
const metrics: GoogleWorkspaceTelemetryMetric[] = [];
export function recordGoogleWorkspaceTelemetry(metric: GoogleWorkspaceTelemetryMetric) { metrics.push(metric); if (metrics.length > 500) metrics.shift(); }
export function googleWorkspaceTelemetrySummary() { const averageLatencyMs = Math.round(metrics.reduce((s,m)=>s+m.durationMs,0)/Math.max(metrics.length,1)); const byService = metrics.reduce<Record<string, number>>((a,m)=>{a[m.service]=(a[m.service]??0)+1; return a;},{}); return { requests: metrics.length, failures: metrics.filter(m=>m.status==='failure').length, policyDenials: metrics.filter(m=>m.status==='denied').length, averageLatencyMs, byService, recent: metrics.slice(-20) }; }
