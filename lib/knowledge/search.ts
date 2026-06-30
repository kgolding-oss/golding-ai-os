import type { KnowledgeProvider } from "./provider";
import type { KnowledgeSearchQuery, KnowledgeSearchResult } from "./types";

export async function searchKnowledgeProviders(providers: KnowledgeProvider[], query: KnowledgeSearchQuery): Promise<KnowledgeSearchResult[]> {
  const selected = query.providerIds?.length ? providers.filter((provider) => query.providerIds?.includes(provider.metadata.id)) : providers;
  const results = await Promise.all(selected.map((provider) => provider.search(query)));
  return results.flatMap((result) => result.data).slice(0, query.limit ?? 10);
}
