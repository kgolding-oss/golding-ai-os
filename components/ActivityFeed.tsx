import type { AuditLog } from "@/lib/data/dashboard";

export function ActivityFeed({ items }: { items: AuditLog[] }) {
  if (!items.length) return <p className="empty-state">No recent activity yet.</p>;
  return <ol className="activity-feed">{items.map((item) => <li key={item.id}><strong>{item.action}</strong><span>{item.entity_type ?? "System"} · {new Date(item.created_at).toLocaleString()}</span></li>)}</ol>;
}
