import type { LawLibraryFundingSnapshot } from "../../lib/agents/law-library-funding";
import { buildLawLibraryFundingDashboard } from "../../lib/agents/law-library-funding";
import { Widget } from "../dashboard/Widget";

export function LawLibraryFundingPanel({ snapshot }: { snapshot: LawLibraryFundingSnapshot }) {
  const dashboard = buildLawLibraryFundingDashboard(snapshot);
  return (
    <Widget eyebrow="The Law Library" title="Funding OS">
      <div className="briefGrid">
        <Stat label="Funding goal" value={`$${dashboard.totalGoal.toLocaleString()}`} />
        <Stat label="Secured" value={`$${dashboard.secured.toLocaleString()}`} />
        <Stat label="Weighted forecast" value={`$${Math.round(dashboard.weightedForecast).toLocaleString()}`} />
        <Stat label="Pending approvals" value={dashboard.pendingApprovals.length} />
      </div>
      <section className="miniList">
        <h3>Dedicated funding agents</h3>
        {snapshot.agents.map((agent) => <p key={agent.role}>{agent.name}: {agent.responsibilities[0]}</p>)}
      </section>
      <section className="miniList">
        <h3>Integrated GAIOS agents</h3>
        {snapshot.integrations.map((integration) => <p key={integration.agent}>{integration.agent}: {integration.responsibility}</p>)}
      </section>
      <section className="miniList">
        <h3>Tracked pipeline</h3>
        <p>Grants: {snapshot.grants.length} · Sponsors: {snapshot.sponsors.length} · Donors: {snapshot.donors.length} · Partners: {snapshot.partners.length}</p>
        <p>Proposals: {snapshot.proposals.length} · Reports: {snapshot.reports.length} · Outreach drafts: {snapshot.outreachDrafts.length}</p>
      </section>
      <section className="miniList">
        <h3>Human approval gates</h3>
        {dashboard.pendingApprovals.map((approval) => <p key={approval.id}>{approval.action}: {approval.label} → {approval.owner}</p>)}
      </section>
      <section className="miniList">
        <h3>Risk flags</h3>
        {dashboard.riskFlags.map((risk) => <p key={risk.id}>{risk.severity}: {risk.title}</p>)}
      </section>
    </Widget>
  );
}
function Stat({ label, value }: { label: string; value: number | string }) { return <div className="briefStat"><strong>{value}</strong><span>{label}</span></div>; }
