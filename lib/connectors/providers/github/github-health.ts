import { createConnectorHealth } from "../../connector-health";
import { githubAuthState } from "./github-auth";
import { githubTelemetrySummary } from "./github-telemetry";
export function createGitHubHealth() { const auth = githubAuthState(); return { ...createConnectorHealth(), authenticationStatus: auth.status, healthScore: auth.status === "authenticated" ? 92 : 60, status: auth.status === "authenticated" ? "healthy" as const : "degraded" as const, availability: "healthy" as const, diagnostics: auth.diagnostics, warnings: auth.status === "authenticated" ? [] : ["GitHub live credentials are not configured."] }; }
export function githubHealthSnapshot() { return { health: createGitHubHealth(), telemetry: githubTelemetrySummary() }; }
