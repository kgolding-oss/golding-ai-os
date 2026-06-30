import type { KnowledgeDocument, KnowledgeIndexRequest, KnowledgeProviderMetadata, KnowledgeProviderResponse, KnowledgeSearchQuery, KnowledgeSearchResult } from "./types";

export interface KnowledgeProvider {
  readonly metadata: KnowledgeProviderMetadata;
  listDocuments(): Promise<KnowledgeProviderResponse<KnowledgeDocument[]>>;
  getDocument(documentId: string): Promise<KnowledgeProviderResponse<KnowledgeDocument | null>>;
  search(query: KnowledgeSearchQuery): Promise<KnowledgeProviderResponse<KnowledgeSearchResult[]>>;
  index(request: KnowledgeIndexRequest): Promise<KnowledgeProviderResponse<KnowledgeDocument>>;
  refresh(): Promise<KnowledgeProviderResponse<KnowledgeProviderMetadata>>;
}

export abstract class NotImplementedKnowledgeProvider implements KnowledgeProvider {
  abstract readonly metadata: KnowledgeProviderMetadata;

  protected notImplemented<T>(data: T, action: string): KnowledgeProviderResponse<T> {
    return { ok: false, data, message: `${this.metadata.name} ${action} is not implemented yet.` };
  }

  async listDocuments() { return this.notImplemented<KnowledgeDocument[]>([], "document listing"); }
  async getDocument(_documentId: string) { return this.notImplemented<KnowledgeDocument | null>(null, "document retrieval"); }
  async search(_query: KnowledgeSearchQuery) { return this.notImplemented<KnowledgeSearchResult[]>([], "search"); }
  async index(request: KnowledgeIndexRequest) { return this.notImplemented<KnowledgeDocument>(request.document, "indexing"); }
  async refresh() { return this.notImplemented<KnowledgeProviderMetadata>(this.metadata, "refresh"); }
}
