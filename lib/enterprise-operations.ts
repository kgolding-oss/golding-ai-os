import type { Approval, DashboardData, Organization, Task } from "./dashboard/queries";
import type { ProductionData, ProductionEntity } from "./operations-data";

export const enterpriseWorkspaces = [
  "The Law Library",
  "Golding Compound",
  "Relax With Me",
  "YouPassGo",
  "TLC Creations",
  "Musa Links",
  "YardYank",
  "J&J Catering",
] as const;

export const workspaceCapabilities = ["Organizations", "Projects", "Tasks", "Documents", "Knowledge", "CRM", "Finance", "Reporting", "Users", "Permissions"] as const;

export const collaborationWorkflows = [
  { id: "research-grant-writing", name: "Research → Grant Writing", coordinator: "Chief of Staff", approvalGate: "external submission" },
  { id: "research-legal", name: "Research → Legal", coordinator: "Chief of Staff", approvalGate: "legal advice or filing" },
  { id: "crm-funding", name: "CRM → Funding", coordinator: "Chief of Staff", approvalGate: "sponsor or donor outreach" },
  { id: "funding-finance", name: "Funding → Finance", coordinator: "Chief of Staff", approvalGate: "budget commitment" },
  { id: "media-education", name: "Media → Education", coordinator: "Chief of Staff", approvalGate: "public publishing" },
  { id: "knowledge-legal", name: "Knowledge → Legal", coordinator: "Chief of Staff", approvalGate: "privileged or external action" },
  { id: "property-finance", name: "Property → Finance", coordinator: "Chief of Staff", approvalGate: "vendor payment or contract" },
] as const;

export const reusableWorkflows = ["Grant lifecycle", "Sponsor lifecycle", "Case lifecycle", "Volunteer onboarding", "Board meetings", "Project approvals", "Media production", "Course publishing"] as const;
export const kpiDomains = ["Funding", "Cases", "Education", "Partnerships", "Media", "Finance", "Operations", "Property", "AI Workforce"] as const;
export const knowledgeGraphNodeTypes = ["People", "Organizations", "Cases", "Grants", "Sponsors", "Donors", "Projects", "Meetings", "Documents", "Programs", "Tasks", "Relationships"] as const;

const productionToKpi: Record<ProductionEntity, (typeof kpiDomains)[number]> = {
  funding: "Funding",
  cases: "Cases",
  programs: "Education",
  partners: "Partnerships",
  media_assets: "Media",
  donors: "Finance",
  sponsors: "Funding",
  clients: "Operations",
  volunteers: "Operations",
  knowledge_sources: "Operations",
};

function actionable<T extends { status?: string | null }>(rows: T[]) {
  return rows.filter((row) => !["closed", "complete", "completed", "archived", "done", "approved", "rejected"].includes(String(row.status ?? "").toLowerCase()));
}

function riskLabel(approvals: Approval[], tasks: Task[]) {
  const highRiskApprovals = approvals.filter((approval) => approval.status === "pending" && Number(approval.risk_score ?? 0) >= 70).length;
  const blockedTasks = tasks.filter((task) => String(task.status ?? "").toLowerCase() === "blocked").length;
  if (highRiskApprovals || blockedTasks) return "Executive attention required";
  if (approvals.some((approval) => approval.status === "pending")) return "Approval queue active";
  return "Operating normally";
}

export function buildEnterpriseOperationsSnapshot(dashboard: DashboardData, production: ProductionData, organization?: Organization | null) {
  const productionCounts = Object.entries(production).map(([entity, records]) => ({ entity: entity as ProductionEntity, records: records.length, active: actionable(records).length, kpi: productionToKpi[entity as ProductionEntity] }));
  const kpis = kpiDomains.map((domain) => {
    const sources = productionCounts.filter((item) => item.kpi === domain);
    const records = sources.reduce((sum, item) => sum + item.records, 0);
    const active = sources.reduce((sum, item) => sum + item.active, 0);
    if (domain === "AI Workforce") return { domain, records: dashboard.agents.length, active: dashboard.agents.filter((agent) => String(agent.status ?? "active").toLowerCase() === "active").length };
    if (domain === "Operations") return { domain, records: records + dashboard.tasks.length + dashboard.projects.length, active: active + actionable(dashboard.tasks).length + actionable(dashboard.projects).length };
    return { domain, records, active };
  });

  const pendingApprovals = dashboard.approvals.filter((approval) => approval.status === "pending").length;
  const activeTasks = actionable(dashboard.tasks).length;
  const executiveReports = ["Morning Briefing", "Evening Debrief", "Weekly Executive Report", "Monthly Strategic Report", "Quarterly Board Report", "Annual Organizational Review"].map((name) => ({
    name,
    synthesis: `${organization?.name ?? "Workspace"} has ${activeTasks} active tasks, ${pendingApprovals} pending approvals, and ${productionCounts.reduce((sum, item) => sum + item.active, 0)} active production records. ${riskLabel(dashboard.approvals, dashboard.tasks)}.`,
  }));

  return {
    workspaces: enterpriseWorkspaces.map((name) => ({ name, active: organization?.name === name, capabilities: workspaceCapabilities })),
    collaborationWorkflows,
    reusableWorkflows: reusableWorkflows.map((name) => ({ name, approvalRequiredBeforeExternalAction: true })),
    knowledgeGraph: { nodeTypes: knowledgeGraphNodeTypes, relationshipPolicy: "All cross-entity links remain organization-scoped and audit logged." },
    kpis,
    aiWorkforce: { agents: dashboard.agents.length, delegations: dashboard.activity.filter((item) => item.activity_type.includes("delegat")).length, pendingApprovals, completedWork: dashboard.activity.length, queues: activeTasks, recommendations: dashboard.auditLogs.length },
    executiveReports,
  };
}
