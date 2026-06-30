export type KnowledgeProviderId = "google-drive" | "gmail" | "local-files" | "supabase-documents" | string;
export type KnowledgeProviderStatus = "available" | "not_implemented" | "degraded" | "offline";
export type MemoryStatus = "draft" | "indexed" | "stale" | "archived" | "failed";
export type IndexingStatus = "pending" | "normalizing" | "extracting_metadata" | "chunking" | "validated" | "indexed" | "failed";

export type KnowledgePermission = { subjectType: "user" | "organization" | "role" | "agent" | "public"; subjectId: string; actions: Array<"read" | "write" | "index" | "admin"> };
export type KnowledgeMetadata = Record<string, string | number | boolean | null | string[] | number[] | Record<string, unknown>>;

export type MemoryObject = {
  id: string;
  organizationId: string;
  sourceProvider: KnowledgeProviderId;
  sourceIdentifier: string;
  title: string;
  content: string;
  summary: string;
  metadata: KnowledgeMetadata;
  labels: string[];
  tags: string[];
  permissions: KnowledgePermission[];
  owner: string;
  created: string;
  updated: string;
  checksum: string;
  version: number;
  status: MemoryStatus;
};

export type KnowledgeDocument = {
  id: string;
  providerId: KnowledgeProviderId;
  title: string;
  sourceUri?: string;
  mimeType?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

export type KnowledgeChunk = { id: string; documentId: string; providerId: KnowledgeProviderId; content: string; ordinal: number; checksum?: string; metadata?: Record<string, unknown> };
export type KnowledgeSearchQuery = { query: string; organizationId?: string; providerIds?: KnowledgeProviderId[]; tags?: string[]; metadata?: Record<string, string | number | boolean>; requesterId?: string; requesterRoles?: string[]; limit?: number };
export type KnowledgeSearchResult = { providerId: KnowledgeProviderId; document: KnowledgeDocument; memory?: MemoryObject; chunk?: KnowledgeChunk; score: number; excerpt: string; matchedFields: string[] };
export type KnowledgeIndexRequest = { document?: KnowledgeDocument; memory?: MemoryObject; chunks?: KnowledgeChunk[] };
export type KnowledgeProviderMetadata = { id: KnowledgeProviderId; name: string; description: string; status: KnowledgeProviderStatus; indexedDocumentCount: number; lastSyncAt: string | null; stale?: boolean; searchable?: boolean };
export type KnowledgeProviderResponse<T> = { ok: boolean; data: T; message?: string };

export interface MemoryProvider { readonly metadata: KnowledgeProviderMetadata; listMemory(organizationId?: string): Promise<KnowledgeProviderResponse<MemoryObject[]>>; getMemory(id: string): Promise<KnowledgeProviderResponse<MemoryObject | null>>; upsertMemory(memory: MemoryObject): Promise<KnowledgeProviderResponse<MemoryObject>>; }
export interface SearchProvider { readonly metadata: KnowledgeProviderMetadata; search(query: KnowledgeSearchQuery): Promise<KnowledgeProviderResponse<KnowledgeSearchResult[]>>; }
export interface IndexingProvider { readonly metadata: KnowledgeProviderMetadata; index(request: KnowledgeIndexRequest): Promise<KnowledgeProviderResponse<IndexingJob>>; listJobs(): KnowledgeProviderResponse<IndexingJob[]>; }
export type IndexingJob = { id: string; memoryId: string; organizationId: string; providerId: KnowledgeProviderId; status: IndexingStatus; errors: string[]; startedAt: string; completedAt: string | null; chunks: KnowledgeChunk[] };
export type KnowledgeHealthReport = { providers: { memory: KnowledgeProviderMetadata[]; search: KnowledgeProviderMetadata[]; indexing: KnowledgeProviderMetadata[] }; indexedDocuments: number; staleProviders: KnowledgeProviderMetadata[]; failedIndexingJobs: IndexingJob[]; cacheHealth: "empty" | "healthy" | "stale"; synchronizationStatus: "idle" | "ready" | "degraded"; readinessScore: number; generatedAt: string };
