import type { KnowledgeProviderMetadata } from "../../lib/knowledge/types";
import { Widget } from "../dashboard/Widget";

export function KnowledgeDashboard({ providers }: { providers: KnowledgeProviderMetadata[] }) {
  return (
    <Widget eyebrow="Knowledge platform" title="Knowledge sources">
      <div className="list compactList">
        {providers.map((provider) => (
          <div className="row" key={provider.id}>
            <div><strong>{provider.name}</strong><span>{provider.description}</span></div>
            <em>{provider.status} · {provider.indexedDocumentCount} indexed · {provider.lastSyncAt ?? "not synced"}</em>
          </div>
        ))}
      </div>
      <p className="activityHint">Provider integrations are registered as architecture stubs; external indexing is intentionally deferred.</p>
    </Widget>
  );
}
