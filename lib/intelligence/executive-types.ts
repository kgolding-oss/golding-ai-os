import type { DashboardData, Organization } from "../dashboard/queries";
import type { OperatingHistory } from "../persistence";
import type { PlatformHealthReport, DiagnosticsReport } from "../observability";
import type { KnowledgeHealthReport } from "../knowledge";
import type { WorkflowSummary } from "../workflows";
import type { RuntimeToolDefinition, RuntimeMetrics, RuntimeSession } from "../runtime";
import type { ConnectorDefinition, ConnectorSession } from "../connectors";
import { connectorManager } from "../connectors";

export type ExecutiveSeverity = "critical" | "high" | "medium" | "low" | "info";
export type ExecutiveSubsystem = "platform" | "operations" | "knowledge" | "runtime" | "connectors" | "workflows" | "orchestration" | "diagnostics" | "persistence" | "organization" | "release";
export type ExecutiveSignalKind = "priority" | "recommendation" | "risk" | "opportunity" | "bottleneck" | "strategic_alert" | "operational_alert";
export type TrendDirection = "improving" | "stable" | "declining" | "unknown";

export type ExecutiveAnalysisContext = {
  organization: Organization | null;
  dashboard: DashboardData;
  platformHealth: PlatformHealthReport;
  diagnostics: DiagnosticsReport;
  knowledgeHealth: KnowledgeHealthReport;
  workflows: WorkflowSummary[];
  runtimeTools: RuntimeToolDefinition[];
  runtimeSessions: RuntimeSession[];
  runtimeMetrics: RuntimeMetrics;
  connectors: ConnectorDefinition[];
  connectorSessions: ConnectorSession[];
  connectorDiagnostics: ReturnType<typeof connectorManager.diagnostics>;
  operatingHistory: OperatingHistory;
  now?: Date;
};

export type ExecutiveSignal = {
  id: string;
  kind: ExecutiveSignalKind;
  severity: ExecutiveSeverity;
  subsystem: ExecutiveSubsystem;
  title: string;
  rationale: string;
  evidence: string[];
  confidence: number;
  createdAt: string;
};
export type ExecutiveRecommendation = ExecutiveSignal & { kind: "recommendation"; suggestedAction: string; expectedImpact: string; status: "open" | "completed" | "dismissed" };
export type ExecutivePriority = ExecutiveSignal & { kind: "priority"; rank: number; recommendedNextStep: string };
export type ExecutiveRisk = ExecutiveSignal & { kind: "risk"; rank: number; mitigation: string };
export type ExecutiveOpportunity = ExecutiveSignal & { kind: "opportunity"; leverage: "high" | "medium" | "low"; suggestedExperiment: string };
export type ExecutiveBottleneck = ExecutiveSignal & { kind: "bottleneck"; blockedArea: string; reliefAction: string };

export type ExecutiveScoreCategory = "platform" | "operations" | "knowledge" | "runtime" | "connectors" | "workflows" | "organizationReadiness" | "aiReadiness";
export type ExecutiveCategoryScore = { category: ExecutiveScoreCategory; score: number; confidence: number; explanation: string; evidence: string[] };
export type ExecutiveHealthScore = { overall: number; confidence: number; categories: ExecutiveCategoryScore[]; explanation: string; calculatedAt: string };

export type ExecutiveMemory = { completedRecommendations: string[]; dismissedRecommendations: string[]; recurringIssues: string[]; recurringSuccesses: string[]; historicalPriorities: string[]; strategicTrends: string[]; operatingPatterns: string[] };
export type ExecutiveTimelineEvent = { id: string; at: string; severity: ExecutiveSeverity; subsystem: ExecutiveSubsystem; title: string; detail: string };
export type ExecutiveSnapshot = { score: ExecutiveHealthScore; priorities: ExecutivePriority[]; recommendations: ExecutiveRecommendation[]; risks: ExecutiveRisk[]; opportunities: ExecutiveOpportunity[]; bottlenecks: ExecutiveBottleneck[]; strategicAlerts: ExecutiveSignal[]; operationalAlerts: ExecutiveSignal[]; timeline: ExecutiveTimelineEvent[]; memory: ExecutiveMemory; trendSummary: string; generatedAt: string };
