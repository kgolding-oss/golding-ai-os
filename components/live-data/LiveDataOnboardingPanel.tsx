import { Widget } from "../dashboard/Widget";
import type { buildLiveDataOnboardingDashboard } from "../../lib/live-data-onboarding";

type Dashboard = ReturnType<typeof buildLiveDataOnboardingDashboard>;

export function LiveDataOnboardingPanel({
  dashboard,
}: {
  dashboard: Dashboard;
}) {
  return (
    <section className="grid twoColumn">
      <Widget
        title="Live Data Onboarding Center"
        eyebrow="Approval-gated source control"
      >
        <div className="metricList">
          <p>
            <strong>{dashboard.sourcesDiscovered}</strong> sources discovered
          </p>
          <p>
            <strong>{dashboard.sourcesPendingApproval}</strong> pending approval
          </p>
          <p>
            <strong>{dashboard.recordsStaged}</strong> records staged
          </p>
          <p>
            <strong>{dashboard.auditEventCount}</strong> audit events
          </p>
        </div>
        <ul className="compactList">
          {dashboard.sources.map((source) => (
            <li key={source.id}>
              <strong>{source.name}</strong>
              <span>
                {source.workspace} · {source.status} · {source.classification}
              </span>
              <span>
                AI exposure: {source.aiExposure}; automatic content ingestion:{" "}
                {String(source.automaticContentIngestion)}
              </span>
            </li>
          ))}
        </ul>
      </Widget>
      <Widget
        title="Safe Ingestion Review"
        eyebrow="Classifications, errors & next actions"
      >
        <p>
          <strong>Sensitive categories:</strong>{" "}
          {dashboard.sensitiveCategories.join(", ") || "none staged"}
        </p>
        {dashboard.ingestionErrors.length ? (
          <ul className="compactList">
            {dashboard.ingestionErrors.map((item) => (
              <li key={`${item.source}-${item.error}`}>
                <strong>{item.source}</strong>
                <span>{item.error}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="emptyState">
            No ingestion errors are blocking metadata review.
          </p>
        )}
        <ul className="compactList">
          {dashboard.nextSafeActions.slice(0, 5).map((item) => (
            <li key={item.source}>
              <strong>{item.source}</strong>
              <span>{item.action}</span>
            </li>
          ))}
        </ul>
      </Widget>
    </section>
  );
}
