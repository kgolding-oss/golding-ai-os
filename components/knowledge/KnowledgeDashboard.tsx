import type { KnowledgeHealthReport } from "../../lib/knowledge/types";
import { Widget } from "../dashboard/Widget";

export function KnowledgeDashboard({ health }: { health: KnowledgeHealthReport }) {
  const searchableSources = health.providers.search.filter((provider) => provider.searchable !== false);
  return (
    <Widget eyebrow="Knowledge OS" title="Shared memory foundation">
      <div className="list compactList">
        <div className="row"><div><strong>Provider health</strong><span>{health.providers.memory.length} memory · {health.providers.search.length} search · {health.providers.indexing.length} index providers</span></div><em>{health.readinessScore}% ready</em></div>
        <div className="row"><div><strong>Indexing health</strong><span>{health.indexedDocuments} indexed documents · {health.failedIndexingJobs.length} failed jobs</span></div><em>{health.failedIndexingJobs.length ? "needs review" : "clear"}</em></div>
        <div className="row"><div><strong>Memory statistics</strong><span>{health.indexedDocuments ? "Organization memory is indexed." : "No indexed memory objects yet."}</span></div><em>{health.generatedAt}</em></div>
        <div className="row"><div><strong>Searchable sources</strong><span>{searchableSources.length ? searchableSources.map((provider) => provider.name).join(", ") : "No searchable sources are connected yet."}</span></div><em>{searchableSources.length} sources</em></div>
        <div className="row"><div><strong>Cache status</strong><span>Knowledge cache is deterministic and internal.</span></div><em>{health.cacheHealth}</em></div>
        <div className="row"><div><strong>Synchronization</strong><span>{health.staleProviders.length ? `${health.staleProviders.length} stale providers` : "No stale providers reported."}</span></div><em>{health.synchronizationStatus}</em></div>
      </div>
      <p className="activityHint">Provider integrations are registered as architecture stubs; external APIs, embeddings, and vector databases are intentionally deferred.</p>
    </Widget>
  );
}
