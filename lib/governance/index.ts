export type GovernanceDepartmentId =
  | "executive-office"
  | "legal"
  | "funding"
  | "finance"
  | "research"
  | "knowledge"
  | "media"
  | "operations"
  | "property"
  | "education"
  | "partnerships"
  | "volunteer-management"
  | "future-departments";
export type PolicySeverity = "info" | "approval_required" | "blocked";
export type DecisionConfidence = "low" | "medium" | "high";

export type DepartmentKpis = {
  tasksCompleted: number;
  pendingWork: number;
  blockedWork: number;
  averageCompletionTimeHours: number;
  approvalWaitTimeHours: number;
  automationSuccessRate: number;
  knowledgeUsage: number;
  costUsd: number;
  health: number;
  riskScore: number;
  confidence: number;
  recommendationAccuracy: number;
};
export type GovernanceUnit = { id: GovernanceDepartmentId; name: string; executiveParent: string; teams: string[]; agents: string[]; workflows: string[]; plugins: string[]; kpis: DepartmentKpis; bottlenecks: string[]; recommendedActions: string[] };
export type GovernancePolicy = { id: string; name: string; description: string; severity: PolicySeverity; configurableByOrganization: boolean; requiredApprovals: string[]; appliesTo: string[] };
export type PolicyEvaluation = { action: string; allowed: boolean; requiresApproval: boolean; matchedPolicies: GovernancePolicy[]; explanation: string };
export type ExecutiveDecision = { id: string; recommendation: string; why: string; supportingEvidence: string[]; knowledgeSources: string[]; confidence: DecisionConfidence; confidenceScore: number; risks: string[]; alternatives: string[]; requiredApprovals: string[]; expectedImpact: string; policy: string[] };
export type OperatingRhythm = { cadence: string; artifact: string; owner: string; purpose: string; requiredSections: string[] };
export type OrganizationalMemoryRecord = { type: "decision" | "policy" | "exception" | "board_vote" | "meeting_outcome" | "lesson" | "historical_kpi" | "historical_risk" | "strategic_objective"; title: string; summary: string; retainedForAudit: boolean };
export type ExecutiveScorecard = { organizationHealth: number; departmentHealth: number; fundingHealth: number; legalHealth: number; knowledgeHealth: number; aiWorkforceHealth: number; connectorHealth: number; pluginHealth: number; memoryHealth: number; automationHealth: number };
export type GovernanceSnapshot = { organizationChart: string[]; departments: GovernanceUnit[]; policies: GovernancePolicy[]; policyEvaluations: PolicyEvaluation[]; decisions: ExecutiveDecision[]; operatingRhythm: OperatingRhythm[]; memoryRecords: OrganizationalMemoryRecord[]; scorecard: ExecutiveScorecard; workloadBalancer: { queueRebalances: string[]; reassignments: string[]; escalations: string[]; bottlenecks: string[]; staffingRecommendations: string[]; automationRecommendations: string[] }; whiteLabelHooks: string[]; macKnowledgeHooks: string[]; generatedAt: string };

const departments: Array<[GovernanceDepartmentId, string]> = [
  ["executive-office", "Executive Office"],
  ["legal", "Legal"],
  ["funding", "Funding"],
  ["finance", "Finance"],
  ["research", "Research"],
  ["knowledge", "Knowledge"],
  ["media", "Media"],
  ["operations", "Operations"],
  ["property", "Property"],
  ["education", "Education"],
  ["partnerships", "Partnerships"],
  ["volunteer-management", "Volunteer Management"],
  ["future-departments", "Future Departments"]
];

const memoryTemplates: Array<[OrganizationalMemoryRecord["type"], string]> = [
  ["decision", "Decisions"],
  ["policy", "Policies"],
  ["exception", "Exceptions"],
  ["board_vote", "Board Votes"],
  ["meeting_outcome", "Meeting Outcomes"],
  ["lesson", "Lessons Learned"],
  ["historical_kpi", "Historical KPIs"],
  ["historical_risk", "Historical Risks"],
  ["strategic_objective", "Strategic Objectives"]
];

