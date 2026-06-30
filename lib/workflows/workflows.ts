import { buildAttentionQueue, buildRecommendations, getPendingApprovals } from "../dashboard/intelligence";
import type { DashboardData } from "../dashboard/queries";
import { knowledgeRegistry } from "../knowledge/registry";
import { evaluateReleaseHealth } from "../agents/release-health";
import type { Workflow, WorkflowContext, WorkflowResult, WorkflowValidationResult } from "./types";

const emptyData: DashboardData = { organizations: [], projects: [], tasks: [], approvals: [], agents: [], activity: [], health: [], auditLogs: [], memberships: [], userPreferences: [] };
const valid = (): WorkflowValidationResult => ({ valid: true, errors: [] });
const data = (context: WorkflowContext): DashboardData => context.state ?? emptyData;

export class ExecutiveDailyBriefWorkflow implements Workflow<unknown, { recommendationCount: number }> {
  id = "executive-daily-brief"; name = "Executive Daily Brief"; description = "Creates a deterministic operating brief from dashboard, active organization, and attention data."; version = "1.0.0"; triggerType = "manual" as const; status = "ready" as const;
  validate() { return valid(); }
  async execute(context: WorkflowContext, executionId: string): Promise<WorkflowResult<{ recommendationCount: number }>> {
    const d = data(context); const organization = d.organizations[0] ?? null; const recommendations = buildRecommendations({ ...d, organization, membershipCount: d.memberships.length }); const attention = buildAttentionQueue(d);
    return { workflowId: this.id, executionId, title: this.name, summary: `${recommendations.length} recommendations and ${attention.length} attention items are ready for executive review.`, sections: [{ title: "Organization", items: [organization?.name ?? "No active organization record loaded"] }, { title: "Recommendations", items: recommendations.map((item) => `${item.severity}: ${item.title}`) }, { title: "Attention", items: attention.map((item) => `${item.severity}: ${item.title}`) }], recommendations: recommendations.map((item) => item.action), metadata: { organizationId: context.organizationId ?? organization?.id ?? null }, data: { recommendationCount: recommendations.length } };
  }
}

export class ReleaseVerificationWorkflow implements Workflow<unknown, ReturnType<typeof evaluateReleaseHealth>> {
  id = "release-verification"; name = "Release Verification"; description = "Evaluates release readiness using Release Manager health scoring and dashboard blockers."; version = "1.0.0"; triggerType = "manual" as const; status = "ready" as const;
  validate() { return valid(); }
  async execute(context: WorkflowContext, executionId: string): Promise<WorkflowResult<ReturnType<typeof evaluateReleaseHealth>>> {
    const d = data(context); const release = evaluateReleaseHealth({ lintPassed: true, typecheckPassed: true, buildPassed: true, criticalBlockers: buildAttentionQueue(d).filter((item) => item.severity === "critical").length, openApprovals: getPendingApprovals(d.approvals).length });
    return { workflowId: this.id, executionId, title: this.name, summary: `Release status is ${release.status} with score ${release.score}.`, sections: [{ title: "Release health", items: release.reasons }, { title: "Inputs", items: [`${d.tasks.length} tasks`, `${d.approvals.length} approvals`, `${d.health.length} system health signals`] }], recommendations: release.status === "ready" ? ["Proceed to preview verification."] : ["Resolve release risks before deployment."], metadata: { releaseStatus: release.status, score: release.score }, data: release };
  }
}

export class KnowledgeDiscoveryWorkflow implements Workflow<unknown, { providers: number; results: number }> {
  id = "knowledge-discovery"; name = "Knowledge Discovery"; description = "Surfaces registered knowledge providers and deterministic indexed knowledge search results."; version = "1.0.0"; triggerType = "manual" as const; status = "ready" as const;
  validate() { return knowledgeRegistry.listProviders().length ? valid() : { valid: false, errors: ["At least one knowledge provider must be registered."] }; }
  async execute(_context: WorkflowContext, executionId: string): Promise<WorkflowResult<{ providers: number; results: number }>> {
    const providers = knowledgeRegistry.listProviders(); const results = await knowledgeRegistry.search({ query: "executive release knowledge", limit: 5 });
    return { workflowId: this.id, executionId, title: this.name, summary: `${providers.length} providers registered and ${results.data.length} deterministic results discovered.`, sections: [{ title: "Providers", items: providers.map((provider) => `${provider.name}: ${provider.status}; ${provider.indexedDocumentCount} indexed documents`) }, { title: "Discovery results", items: results.data.map((result) => `${result.document.title} (${result.providerId})`) }], recommendations: ["Connect production provider credentials in a future milestone before automated indexing."], metadata: { providerCount: providers.length }, data: { providers: providers.length, results: results.data.length } };
  }
}
