import type { ProductionData } from "../../lib/operations-data";
import { summarizeProductionData } from "../../lib/operations-data";
import type { Activity, Agent, Approval, Health, Project, Task } from "../../lib/dashboard/queries";
import { Widget } from "./Widget";

type Props = {
  tasks: Task[];
  approvals: Approval[];
  agents: Agent[];
  health: Health[];
  projects: Project[];
  activity: Activity[];
  production: ProductionData;
};

export function ExecutiveCommandCenter({ tasks, approvals, agents, health, projects, activity, production }: Props) {
  const summary = summarizeProductionData(production);
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const priorityTasks = tasks.filter((task) => ["critical", "high", "urgent"].includes(String(task.priority ?? "").toLowerCase()) || task.due_at).slice(0, 6);
  const disconnected = health.filter((service) => [service.connection_status, service.health].some((value) => ["disconnected", "unhealthy", "error"].includes(String(value ?? "").toLowerCase())));
  const activeAgents = agents.filter((agent) => !["offline", "disabled", "error"].includes(String(agent.status ?? agent.health ?? "").toLowerCase()));

  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Executive Command · Production Activation</p>
        <h2>Daily operating headquarters</h2>
        <p className="muted">Live queues are assembled from organization-scoped repositories only. Empty sections mean no production records were found, not that work was fabricated.</p>
      </div>
      <div className="metricGrid">
        <div><strong>{priorityTasks.length}</strong><span>daily priorities</span></div>
        <div><strong>{pendingApprovals.length}</strong><span>pending approvals</span></div>
        <div><strong>{activeAgents.length}</strong><span>active AI workers</span></div>
        <div><strong>{summary.totalRecords}</strong><span>production records</span></div>
      </div>
      <section className="grid twoColumn">
        <Widget eyebrow="Morning briefing" title="Today's priority queue">
          <ul>{priorityTasks.length ? priorityTasks.map((task) => <li key={task.id}>{task.title} {task.due_at ? `· due ${new Date(task.due_at).toLocaleDateString()}` : ""}</li>) : <li>No priority tasks are recorded for this organization.</li>}</ul>
        </Widget>
        <Widget eyebrow="Evening debrief" title="Activity and approvals to close">
          <ul>
            <li>{activity.length} AI workforce activity events available for review.</li>
            <li>{pendingApprovals.length} human approval decisions remain open.</li>
            <li>{projects.filter((project) => project.status !== "closed").length} active projects are visible.</li>
          </ul>
        </Widget>
        <Widget eyebrow="Operational summaries" title="Mission-control queues">
          <ul>{summary.activeQueues.length ? summary.activeQueues.map((queue) => <li key={queue.entity}>{queue.entity.replaceAll("_", " ")}: {queue.records.length} actionable records</li>) : <li>No case, funding, CRM, knowledge, media, or volunteer production queues are populated yet.</li>}</ul>
        </Widget>
        <Widget eyebrow="System health" title={disconnected.length ? "Connector attention required" : "Connectors degrade safely"}>
          <ul>{disconnected.length ? disconnected.map((service) => <li key={service.id}>{service.service_name}: {service.connection_status ?? service.health}</li>) : <li>No unhealthy configured service records found.</li>}</ul>
        </Widget>
      </section>
      {summary.emptyEntities.length ? <p className="muted">Awaiting repositories: {summary.emptyEntities.map((entity) => entity.replaceAll("_", " ")).join(", ")}.</p> : null}
    </section>
  );
}
