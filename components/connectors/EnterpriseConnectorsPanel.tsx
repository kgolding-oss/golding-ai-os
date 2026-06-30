import { Widget } from "../dashboard/Widget";
import type { ConnectorDefinition, ConnectorSession } from "../../lib/connectors";
export function EnterpriseConnectorsPanel({ connectors, sessions, diagnostics }: { connectors: ConnectorDefinition[]; sessions: ConnectorSession[]; diagnostics: { telemetry: { events: number; executions: number; failures: number; policyDenials: number }; connectors: { id: string; diagnostics: string[]; warnings: string[] }[] } }) {
  return <section className="grid twoColumn">
    <Widget title="Enterprise Connectors" eyebrow="Deterministic connector framework">
      <div className="metricList"><p><strong>{connectors.length}</strong> registered connectors</p><p><strong>{diagnostics.telemetry.executions}</strong> executions</p><p><strong>{diagnostics.telemetry.failures}</strong> failures</p><p><strong>{diagnostics.telemetry.policyDenials}</strong> policy denials</p></div>
      {connectors.length ? <ul className="compactList">{connectors.map((connector) => <li key={connector.id}><strong>{connector.name}</strong><span>{connector.provider} · {connector.category} · {connector.health.status} · auth {connector.health.authenticationStatus}</span><span>{connector.supportedOperations.map((operation) => operation.id).join(", ")}</span></li>)}</ul> : <p className="emptyState">No enterprise connectors are registered.</p>}
    </Widget>
    <Widget title="Connector Diagnostics" eyebrow="Capabilities, sessions & health">
      {connectors.length ? <ul className="compactList">{connectors.map((connector) => <li key={connector.id}><strong>{connector.capabilities.map((capability) => capability.name).join(", ")}</strong><span>{connector.supportedResources.map((resource) => resource.name).join(", ")}</span><span>Score {connector.health.healthScore}; {connector.health.diagnostics.join(" ")}</span></li>)}</ul> : <p className="emptyState">Connector capabilities will appear after registration.</p>}
      {sessions.length ? <p>{sessions.length} connector runtime sessions are tracked.</p> : <p className="emptyState">No connector runtime sessions have executed yet.</p>}
    </Widget>
  </section>;
}
