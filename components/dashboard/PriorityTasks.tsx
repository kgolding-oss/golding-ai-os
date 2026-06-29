import { getPriorityTasks } from "../../lib/dashboard/metrics";
import type { Task } from "../../lib/dashboard/queries";
import { Widget } from "./Widget";

export function PriorityTasks({ tasks }: { tasks: Task[] }) {
  const priorityTasks = getPriorityTasks(tasks);
  return <Widget eyebrow="Execution" title="Priority tasks"><div className="list">{priorityTasks.length ? priorityTasks.map((task) => <div className="row" key={task.id}><div><strong>{task.title}</strong><span>{task.description ?? task.details ?? "No description recorded"}</span></div><em className={`pill ${task.priority ?? "medium"}`}>{task.priority ?? "medium"}</em></div>) : <p className="emptyState">No active tasks are available. Create tasks to populate this queue.</p>}</div></Widget>;
}
