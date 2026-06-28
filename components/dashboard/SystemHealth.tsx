import { getHealthSummary } from "../../lib/dashboard/metrics";
import type { Health } from "../../lib/dashboard/queries";
import { Widget } from "./Widget";

export function SystemHealth({ health }: { health: Health[] }) {
  const summary = getHealthSummary(health);
  return <Widget eyebrow="Infrastructure" title="System health"><p className="emptyState">{summary.connected} connected · {summary.notConnected} not connected</p><div className="healthMiniGrid">{health.length ? health.slice(0, 8).map((service) => <div className="healthMini" key={service.id}><span className={`healthDot ${(service.health ?? "").toLowerCase()}`} /><div><strong>{service.service_name}</strong><span>{service.connection_status ?? "Unknown"}</span></div></div>) : <p className="emptyState">No services are registered in system health.</p>}</div></Widget>;
}
