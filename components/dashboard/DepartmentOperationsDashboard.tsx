import type { Approval, Health, Task } from "../../lib/dashboard/queries";
import type { ProductionData } from "../../lib/operations-data";
import { Widget } from "./Widget";

type Department = { name: string; kpi: string; queues: Array<keyof ProductionData>; approvalTypes: string[] };
const departments: Department[] = [
  { name: "Legal Operations", kpi: "Case triage and client service", queues: ["cases", "clients", "knowledge_sources"], approvalTypes: ["legal", "case", "external"] },
  { name: "Funding", kpi: "Grant, sponsor, and donor execution", queues: ["funding", "sponsors", "donors"], approvalTypes: ["funding", "finance", "outreach"] },
  { name: "Education", kpi: "Program delivery and learning assets", queues: ["programs", "volunteers", "knowledge_sources"], approvalTypes: ["education", "publishing"] },
  { name: "Partnerships", kpi: "Referral and relationship health", queues: ["partners", "sponsors", "volunteers"], approvalTypes: ["partnership", "outreach"] },
  { name: "Media", kpi: "Approved content pipeline", queues: ["media_assets", "programs", "partners"], approvalTypes: ["media", "publishing", "external"] },
];
function active(rows: Array<{ status?: string | null }>) { return rows.filter((row) => !["closed", "complete", "completed", "archived", "done"].includes(String(row.status ?? "").toLowerCase())).length; }
function forDepartmentApprovals(approvals: Approval[], department: Department) { return approvals.filter((approval) => approval.status === "pending" && department.approvalTypes.some((type) => `${approval.reason ?? ""} ${approval.title ?? ""}`.toLowerCase().includes(type))); }
export function DepartmentOperationsDashboard({ production, tasks, approvals, health }: { production: ProductionData; tasks: Task[]; approvals: Approval[]; health: Health[] }) {
  const connectorIssues = health.filter((item) => !["healthy", "connected"].includes(String(item.health ?? item.connection_status ?? "").toLowerCase())).length;
  return <section className="panel stack"><div><p className="eyebrow">AI Workforce Departments</p><h2>Department dashboards with queues, KPIs, approvals, and health</h2><p className="muted">Each department uses organization-scoped operational repositories and blocks high-risk external actions behind human approval.</p></div><section className="grid twoColumn">{departments.map((department) => { const records = department.queues.flatMap((queue) => production[queue]); const pending = forDepartmentApprovals(approvals, department); const taskBacklog = tasks.filter((task) => department.approvalTypes.some((type) => `${task.title ?? ""} ${task.description ?? ""}`.toLowerCase().includes(type))).length; return <Widget key={department.name} eyebrow={department.name} title={department.kpi}><div className="metricGrid compactMetrics"><div><strong>{records.length}</strong><span>records</span></div><div><strong>{active(records)}</strong><span>queue depth</span></div><div><strong>{pending.length}</strong><span>approvals</span></div><div><strong>{connectorIssues ? "watch" : "clear"}</strong><span>health</span></div></div><ul><li>{taskBacklog} related executive tasks in queue.</li><li>Approval gate: required before public, legal, financial, or external actions.</li><li>Audit mode: deterministic execution with organization isolation.</li></ul></Widget>; })}</section></section>;
}
