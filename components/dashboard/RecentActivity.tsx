import type { Activity } from "../../lib/dashboard/queries";
import { Widget } from "./Widget";

export function RecentActivity({ activity }: { activity: Activity[] }) {
  return <Widget eyebrow="Audit signal" title="Recent activity"><ol className="auditList">{activity.length ? activity.map((item) => <li key={item.id}><strong>{item.activity_type}</strong><br />{item.summary}</li>) : <li>No activity has been recorded yet.</li>}</ol></Widget>;
}
