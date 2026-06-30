import type { AgentOrchestrator } from "../../lib/orchestration";
import { Widget } from "./Widget";

export function AIWorkforcePanel({ orchestrator }: { orchestrator: AgentOrchestrator }) {
  const workforce = orchestrator.workforce();
  const metrics = workforce.health;
  return (
    <Widget eyebrow="AI Workforce" title="Orchestration command center">
      <div className="statusSummary">
        <strong>{metrics.registeredAgents}</strong><span>registered</span>
        <strong>{metrics.runningAgents}</strong><span>running</span>
        <strong>{metrics.queuedWork}</strong><span>queued</span>
        <strong>{metrics.completedWork}</strong><span>completed</span>
      </div>
      <div className="list compactList">
        {workforce.agents.length ? workforce.agents.slice(0, 8).map((agent) => (
          <div className="row" key={agent.id}>
            <div><strong>{agent.name}</strong><span>{agent.role}</span></div>
            <em>{agent.status} · {agent.health}</em>
          </div>
        )) : <p className="emptyState">No agents are registered with the orchestration registry yet.</p>}
      </div>
      <div className="insightGrid">
        <span>Health score: <strong>{metrics.healthScore}</strong></span>
        <span>Throughput/min: <strong>{metrics.throughputPerMinute}</strong></span>
        <span>Events: <strong>{workforce.events.length}</strong></span>
        <span>Failures: <strong>{metrics.failedWork}</strong></span>
      </div>
      {!workforce.queue.length && <p className="emptyState">No orchestration work is queued. Delegated tasks will appear here before deterministic execution.</p>}
      {!workforce.events.length && <p className="emptyState">No agent communication events have been emitted for this server session.</p>}
    </Widget>
  );
}
