import type { Approval, Agent } from "../../lib/dashboard/queries";
import { getRecentApprovals } from "../../lib/dashboard/metrics";
import { Widget } from "./Widget";

export function ExecutiveBrief({ approvals, agents }: { approvals: Approval[]; agents: Agent[] }) {
  const activeAgents = agents.filter((agent) => agent.status === "active").length;
  const recentApprovals = getRecentApprovals(approvals);
  return (
    <Widget eyebrow="Executive brief" title="Decision intelligence">
      <div className="promptBox">{activeAgents} active AI agents are registered for operating support. Approval-sensitive work is surfaced below for executive review.</div>
      <div className="list executiveBriefList">
        {recentApprovals.length ? recentApprovals.map((approval) => <div className="row" key={approval.id}><div><strong>{approval.title}</strong><span>{approval.reason ?? "No reason recorded"}</span></div><em>Risk {approval.risk_score ?? 0} · {approval.status ?? "pending"}</em></div>) : <p className="emptyState">No approvals have been requested yet.</p>}
      </div>
    </Widget>
  );
}
