import { Widget } from "../dashboard/Widget";
import type { RuntimeMetrics, RuntimeSession, RuntimeToolDefinition } from "../../lib/runtime";
export function AIRuntimePanel({ tools, sessions, metrics }: { tools: RuntimeToolDefinition[]; sessions: RuntimeSession[]; metrics: RuntimeMetrics }) {
  const failures = sessions.filter((session) => session.result && !session.result.success);
  return <section className="grid twoColumn">
    <Widget title="AI Runtime" eyebrow="Tool calling & MCP-ready runtime">
      <div className="metricList">
        <p><strong>{tools.length}</strong> registered tools</p><p><strong>{metrics.executions}</strong> executions</p><p><strong>{metrics.failures}</strong> failed executions</p><p><strong>{metrics.runtimeHealth}</strong> runtime health</p><p><strong>{metrics.policyViolations}</strong> policy violations</p>
      </div>
      {tools.length ? <ul className="compactList">{tools.map((tool) => <li key={tool.id}><strong>{tool.name}</strong><span>{tool.category} · {tool.health} · {tool.deterministic ? "deterministic" : "non-deterministic"}</span></li>)}</ul> : <p className="emptyState">No tools are registered.</p>}
    </Widget>
    <Widget title="Runtime Sessions" eyebrow="Deterministic execution timeline">
      {sessions.length ? <ul className="compactList">{sessions.slice(-6).map((session) => <li key={session.id}><strong>{session.result?.success ? "Succeeded" : "Failed"}: {session.toolsUsed.join(", ") || "No tools"}</strong><span>{session.events.map((event) => event.type).join(" → ")}</span></li>)}</ul> : <p className="emptyState">No runtime sessions have executed yet.</p>}
      {failures.length ? <p>{failures.length} sessions need review.</p> : <p>No runtime errors or policy violations are currently recorded.</p>}
    </Widget>
  </section>;
}
