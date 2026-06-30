import type { IndexingJob, IndexingProvider, KnowledgeDocument, KnowledgeIndexRequest, KnowledgeProviderMetadata, KnowledgeProviderResponse, KnowledgeSearchQuery, KnowledgeSearchResult, MemoryObject, MemoryProvider, SearchProvider } from "./types";

export interface KnowledgeProvider extends MemoryProvider, SearchProvider, IndexingProvider {
  readonly metadata: KnowledgeProviderMetadata;
  listDocuments(): Promise<KnowledgeProviderResponse<KnowledgeDocument[]>>;
  getDocument(documentId: string): Promise<KnowledgeProviderResponse<KnowledgeDocument | null>>;
  refresh(): Promise<KnowledgeProviderResponse<KnowledgeProviderMetadata>>;
}

export abstract class NotImplementedKnowledgeProvider implements KnowledgeProvider {
  abstract readonly metadata: KnowledgeProviderMetadata;
  protected notImplemented<T>(data: T, action: string): KnowledgeProviderResponse<T> { return { ok: false, data, message: `${this.metadata.name} ${action} is not implemented yet.` }; }
  async listDocuments() { return this.notImplemented<KnowledgeDocument[]>([], "document listing"); }
  async getDocument(_documentId: string) { return this.notImplemented<KnowledgeDocument | null>(null, "document retrieval"); }
  async search(_query: KnowledgeSearchQuery) { return this.notImplemented<KnowledgeSearchResult[]>([], "search"); }
  async index(request: KnowledgeIndexRequest) { return this.notImplemented<IndexingJob>({ id: `idx_${request.memory?.id ?? request.document?.id ?? "unknown"}`, memoryId: request.memory?.id ?? request.document?.id ?? "unknown", organizationId: request.memory?.organizationId ?? "unknown", providerId: request.memory?.sourceProvider ?? request.document?.providerId ?? this.metadata.id, status: "pending", errors: ["Provider indexing is not implemented."], startedAt: new Date(0).toISOString(), completedAt: null, chunks: request.chunks ?? [] }, "indexing"); }
  listJobs() { return this.notImplemented<IndexingJob[]>([], "indexing jobs"); }
  async listMemory(_organizationId?: string) { return this.notImplemented<MemoryObject[]>([], "memory listing"); }
  async getMemory(_id: string) { return this.notImplemented<MemoryObject | null>(null, "memory retrieval"); }
  async upsertMemory(memory: MemoryObject) { return this.notImplemented<MemoryObject>(memory, "memory upsert"); }
  async refresh() { return this.notImplemented<KnowledgeProviderMetadata>(this.metadata, "refresh"); }
}
