import type { Task } from "@/lib/data/dashboard";

export function TaskTable({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <p className="empty-state">No open tasks found for this account.</p>;
  return <div className="table-wrap"><table><thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td>{task.title}</td><td>{task.status}</td><td>{task.priority}</td><td>{task.due_date ?? "Unscheduled"}</td></tr>)}</tbody></table></div>;
}
