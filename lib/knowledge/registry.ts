import type { KnowledgeProvider } from "./provider";
import { searchKnowledgeProviders } from "./search";
import type { IndexingProvider, KnowledgeDocument, KnowledgeProviderId, KnowledgeProviderMetadata, KnowledgeProviderResponse, KnowledgeSearchQuery, KnowledgeSearchResult, MemoryProvider, SearchProvider } from "./types";
import { GmailKnowledgeProvider, GoogleDriveKnowledgeProvider, LocalFilesKnowledgeProvider, SupabaseDocumentsKnowledgeProvider } from "./providers/stubs";
import { FinanceKnowledgeProvider } from "../agents/finance-operations/finance-memory";
import { OperationalKnowledgeProvider } from "./providers/operational";

export class KnowledgeRegistry {
  private memoryProviders = new Map<KnowledgeProviderId, MemoryProvider>();
  private searchProviders = new Map<KnowledgeProviderId, SearchProvider>();
  private indexingProviders = new Map<KnowledgeProviderId, IndexingProvider>();

  register(provider: KnowledgeProvider) { return this.registerMemoryProvider(provider).registerSearchProvider(provider).registerIndexingProvider(provider); }
  registerMemoryProvider(provider: MemoryProvider) { this.memoryProviders.set(provider.metadata.id, provider); return this; }
  registerSearchProvider(provider: SearchProvider) { this.searchProviders.set(provider.metadata.id, provider); return this; }
  registerIndexingProvider(provider: IndexingProvider) { this.indexingProviders.set(provider.metadata.id, provider); return this; }
  listProviders(): KnowledgeProviderMetadata[] { return this.listMemoryProviders(); }
  listMemoryProviders() { return Array.from(this.memoryProviders.values()).map((provider) => provider.metadata); }
  listSearchProviders() { return Array.from(this.searchProviders.values()).map((provider) => provider.metadata); }
  listIndexingProviders() { return Array.from(this.indexingProviders.values()).map((provider) => provider.metadata); }
  getProvider(providerId: KnowledgeProviderId) { return this.memoryProviders.get(providerId) ?? this.searchProviders.get(providerId) ?? this.indexingProviders.get(providerId) ?? null; }
  health() { const providers = [...this.listMemoryProviders(), ...this.listSearchProviders(), ...this.listIndexingProviders()]; return { ok: providers.every((p) => p.status !== "offline"), providers, message: `${providers.length} Knowledge OS provider registrations are available.` }; }
  async listDocuments(): Promise<KnowledgeProviderResponse<KnowledgeDocument[]>> { return { ok: true, data: [], message: "Document listing is provider-owned and no external providers are connected." }; }
  async search(query: KnowledgeSearchQuery): Promise<KnowledgeProviderResponse<KnowledgeSearchResult[]>> { const data = await searchKnowledgeProviders(Array.from(this.searchProviders.values()), query); return { ok: true, data, message: "Aggregated registered Knowledge OS search providers." }; }
  listIndexingJobs() { return Array.from(this.indexingProviders.values()).flatMap((provider) => provider.listJobs().data); }
}

export function createDefaultKnowledgeRegistry() { return new KnowledgeRegistry().register(new GoogleDriveKnowledgeProvider()).register(new GmailKnowledgeProvider()).register(new LocalFilesKnowledgeProvider()).register(new SupabaseDocumentsKnowledgeProvider()).register(new FinanceKnowledgeProvider()).register(new OperationalKnowledgeProvider()); }
export const knowledgeRegistry = createDefaultKnowledgeRegistry();
