import type { KnowledgeProvider } from "./provider";
import { searchKnowledgeProviders } from "./search";
import type { KnowledgeDocument, KnowledgeProviderId, KnowledgeProviderMetadata, KnowledgeProviderResponse, KnowledgeSearchQuery, KnowledgeSearchResult } from "./types";
import { GmailKnowledgeProvider, GoogleDriveKnowledgeProvider, LocalFilesKnowledgeProvider, SupabaseDocumentsKnowledgeProvider } from "./providers/stubs";

export class KnowledgeRegistry {
  private providers = new Map<KnowledgeProviderId, KnowledgeProvider>();

  register(provider: KnowledgeProvider) {
    this.providers.set(provider.metadata.id, provider);
    return this;
  }

  listProviders(): KnowledgeProviderMetadata[] {
    return Array.from(this.providers.values()).map((provider) => provider.metadata);
  }

  getProvider(providerId: KnowledgeProviderId) {
    return this.providers.get(providerId) ?? null;
  }

  async listDocuments(): Promise<KnowledgeProviderResponse<KnowledgeDocument[]>> {
    const responses = await Promise.all(Array.from(this.providers.values()).map((provider) => provider.listDocuments()));
    return { ok: responses.every((response) => response.ok), data: responses.flatMap((response) => response.data), message: "Aggregated registered knowledge providers." };
  }

  async search(query: KnowledgeSearchQuery): Promise<KnowledgeProviderResponse<KnowledgeSearchResult[]>> {
    const data = await searchKnowledgeProviders(Array.from(this.providers.values()), query);
    return { ok: true, data, message: "Aggregated registered knowledge providers." };
  }
}

export function createDefaultKnowledgeRegistry() {
  return new KnowledgeRegistry()
    .register(new GoogleDriveKnowledgeProvider())
    .register(new GmailKnowledgeProvider())
    .register(new LocalFilesKnowledgeProvider())
    .register(new SupabaseDocumentsKnowledgeProvider());
}

export const knowledgeRegistry = createDefaultKnowledgeRegistry();
