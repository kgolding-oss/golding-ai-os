import { AIWorkforcePanel } from "../../components/dashboard/AIWorkforcePanel";
import { AgentStatusPanel } from "../../components/dashboard/AgentStatusPanel";
import { AttentionQueue } from "../../components/dashboard/AttentionQueue";
import { CommandBar } from "../../components/dashboard/CommandBar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { ExecutiveBrief } from "../../components/dashboard/ExecutiveBrief";
import { ExecutiveWorkflowPanel } from "../../components/dashboard/ExecutiveWorkflowPanel";
import { MetricsGrid } from "../../components/dashboard/MetricsGrid";
import { KnowledgeDashboard } from "../../components/knowledge/KnowledgeDashboard";
import { AIRuntimePanel } from "../../components/runtime/AIRuntimePanel";
import { EnterpriseConnectorsPanel } from "../../components/connectors/EnterpriseConnectorsPanel";
import { Navigation } from "../../components/dashboard/Navigation";
import { OperatingHistory } from "../../components/dashboard/OperatingHistory";
import { OrganizationsWidget } from "../../components/dashboard/OrganizationsWidget";
import { PriorityTasks } from "../../components/dashboard/PriorityTasks";
import { RecentActivity } from "../../components/dashboard/RecentActivity";
import { RecommendationPanel } from "../../components/dashboard/RecommendationPanel";
import { SystemHealth } from "../../components/dashboard/SystemHealth";
import { DiagnosticsPanel } from "../../components/dashboard/DiagnosticsPanel";
import { ExecutiveIntelligenceDashboard } from "../../components/intelligence/ExecutiveIntelligenceDashboard";
import { AutonomousOperationsPanel } from "../../components/autonomy/AutonomousOperationsPanel";
import { AIPlatformPanel } from "../../components/ai/AIPlatformPanel";
import { AIOperationsPanel } from "../../components/ai/AIOperationsPanel";
import { currentPath, requireActiveOrganization } from "../../lib/activeOrganization";
import { buildAttentionQueue, buildRecommendations } from "../../lib/dashboard/intelligence";
import { buildMetrics } from "../../lib/dashboard/metrics";
import { getDashboardData } from "../../lib/dashboard/queries";
import { buildKnowledgeHealthReport, knowledgeRegistry } from "../../lib/knowledge";
import { AgentOrchestrator } from "../../lib/orchestration";
import { workflowEngine } from "../../lib/workflows";
import { getOperatingHistory } from "../../lib/persistence";
import { aiRuntime } from "../../lib/runtime";
import { connectorManager } from "../../lib/connectors";
import { getPlatformHealth, runDiagnostics, logger } from "../../lib/observability";
import { executiveIntelligenceEngine } from "../../lib/intelligence";
import { approvalEngine, autonomyEngine, autonomousScheduler, retryEngine, recoveryEngine } from "../../lib/autonomy";
import { modelRegistry, promptRegistry, toolRegistry, aiTelemetrySummary } from "../../lib/ai";
import { mcpRegistry } from "../../lib/connectors/providers/mcp";

async function safeDiagnostics(token?: string | null, organizationId?: string | null) {
  try { return { health: await getPlatformHealth({ token, organizationId }), diagnostics: runDiagnostics() }; }
  catch (error) {
    logger.error("dashboard.diagnostics.failed", "Dashboard diagnostics failed safely.", error, undefined, { subsystem: "dashboard" });
    const timestamp = new Date().toISOString();
    return { health: { status: "unhealthy" as const, subsystems: [], warnings: [], errors: ["Diagnostics failed safely."], timestamp }, diagnostics: { status: "unhealthy" as const, findings: [{ severity: "error" as const, subsystem: "diagnostics", id: "dashboard", message: "Diagnostics panel failed safely." }], counts: { tools: 0, workflows: 0, commands: 0, knowledgeProviders: 0, orchestrationAgents: 0 }, timestamp } };
  }
}

