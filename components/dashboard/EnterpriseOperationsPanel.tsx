import type { DashboardData, Organization } from "../../lib/dashboard/queries";
import type { ProductionData } from "../../lib/operations-data";
import { buildEnterpriseOperationsSnapshot } from "../../lib/enterprise-operations";
import { Widget } from "./Widget";

export function EnterpriseOperationsPanel({ dashboard, production, organization }: { dashboard: DashboardData; production: ProductionData; organization?: Organization | null }) {
  const snapshot = buildEnterpriseOperationsSnapshot(dashboard, production, organization);
  const activeWorkspace = snapshot.workspaces.find((workspace) => workspace.active) ?? snapshot.workspaces[0];
  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Milestone 12 · Enterprise Operations</p>
        <h2>Autonomous execution with approval boundaries</h2>
        <p className="muted">Workspace, graph, workflow, analytics, and AI workforce views synthesize live organization-scoped records. External or high-risk actions remain blocked until human approval.</p>
      </div>
      <div className="metricGrid">
        <div><strong>{snapshot.workspaces.length}</strong><span>enterprise workspaces</span></div>
        <div><strong>{snapshot.reusableWorkflows.length}</strong><span>approval-gated workflows</span></div>
        <div><strong>{snapshot.knowledgeGraph.nodeTypes.length}</strong><span>knowledge graph node types</span></div>
        <div><strong>{snapshot.aiWorkforce.pendingApprovals}</strong><span>pending approvals</span></div>
      </div>
      <section className="grid twoColumn">
        <Widget eyebrow="Workspace" title={activeWorkspace.name}>
          <ul>{activeWorkspace.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
        </Widget>
        <Widget eyebrow="Executive intelligence" title="Synthesized report cadence">
          <ul>{snapshot.executiveReports.map((report) => <li key={report.name}><strong>{report.name}:</strong> {report.synthesis}</li>)}</ul>
        </Widget>
        <Widget eyebrow="Cross-agent collaboration" title="Chief of Staff coordinated delegations">
          <ul>{snapshot.collaborationWorkflows.map((workflow) => <li key={workflow.id}>{workflow.name} · approval before {workflow.approvalGate}</li>)}</ul>
        </Widget>
        <Widget eyebrow="Analytics" title="Enterprise KPI domains">
          <ul>{snapshot.kpis.map((kpi) => <li key={kpi.domain}>{kpi.domain}: {kpi.active} active / {kpi.records} total</li>)}</ul>
        </Widget>
      </section>
    </section>
  );
}
