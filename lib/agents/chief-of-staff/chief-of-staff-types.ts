import type { DashboardData, Organization } from "../../dashboard/queries";
import type { PlatformHealthReport, DiagnosticsReport } from "../../observability";
import type { KnowledgeHealthReport } from "../../knowledge";
import type { WorkflowSummary } from "../../workflows";
import type { RuntimeMetrics, RuntimeSession, RuntimeToolDefinition } from "../../runtime";
import type { ConnectorDefinition, ConnectorSession } from "../../connectors";
import type { OperatingHistory } from "../../persistence";
import type { ExecutivePriority, ExecutiveRecommendation, ExecutiveRisk, ExecutiveSnapshot } from "../../intelligence";

export type ChiefOfStaffPriority = "critical" | "high" | "medium" | "low";
export type ChiefOfStaffDelegationStatus = "queued" | "waiting_approval" | "blocked" | "completed" | "dismissed";
export type ChiefOfStaffAgentOwner = "executive-intelligence" | "workflow-engine" | "ai-runtime" | "knowledge-os" | "connector-runtime" | "autonomy-engine" | "approval-engine" | "observability" | "human-executive" | string;

export type ChiefOfStaffContext = { organization: Organization | null; dashboard: DashboardData; executiveIntelligence: ExecutiveSnapshot; platformHealth: PlatformHealthReport; diagnostics: DiagnosticsReport; knowledgeHealth: KnowledgeHealthReport; workflows: WorkflowSummary[]; runtimeTools: RuntimeToolDefinition[]; runtimeSessions: RuntimeSession[]; runtimeMetrics: RuntimeMetrics; connectors: ConnectorDefinition[]; connectorSessions: ConnectorSession[]; connectorDiagnostics: unknown; operatingHistory: OperatingHistory; autonomousPlans?: unknown[]; pendingApprovals?: unknown[]; now?: Date };
export type ChiefOfStaffDelegation = { id: string; ownerAgent: ChiefOfStaffAgentOwner; title: string; priority: ChiefOfStaffPriority; confidence: number; deadline: string; dependencies: string[]; approvals: string[]; rationale: string; expectedImpact: string; status: ChiefOfStaffDelegationStatus; sourceSignalIds: string[]; createdAt: string };
export type ChiefOfStaffBriefing = { id: string; generatedAt: string; summary: string; operatingMode: "normal" | "focused" | "stabilization" | "approval_required"; evidence: string[] };
export type ChiefOfStaffFollowUp = { id: string; title: string; ownerAgent: ChiefOfStaffAgentOwner; dueAt: string; rationale: string; sourceId: string };
export type ChiefOfStaffMemory = { completedDelegations: string[]; executiveDecisions: string[]; recurringPriorities: string[]; recurringRisks: string[]; dismissedRecommendations: string[]; organizationalPatterns: string[]; historicalExecutiveBriefings: string[]; updatedAt: string };
export type ChiefOfStaffSnapshot = { briefing: ChiefOfStaffBriefing; dailyPriorities: ExecutivePriority[]; criticalRisks: ExecutiveRisk[]; delegationQueue: ChiefOfStaffDelegation[]; executiveRecommendations: ExecutiveRecommendation[]; approvalQueue: ChiefOfStaffDelegation[]; followUpQueue: ChiefOfStaffFollowUp[]; strategicOpportunities: ExecutiveSnapshot["opportunities"]; executiveTimeline: ExecutiveSnapshot["timeline"]; memory: ChiefOfStaffMemory; telemetry: ChiefOfStaffTelemetrySummary; generatedAt: string };
export type ChiefOfStaffTelemetryEvent = { id: string; kind: "briefing" | "delegation" | "priority_generation" | "recommendation" | "approval_request" | "follow_up"; at: string; message: string; metadata?: Record<string, unknown> };
export type ChiefOfStaffTelemetrySummary = { delegations: number; briefings: number; priorityGenerations: number; recommendations: number; approvalRequests: number; followUps: number; recent: ChiefOfStaffTelemetryEvent[] };
