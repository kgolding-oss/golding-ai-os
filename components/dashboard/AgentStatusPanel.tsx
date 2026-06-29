import type { Activity, Agent } from "../../lib/dashboard/queries";
import { getUnhealthyAgents } from "../../lib/dashboard/intelligence";
import { Widget } from "./Widget";

export function AgentStatusPanel({ agents, activity }: { agents: Agent[]; activity: Activity[] }) {
  const activeAgents = agents.filter((agent) => String(agent.status ?? "").toLowerCase() === "active").length;
  const unhealthyAgents = getUnhealthyAgents(agents);

  return (
    <Widget eyebrow="AI workforce" title="Agent status panel">
      <div className="statusSummary"><strong>{activeAgents}/{agents.length}</strong><span>active agents</span><strong>{unhealthyAgents.length}</strong><span>health exceptions</span></div>
      <div className="list compactList">
        {agents.length ? agents.slice(0, 6).map((agent) => (
          <div className="row" key={agent.id}>
            <div><strong>{agent.name}</strong><span>{agent.role ?? "Role not recorded"}</span></div>
            <em>{agent.status ?? "draft"} · {agent.health ?? "Unknown"}</em>
          </div>
        )) : <p className="emptyState">No agents are registered for the active organization yet.</p>}
      </div>
      {activity.length ? <p className="activityHint">Latest signal: {activity[0].summary}</p> : <p className="emptyState">No agent activity has been recorded for this organization.</p>}
    </Widget>
  );
}
