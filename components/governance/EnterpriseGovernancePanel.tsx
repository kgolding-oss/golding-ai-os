import type { GovernanceSnapshot } from "../../lib/governance";
import { Widget } from "../dashboard/Widget";

export function EnterpriseGovernancePanel({ snapshot }: { snapshot: GovernanceSnapshot }) {
  const blockedPolicies = snapshot.policyEvaluations.filter((evaluation) => !evaluation.allowed).length;
  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Enterprise Governance Layer</p>
        <h2>Autonomous Executive Office with accountable departments</h2>
        <p className="muted">Governance coordinates Executive Command, Chief of Staff, departments, workflows, plugins, knowledge, memory, and AI workforce signals without taking unauthorized external actions.</p>
      </div>
      <section className="grid threeColumn">
        <Widget eyebrow="Executive scorecard" title={`${snapshot.scorecard.organizationHealth}% organization health`}>
          <ul>
            <li>Funding: {snapshot.scorecard.fundingHealth}% · Legal: {snapshot.scorecard.legalHealth}% · Knowledge: {snapshot.scorecard.knowledgeHealth}%</li>
            <li>AI workforce: {snapshot.scorecard.aiWorkforceHealth}% · Connectors: {snapshot.scorecard.connectorHealth}% · Plugins: {snapshot.scorecard.pluginHealth}%</li>
            <li>Memory: {snapshot.scorecard.memoryHealth}% · Automation: {snapshot.scorecard.automationHealth}%</li>
          </ul>
        </Widget>
        <Widget eyebrow="Policy engine" title={`${blockedPolicies} approval-gated evaluations`}>
          <ul>{snapshot.policyEvaluations.map((evaluation) => <li key={evaluation.action}>{evaluation.action}: {evaluation.explanation}</li>)}</ul>
        </Widget>
        <Widget eyebrow="Operating rhythm" title={`${snapshot.operatingRhythm.length} executive artifacts`}>
          <ul>{snapshot.operatingRhythm.slice(0, 7).map((rhythm) => <li key={rhythm.artifact}>{rhythm.cadence}: {rhythm.artifact}</li>)}</ul>
        </Widget>
      </section>
      <section className="grid twoColumn">
        <Widget eyebrow="Department scorecards" title={`${snapshot.departments.length} departments measured`}>
          <ul>{snapshot.departments.map((department) => <li key={department.id}>{department.name}: {department.kpis.tasksCompleted} complete · {department.kpis.pendingWork} pending · {department.kpis.blockedWork} blocked · risk {department.kpis.riskScore}</li>)}</ul>
        </Widget>
        <Widget eyebrow="Explainable decisions" title={`${snapshot.decisions.length} executive recommendations`}>
          {snapshot.decisions.map((decision) => <article key={decision.id} className="card"><h3>{decision.recommendation}</h3><p>{decision.why}</p><p><strong>Evidence:</strong> {decision.supportingEvidence.join(", ")}</p><p><strong>Policy:</strong> {decision.policy.join(", ")}</p><p><strong>Confidence:</strong> {decision.confidenceScore}% · <strong>Approvals:</strong> {decision.requiredApprovals.join(", ")}</p></article>)}
        </Widget>
      </section>
      <section className="grid twoColumn">
        <Widget eyebrow="Workload balancer" title="Chief of Staff queue governance">
          <ul>
            {snapshot.workloadBalancer.queueRebalances.map((item) => <li key={item}>{item}</li>)}
            {snapshot.workloadBalancer.escalations.map((item) => <li key={item}>{item}</li>)}
            {snapshot.workloadBalancer.automationRecommendations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Widget>
        <Widget eyebrow="Compatibility" title="White-label and Mac Knowledge ready">
          <p><strong>White-label:</strong> {snapshot.whiteLabelHooks.join("; ")}</p>
          <p><strong>Mac Knowledge:</strong> {snapshot.macKnowledgeHooks.join("; ")}</p>
        </Widget>
      </section>
    </section>
  );
}
