import { createConnectorHealth } from "../../connector-health";
import { vercelAuthState } from "./vercel-auth";
import { vercelTelemetrySummary } from "./vercel-telemetry";
export function createVercelHealth() { const auth = vercelAuthState(); return { ...createConnectorHealth(), authenticationStatus: auth.status, healthScore: auth.status === "authenticated" ? 94 : 62, status: auth.status === "authenticated" ? "healthy" as const : "degraded" as const, availability: "healthy" as const, diagnostics: auth.diagnostics, warnings: auth.status === "authenticated" ? [] : ["Vercel live credentials are not configured."] }; }
export function vercelHealthSnapshot() { return { health: createVercelHealth(), telemetry: vercelTelemetrySummary(), observability: { deploymentLatency: true, buildDuration: true, deploymentFailures: true, runtimeFailures: true, functionFailures: true, apiLatency: true, domainHealth: true, sslExpiration: true, retries: true, policyDenials: true } }; }
