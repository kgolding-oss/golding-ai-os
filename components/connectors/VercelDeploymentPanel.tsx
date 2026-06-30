import { Widget } from "../dashboard/Widget";
import type { ConnectorDefinition } from "../../lib/connectors";
export function VercelDeploymentPanel({ connector }: { connector?: ConnectorDefinition }) {
  const readiness = connector?.health.authenticationStatus === "authenticated" ? 94 : 62;
  return <Widget title="Vercel" eyebrow="Deployment operations">
    <div className="metricList"><p><strong>{connector?.health.status ?? "missing"}</strong> deployment status</p><p><strong>{connector?.health.healthScore ?? 0}</strong> production health</p><p><strong>{readiness}</strong> readiness score</p></div>
    <ul className="compactList"><li><strong>Production & preview deployments</strong><span>Deployment status, preview deployments, build failures, and rollback readiness are routed through Connector Runtime.</span></li><li><strong>Domains & SSL</strong><span>Domain health, DNS status, and SSL status are monitored without exposing credentials.</span></li><li><strong>Runtime</strong><span>Functions, logs, warning counts, latency metrics, and runtime health are available as Vercel operations.</span></li></ul>
  </Widget>;
}
