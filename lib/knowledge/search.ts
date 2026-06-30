import type { SearchProvider } from "./types";
import type { KnowledgeSearchQuery, KnowledgeSearchResult } from "./types";

export async function searchKnowledgeProviders(providers: SearchProvider[], query: KnowledgeSearchQuery): Promise<KnowledgeSearchResult[]> {
  const selected = query.providerIds?.length ? providers.filter((provider) => query.providerIds?.includes(provider.metadata.id)) : providers;
  const results = await Promise.all(selected.map((provider) => provider.search(query)));
  return results.flatMap((result) => result.data).sort((a, b) => b.score - a.score).slice(0, query.limit ?? 10);
}
