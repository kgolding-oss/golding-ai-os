import type { GitHubTelemetryMetric } from "./github-types";
const metrics: GitHubTelemetryMetric[] = [];
export function recordGitHubTelemetry(metric: GitHubTelemetryMetric) { metrics.push(metric); if (metrics.length > 200) metrics.shift(); }
export function githubTelemetrySummary() { const failures = metrics.filter((m) => m.status === "failure").length; return { requests: metrics.length, failures, policyDenials: metrics.filter((m) => m.status === "denied").length, averageLatencyMs: Math.round(metrics.reduce((s, m) => s + m.durationMs, 0) / Math.max(metrics.length, 1)), recent: metrics.slice(-10) }; }
