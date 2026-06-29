import type { AttentionItem } from "../../lib/dashboard/intelligence";
import { Widget } from "./Widget";

export function AttentionQueue({ items }: { items: AttentionItem[] }) {
  return (
    <Widget eyebrow="Attention queue" title="What needs Karim's attention now">
      <div className="list">
        {items.length ? items.map((item) => (
          <div className="row attentionRow" key={item.id}>
            <div><strong>{item.title}</strong><span>{item.detail}</span></div>
            <em className={`pill ${item.severity}`}>{item.source}</em>
          </div>
        )) : <p className="emptyState">No urgent live records require executive attention. Keep the command center open as work, approvals, agent activity, and health signals arrive.</p>}
      </div>
    </Widget>
  );
}
