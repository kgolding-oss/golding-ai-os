import { KnowledgeCache } from "../cache";
import { summarizeSync } from "../sync";
import type { KnowledgeHealthReport } from "../types";
import type { KnowledgeRegistry } from "../registry";

const cache = new KnowledgeCache<string>();

export function buildKnowledgeHealthReport(registry: KnowledgeRegistry, now = new Date().toISOString()): KnowledgeHealthReport {
  const memory = registry.listMemoryProviders();
  const search = registry.listSearchProviders();
  const indexing = registry.listIndexingProviders();
  const failedIndexingJobs = registry.listIndexingJobs().filter((job) => job.status === "failed");
  const staleProviders = summarizeSync([...memory, ...search, ...indexing]).staleProviders;
  const indexedDocuments = memory.reduce((sum, provider) => sum + provider.indexedDocumentCount, 0);
  const penalties = staleProviders.length * 10 + failedIndexingJobs.length * 10;
  return { providers: { memory, search, indexing }, indexedDocuments, staleProviders, failedIndexingJobs, cacheHealth: cache.snapshot().status, synchronizationStatus: summarizeSync([...memory, ...search, ...indexing]).status, readinessScore: Math.max(0, Math.min(100, 100 - penalties)), generatedAt: now };
}
