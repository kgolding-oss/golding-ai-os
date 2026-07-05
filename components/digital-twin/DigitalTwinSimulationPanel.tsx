import type { DigitalTwin, SimulationComparison, SimulationDashboard } from "../../lib/digital-twin";
import { Widget } from "../dashboard/Widget";

export function DigitalTwinSimulationPanel({ twin, comparison, dashboard }: { twin: DigitalTwin; comparison: SimulationComparison; dashboard: SimulationDashboard }) {
  return (
    <section className="panel stack">
      <div className="panelHeader">
        <div><p className="eyebrow">Digital Twin & Scenario Simulation</p><h2>{twin.organization?.name ?? "Organization"} operational twin</h2><p className="muted">Simulation-only forecasts use organizational memory, Knowledge Graph health, governance policy, plugins, and dashboard state. No connector writes, emails, payments, or filings are executed.</p></div>
        <span className="pill">{dashboard.activeSimulations} active simulations</span>
      </div>
      <section className="grid threeColumn">
        <Widget eyebrow="Recommended scenario" title={dashboard.recommendedScenario}><p>Confidence: {dashboard.confidence}%</p><p>Governance: simulation-only, approvals preserved, connector writes disabled.</p></Widget>
        <Widget eyebrow="Digital twin scope" title={`${twin.departments.length} departments · ${twin.agents} agents`}><p>{twin.projects} projects · {twin.workflows} workflows · {twin.tasks} tasks · {twin.approvals} pending approvals.</p></Widget>
        <Widget eyebrow="Knowledge + plugins" title={`${twin.knowledgeGraph.indexedDocuments.toLocaleString()} indexed documents`}><p>{twin.knowledgeGraph.providers} knowledge providers · {twin.plugins.enabled} enabled plugins · {twin.plugins.simulationModelPlugins.length} simulation-capable plugin hooks.</p></Widget>
      </section>
      <section className="grid twoColumn">
        <Widget eyebrow="Predicted bottlenecks" title="Forecasted constraints"><ul>{dashboard.predictedBottlenecks.map((item) => <li key={item}>{item}</li>)}</ul></Widget>
        <Widget eyebrow="Projected KPI changes" title="Recommended scenario impact"><ul>{dashboard.projectedKpiChanges.map((kpi) => <li key={kpi.name}>{kpi.name}: {kpi.current.toLocaleString()} → {kpi.expected.toLocaleString()} ({kpi.delta >= 0 ? "+" : ""}{kpi.delta.toLocaleString()} {kpi.unit})</li>)}</ul></Widget>
      </section>
      <Widget eyebrow="Decision comparison" title="Executive what-if strategies side by side">
        <div className="tableLike">
          {comparison.comparison.map((scenario) => <div className="tableRow" key={scenario.id}><strong>{scenario.name}</strong><span>Cost {scenario.cost}</span><span>Risk {scenario.risk}</span><span>Time {scenario.time}</span><span>Workload {scenario.workload}</span><span>Funding ${scenario.funding.toLocaleString()}</span><span>Success {scenario.successProbability}%</span><span>Confidence {scenario.confidence}%</span></div>)}
        </div>
      </Widget>
      <section className="grid twoColumn">
        {comparison.scenarios.slice(0, 4).map((scenario) => <article className="card" key={scenario.id}><p className="eyebrow">{scenario.strategy}</p><h3>{scenario.name}</h3><p><strong>Risks:</strong> {scenario.risks.join(", ")}</p><p><strong>Approvals:</strong> {scenario.approvalImpact.join(" ")}</p><p><strong>Recommended actions:</strong> {scenario.recommendedActions.join(" ")}</p></article>)}
      </section>
    </section>
  );
}