export default async function DashboardPage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  const data = await getDashboardData(session.access_token, activeOrganization?.id);
  const activeOrganizationRecord = data.organizations[0] ?? activeOrganization ?? null;
  const metrics = buildMetrics(data);
  const pendingApprovals = data.approvals.filter((approval) => approval.status === "pending").length;
  const attentionItems = buildAttentionQueue(data);
  const recommendations = buildRecommendations({ ...data, organization: activeOrganizationRecord, membershipCount: data.memberships.length });
  const knowledgeHealth = buildKnowledgeHealthReport(knowledgeRegistry);
  const workflows = workflowEngine.listWorkflows();
  const agentOrchestrator = AgentOrchestrator.fromDashboardAgents(data.agents);
  const operatingHistory = await getOperatingHistory({ token: session.access_token, organizationId: activeOrganizationRecord?.id, profileId: session.user?.id });
  const runtimeTools = aiRuntime.registry.listTools();
  const runtimeSessions = aiRuntime.executor.sessions.filter((runtimeSession) => !activeOrganizationRecord?.id || runtimeSession.organizationId === activeOrganizationRecord.id);
  const runtimeMetrics = aiRuntime.telemetry.metrics();
  const diagnosticsSnapshot = await safeDiagnostics(session.access_token, activeOrganizationRecord?.id);
  const connectors = connectorManager.list();
  const connectorSessions = connectorManager.runtime.sessions.filter((connectorSession) => !activeOrganizationRecord?.id || connectorSession.context.organizationId === activeOrganizationRecord.id);
  const connectorDiagnostics = connectorManager.diagnostics();
  const aiTelemetry = aiTelemetrySummary();
  const aiModels = modelRegistry.list();
  const aiPrompts = promptRegistry.list();
  const aiTools = toolRegistry.list();
  const mcpServers = mcpRegistry.list();
  const aiOperationsScore = Math.max(0, Math.min(100, 50 + aiModels.length * 10 + aiTools.length * 3 - aiTelemetry.sessions.failures * 10));
  const executiveSnapshot = executiveIntelligenceEngine.analyze({ organization: activeOrganizationRecord, dashboard: data, platformHealth: diagnosticsSnapshot.health, diagnostics: diagnosticsSnapshot.diagnostics, knowledgeHealth, workflows, runtimeTools, runtimeSessions, runtimeMetrics, connectors, connectorSessions, connectorDiagnostics, operatingHistory });
  const autonomousPlan = autonomyEngine.createExecutionPlan({ organization: activeOrganizationRecord ? { id: activeOrganizationRecord.id, name: activeOrganizationRecord.name } : null, executiveIntelligence: executiveSnapshot, workflows, runtimeTools, connectors, knowledgeHealth, platformHealth: diagnosticsSnapshot.health, diagnostics: diagnosticsSnapshot.diagnostics, operatingHistory, source: "dashboard" });
  if (!autonomousScheduler.list().some((schedule) => schedule.planId === autonomousPlan.id)) autonomousScheduler.schedule(autonomousPlan.id, autonomousPlan.organizationId, { type: "delayed", delayMs: 300000 });

  return (
    <main className="shell executiveShell">
      <Navigation activeOrganization={activeOrganization} memberships={memberships} returnTo={currentPath()} />
      <DashboardHeader organizationCount={data.organizations.length} pendingApprovals={pendingApprovals} />
      <CommandBar />
      <MetricsGrid metrics={metrics} />
      <section className="grid twoColumn">
        <ExecutiveBrief organization={activeOrganizationRecord} tasks={data.tasks} approvals={data.approvals} agents={data.agents} health={data.health} projects={data.projects} activity={data.activity} auditLogs={data.auditLogs} membershipCount={data.memberships.length} />
        <AttentionQueue items={attentionItems} />
      </section>
      <section className="grid twoColumn">
        <AgentStatusPanel agents={data.agents} activity={data.activity} />
        <AIWorkforcePanel orchestrator={agentOrchestrator} />
      </section>
      <section className="grid twoColumn">
        <SystemHealth health={data.health} />
        <ExecutiveWorkflowPanel workflows={workflows} />
      </section>
      <KnowledgeDashboard health={knowledgeHealth} />
      <AIRuntimePanel tools={runtimeTools} sessions={runtimeSessions} metrics={runtimeMetrics} />
      <AIPlatformPanel models={aiModels} prompts={aiPrompts} tools={aiTools} mcpServers={mcpServers} sessions={aiTelemetry.sessions} costs={{ tokens: aiTelemetry.tokens, costUsd: aiTelemetry.costUsd, latencyMs: aiTelemetry.latencyMs }} />
      <AIOperationsPanel score={aiOperationsScore} items={{ aiReadiness: aiModels.length ? "ready" : "awaiting model registration", modelHealth: `${aiModels.length} registered`, mcpHealth: `${mcpServers.length} servers`, promptQuality: `${aiPrompts.length} versions`, toolReadiness: `${aiTools.length} tools`, executionEfficiency: `${aiTelemetry.sessions.completed} completed`, costEfficiency: `$${aiTelemetry.costUsd.toFixed(6)}` }} />
      <EnterpriseConnectorsPanel connectors={connectors} sessions={connectorSessions} diagnostics={connectorDiagnostics} />
      <DiagnosticsPanel health={diagnosticsSnapshot.health} diagnostics={diagnosticsSnapshot.diagnostics} />
      <ExecutiveIntelligenceDashboard snapshot={executiveSnapshot} />
      <AutonomousOperationsPanel plans={autonomyEngine.listPlans()} approvals={approvalEngine.list()} schedules={autonomousScheduler.list()} retryQueue={retryEngine.list()} recoveryQueue={recoveryEngine.list()} />
      <OperatingHistory history={operatingHistory} />
      <OrganizationsWidget organizations={data.organizations} />
      <section className="grid twoColumn">
        <PriorityTasks tasks={data.tasks} />
        <RecentActivity activity={data.activity} auditLogs={data.auditLogs} />
      </section>
      <RecommendationPanel recommendations={recommendations} />
    </main>
  );
}
