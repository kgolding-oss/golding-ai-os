import type { WorkflowSummary } from "../../lib/workflows";
import { Widget } from "./Widget";

export function ExecutiveWorkflowPanel({ workflows }: { workflows: WorkflowSummary[] }) {
  const active = workflows.filter((workflow) => workflow.currentState === "running" || workflow.currentState === "validating").length;
  return (
    <Widget eyebrow="Workflow engine" title="Executive workflows">
      <div className="statusSummary"><strong>{workflows.length}</strong><span>registered workflows</span><strong>{active}</strong><span>currently executing</span></div>
      <div className="list compactList">
        {workflows.length ? workflows.map((workflow) => (
          <div className="row" key={workflow.id}>
            <div><strong>{workflow.name}</strong><span>{workflow.description}</span></div>
            <em>{workflow.status} · {workflow.triggerType} · {workflow.currentState} · {workflow.lastExecutionAt ?? "never run"}</em>
          </div>
        )) : <p className="emptyState">No workflows are registered yet.</p>}
      </div>
    </Widget>
  );
}
