import { getDisconnectedServices } from "../dashboard/intelligence";
import type { DashboardData } from "../dashboard/queries";
import type { Severity } from "../types/agent";

export type ReleaseHealthSection = {
  status: "ready" | "warning" | "blocked";
  summary: string;
  severity: Severity;
};

export type ReleaseHealth = {
  repository: ReleaseHealthSection;
  architecture: ReleaseHealthSection;
  database: ReleaseHealthSection;
  authentication: ReleaseHealthSection;
  organizationContext: ReleaseHealthSection;
  runtime: ReleaseHealthSection;
  deployment: ReleaseHealthSection;
  productionReady: boolean;
  blockers: string[];
  recommendations: string[];
};

function section(status: ReleaseHealthSection["status"], summary: string): ReleaseHealthSection {
  return { status, summary, severity: status === "blocked" ? "critical" : status === "warning" ? "medium" : "low" };
}

export function getReleaseHealth(data: DashboardData): ReleaseHealth {
  const blockers: string[] = [];
  const recommendations: string[] = [];
  const disconnected = getDisconnectedServices(data.health);
  const hasOrganization = data.organizations.length > 0;
  const hasActiveMembership = data.memberships.length > 0;

  if (!hasOrganization) blockers.push("No active organization is available for release validation.");
  if (!hasActiveMembership) blockers.push("No active organization membership is available for scoped access.");
  if (disconnected.length) recommendations.push("Resolve disconnected services before production launch.");
  if (!data.userPreferences.length) recommendations.push("Confirm user preference bootstrap writes active organization context for operators.");

  const health: ReleaseHealth = {
    repository: section("ready", "Repository validation is handled by lint, TypeScript, build, and test checks on the current branch."),
    architecture: section("ready", "Agent framework, command registry, dashboard intelligence, and release health are separated into reusable modules."),
    database: section(hasOrganization ? "ready" : "blocked", hasOrganization ? "Organization-scoped records are available to evaluate the dashboard." : "Organization records are required."),
    authentication: section(hasActiveMembership ? "ready" : "blocked", hasActiveMembership ? "Authenticated organization membership is visible." : "Authenticated organization membership is required."),
    organizationContext: section(hasOrganization && hasActiveMembership ? "ready" : "blocked", hasOrganization && hasActiveMembership ? "Active organization context is present." : "Active organization selection must be resolved."),
    runtime: section(disconnected.length ? "warning" : "ready", disconnected.length ? `${disconnected.length} runtime service records report degraded connectivity.` : "No degraded runtime services are visible in current application state."),
    deployment: section("warning", "Vercel preview status must be confirmed externally because no deployment API is called from this release manager."),
    productionReady: blockers.length === 0 && disconnected.length === 0,
    blockers,
    recommendations,
  };

  return health;
}