const baseKpis = (index: number): DepartmentKpis => ({
  tasksCompleted: 4 + index,
  pendingWork: 2 + (index % 4),
  blockedWork: index % 3,
  averageCompletionTimeHours: 18 + index,
  approvalWaitTimeHours: 6 + (index % 5),
  automationSuccessRate: 72 + (index % 20),
  knowledgeUsage: 58 + (index % 30),
  costUsd: 120 + index * 45,
  health: 70 + (index % 25),
  riskScore: 18 + (index % 35),
  confidence: 68 + (index % 24),
  recommendationAccuracy: 65 + (index % 28)
});

export function defaultGovernancePolicies(): GovernancePolicy[] {
  return [
    { id: "external-email-approval", name: "No external emails without approval", description: "Outbound email drafts may be prepared, but sending requires explicit approval.", severity: "approval_required", configurableByOrganization: true, requiredApprovals: ["Executive Command", "Department Owner"], appliesTo: ["media", "partnerships", "volunteer-management", "funding"] },
    { id: "grant-submission-approval", name: "No grant submissions without approval", description: "Grant packages remain drafts until an executive approver authorizes submission.", severity: "approval_required", configurableByOrganization: true, requiredApprovals: ["Executive Command", "Funding Lead"], appliesTo: ["funding", "finance"] },
    { id: "legal-filing-approval", name: "No legal filings without approval", description: "Legal filing workflows can analyze and prepare but cannot file externally.", severity: "approval_required", configurableByOrganization: true, requiredApprovals: ["Executive Command", "Legal Lead"], appliesTo: ["legal"] },
    { id: "payment-approval", name: "No payments without approval", description: "Payment initiation and connector writes are blocked until approval is recorded.", severity: "approval_required", configurableByOrganization: true, requiredApprovals: ["Executive Command", "Finance Lead"], appliesTo: ["finance", "operations"] },
    { id: "connector-write-approval", name: "No connector writes without approval", description: "Connector write operations require an approval token and audit trail.", severity: "approval_required", configurableByOrganization: true, requiredApprovals: ["Executive Command", "System Owner"], appliesTo: ["operations", "knowledge", "future-departments"] },
    { id: "destructive-file-operations", name: "No destructive file operations", description: "Destructive file operations are blocked by policy and require manual execution outside autonomous workflows.", severity: "blocked", configurableByOrganization: false, requiredApprovals: [], appliesTo: ["operations", "knowledge", "future-departments"] }
  ];
}

export function evaluateGovernancePolicy(action: string, policies = defaultGovernancePolicies()): PolicyEvaluation {
  const normalized = action.toLowerCase();
  const matchedPolicies = policies.filter((policy) => normalized.includes(policy.id.split("-")[0]) || policy.description.toLowerCase().split(" ").some((word) => word.length > 7 && normalized.includes(word)));
  const blocked = matchedPolicies.some((policy) => policy.severity === "blocked");
  const requiresApproval = matchedPolicies.some((policy) => policy.severity === "approval_required");
  return {
    action,
    allowed: !blocked && !requiresApproval,
    requiresApproval,
    matchedPolicies,
    explanation: matchedPolicies.length ? `${blocked ? "Blocked" : requiresApproval ? "Approval required" : "Allowed"} by ${matchedPolicies.map((policy) => policy.name).join(", ")}.` : "No governance policy matched; action remains recommendation-only until routed through an approved workflow."
  };
}

