import type { Activity, AuditLog } from "../../lib/dashboard/queries";
import { Widget } from "./Widget";

export function RecentActivity({ activity, auditLogs = [] }: { activity: Activity[]; auditLogs?: AuditLog[] }) {
  const events = [
    ...activity.map((item) => ({ id: `activity-${item.id}`, title: item.activity_type, body: item.summary, created_at: item.created_at })),
    ...auditLogs.map((item) => ({ id: `audit-${item.id}`, title: item.action, body: item.entity_table ?? "Audit event", created_at: item.created_at })),
  ].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()).slice(0, 10);

  return <Widget eyebrow="Recent activity" title="Operating timeline"><ol className="auditList">{events.length ? events.map((item) => <li key={item.id}><strong>{item.title}</strong><br />{item.body}</li>) : <li>No activity has been recorded for the active organization yet.</li>}</ol></Widget>;
}
