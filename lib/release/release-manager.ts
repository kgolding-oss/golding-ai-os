import type { DashboardData } from "../dashboard/queries";
import { getDisconnectedServices } from "../dashboard/intelligence";

export type ReleaseHealth = {
  repository: string;
  database: string;
  authentication: string;
  organizationContext: string;
  runtime: string;
  deployment: string;
  productionReady: boolean;
  blockers: string[];
  recommendations: string[];
};

export function checkReleaseHealth(data: DashboardData): ReleaseHealth {
  const disconnected = getDisconnectedServices(data.health);
  const hasOrganization = data.organizations.length > 0;
  const hasPreference = data.userPreferences.length > 0;
  const blockers = [
    ...(!hasOrganization ? ["No active organization context is loaded."] : []),
    ...disconnected.map((service) => `${service.service_name} is ${service.connection_status ?? service.health ?? "not healthy"}.`),
  ];
  const recommendations = [
    ...(hasPreference ? [] : ["Confirm user preference records are being written for active organization selection."]),
    ...(data.agents.length ? [] : ["Register production agents before enabling autonomous workflows."]),
    ...(data.auditLogs.length ? [] : ["Verify audit logging before production release sign-off."]),
  ];

  return {
    repository: "local checks only; remote repository validation is not performed yet",
    database: disconnected.length ? "degraded" : "reachable through existing dashboard queries",
    authentication: hasPreference || hasOrganization ? "session-bound dashboard access present" : "requires verification",
    organizationContext: hasOrganization ? "active organization loaded" : "missing active organization",
    runtime: "Next.js runtime builds deterministic dashboard data",
    deployment: "Vercel preview must be verified outside local release manager",
    productionReady: blockers.length === 0,
    blockers,
    recommendations: recommendations.length ? recommendations : ["Run lint, typecheck, build, and Vercel preview smoke tests before release."],
  };
}