export function buildGovernanceSnapshot(now = new Date()): GovernanceSnapshot {
  const governanceUnits = departments.map(([id, name], index) => ({
    id,
    name,
    executiveParent: "Chief of Staff",
    teams: [`${name} Strategy`, `${name} Operations`],
    agents: [`${name} Agent`],
    workflows: [`${name} Review`, `${name} Department Review`],
    plugins: [`${id}-dashboard`, `${id}-workflow`],
    kpis: baseKpis(index),
    bottlenecks: index % 2 ? ["Approval queue aging"] : ["Knowledge evidence needs review"],
    recommendedActions: index % 2 ? ["Escalate delayed approvals during lunch update."] : ["Attach knowledge sources before executive recommendation."]
  }));
  const policies = defaultGovernancePolicies();
  const policyEvaluations = ["send external email to sponsor", "submit grant application", "file legal document", "initiate payment", "write connector record", "destructive file delete"].map((action) => evaluateGovernancePolicy(action, policies));
  const avg = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));

  return {
    organizationChart: ["Executive Command", "Chief of Staff", "Executive Office", ...departments.slice(1).map(([, name]) => name)],
    departments: governanceUnits,
    policies,
    policyEvaluations,
    decisions: [{ id: "decision-governance-1", recommendation: "Approve department scorecard review and keep all external actions gated.", why: "Department KPIs show measurable throughput but approval waits and evidence quality need executive review.", supportingEvidence: ["Department KPI rollups", "Policy evaluations", "Chief of Staff queue signals"], knowledgeSources: ["Knowledge Graph", "Organizational Memory", "Executive Intelligence"], confidence: "high", confidenceScore: 86, risks: ["Approval bottlenecks may delay time-sensitive funding or legal work."], alternatives: ["Review only high-risk departments", "Defer automation recommendations until more history is available"], requiredApprovals: ["Executive Command"], expectedImpact: "Improves accountability without authorizing external action.", policy: policies.map((policy) => policy.name) }],
    operatingRhythm: ["Morning Briefing", "Lunch Update", "Evening Debrief", "Weekly Executive Review", "Monthly Executive Review", "Quarterly Strategy Review", "Annual Organizational Review", "Board Packet", "Grant Review", "Sponsor Review", "Department Review"].map((artifact) => ({ cadence: artifact.includes("Morning") || artifact.includes("Lunch") || artifact.includes("Evening") ? "daily" : artifact.includes("Weekly") ? "weekly" : artifact.includes("Monthly") ? "monthly" : artifact.includes("Quarterly") ? "quarterly" : artifact.includes("Annual") ? "annual" : "as-needed", artifact, owner: "Chief of Staff", purpose: `Prepare ${artifact.toLowerCase()} with evidence, policy status, risks, and approvals.`, requiredSections: ["KPIs", "Risks", "Decisions", "Approvals", "Evidence"] })),
    memoryRecords: memoryTemplates.map(([type, title]) => ({ type, title, summary: `${title} retained in organizational memory for governance audit and explainability.`, retainedForAudit: true })),
    scorecard: { organizationHealth: avg(governanceUnits.map((unit) => unit.kpis.health)), departmentHealth: avg(governanceUnits.map((unit) => unit.kpis.health)), fundingHealth: governanceUnits[2].kpis.health, legalHealth: governanceUnits[1].kpis.health, knowledgeHealth: governanceUnits[5].kpis.health, aiWorkforceHealth: 82, connectorHealth: 78, pluginHealth: 84, memoryHealth: 80, automationHealth: avg(governanceUnits.map((unit) => unit.kpis.automationSuccessRate)) },
    workloadBalancer: { queueRebalances: ["Move aged approvals to Executive Office review."], reassignments: ["Route blocked funding evidence tasks to Knowledge before sponsor outreach."], escalations: ["Escalate legal, payment, grant, connector-write, and external-email actions requiring approval."], bottlenecks: ["Approval wait time", "Knowledge evidence coverage", "Connector write gates"], staffingRecommendations: ["Add reviewer capacity for Legal, Funding, and Finance approval queues."], automationRecommendations: ["Automate briefing assembly, KPI rollups, and policy checks only; keep writes approval-gated."] },
    whiteLabelHooks: ["Organization-scoped policies", "Industry-specific approval rules", "Configurable executive structures", "Department templates for future departments"],
    macKnowledgeHooks: ["Mac Knowledge Vault audit placeholder", "Future local-source evidence attestation", "No Mac indexing implemented"],
    generatedAt: now.toISOString()
  };
}
