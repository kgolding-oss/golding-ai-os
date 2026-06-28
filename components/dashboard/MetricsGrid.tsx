import type { DashboardMetric } from "../../lib/dashboard/metrics";

export function MetricsGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return <section className="metrics">{metrics.map((metric) => <article className="panel metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.detail}</p></article>)}</section>;
}
