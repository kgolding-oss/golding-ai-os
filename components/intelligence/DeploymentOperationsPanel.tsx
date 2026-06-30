import type { ExecutiveSnapshot } from "../../lib/intelligence";
import { Widget } from "../dashboard/Widget";
export function DeploymentOperationsPanel({ snapshot }: { snapshot: ExecutiveSnapshot }) {
  const infra = snapshot.score.categories.find((c) => c.category.toLowerCase().includes("operational"))?.score ?? snapshot.score.overall;
  return <Widget eyebrow="Deployment Operations" title="Infrastructure and release readiness">
    <div className="metricList"><p><strong>{snapshot.score.overall}</strong> production readiness</p><p><strong>{snapshot.timeline.length}</strong> deployment history signals</p><p><strong>{snapshot.risks.filter((r) => r.title.toLowerCase().includes("deploy") || r.title.toLowerCase().includes("release")).length}</strong> failed deployment risks</p><p><strong>{infra}</strong> infrastructure score</p></div>
    <ul className="compactList"><li><strong>Deployment latency</strong><span>Tracked by Vercel telemetry and surfaced through /api/health.</span></li><li><strong>Release readiness</strong><span>{snapshot.score.explanation}</span></li><li><strong>Runtime health</strong><span>{snapshot.recommendations[0]?.title ?? "No runtime deployment recommendation."}</span></li></ul>
  </Widget>;
}
