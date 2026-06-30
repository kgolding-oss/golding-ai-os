export type KnowledgeProviderId = "google-drive" | "gmail" | "local-files" | "supabase-documents" | string;
export type KnowledgeProviderStatus = "available" | "not_implemented" | "degraded" | "offline";

export type KnowledgeDocument = {
  id: string;
  providerId: KnowledgeProviderId;
  title: string;
  sourceUri?: string;
  mimeType?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  providerId: KnowledgeProviderId;
  content: string;
  ordinal: number;
  metadata?: Record<string, unknown>;
};

export type KnowledgeSearchQuery = {
  query: string;
  providerIds?: KnowledgeProviderId[];
  limit?: number;
};

export type KnowledgeSearchResult = {
  providerId: KnowledgeProviderId;
  document: KnowledgeDocument;
  chunk?: KnowledgeChunk;
  score?: number;
  excerpt?: string;
};

export type KnowledgeIndexRequest = {
  document: KnowledgeDocument;
  chunks?: KnowledgeChunk[];
};

export type KnowledgeProviderMetadata = {
  id: KnowledgeProviderId;
  name: string;
  description: string;
  status: KnowledgeProviderStatus;
  indexedDocumentCount: number;
  lastSyncAt: string | null;
};

export type KnowledgeProviderResponse<T> = {
  ok: boolean;
  data: T;
  message?: string;
};
